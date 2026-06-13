from __future__ import annotations
import csv
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

import duckdb
import markdown as md
from jinja2 import Environment, FileSystemLoader, select_autoescape
from rich.console import Console

from .config import CatalogConfig
from .db import get_all_collections, get_all_items

console = Console()


def _render_md(text: str | None) -> str:
    if not text:
        return ""
    return md.markdown(text, extensions=["nl2br"])


def _make_env(templates_dir: Path) -> Environment:
    env = Environment(
        loader=FileSystemLoader(str(templates_dir)),
        autoescape=select_autoescape(["html"]),
    )
    env.filters["md"] = _render_md
    return env


def _render_page(env: Environment, template_name: str, out_path: Path, ctx: dict) -> None:
    tmpl = env.get_template(template_name)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(tmpl.render(**ctx), encoding="utf-8")


def _json_field(value):
    if isinstance(value, str):
        return json.loads(value)
    return value if value is not None else []


def _output_relative_url(path: str | None, repo_root: Path, output_dir: Path, base_url: str) -> str:
    if not path:
        return ""
    p = Path(path)
    try:
        rel = p.relative_to(output_dir.relative_to(repo_root))
    except ValueError:
        rel = p
    return base_url.rstrip("/") + "/" + str(rel)


def _enrich_item(item: dict, repo_root: Path, output_dir: Path, base_url: str) -> dict:
    item["tags"] = _json_field(item.get("tags"))
    item["raw_meta"] = _json_field(item.get("raw_meta")) or {}
    other_files = _json_field(item.get("other_files"))
    item["other_files"] = other_files

    item["preview_url"] = _output_relative_url(item.get("preview_path"), repo_root, output_dir, base_url)
    item["download_urls"] = [
        {"name": Path(f).name, "url": _output_relative_url(f, repo_root, output_dir, base_url)}
        for f in other_files
    ]

    if not item.get("title"):
        item["title"] = item["id"].replace("-", " ").title()

    return item


def build_site(conn: duckdb.DuckDBPyConnection, cfg: CatalogConfig, repo_root: Path) -> None:
    out_dir = repo_root / cfg.paths.output_dir
    templates_dir = repo_root / "templates"
    assets_src = templates_dir / "assets"

    if not templates_dir.exists():
        console.print("[red]error[/red] templates/ directory not found")
        return

    env = _make_env(templates_dir)
    base_url = cfg.site.base_url

    # Copy static assets
    assets_dst = out_dir / "assets"
    if assets_src.exists():
        if assets_dst.exists():
            shutil.rmtree(assets_dst)
        shutil.copytree(assets_src, assets_dst)

    items = get_all_items(conn)
    collections = get_all_collections(conn)

    for item in items:
        _enrich_item(item, repo_root, out_dir, base_url)

    ctx_base = {
        "site": cfg.site,
        "now": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "total_items": len(items),
        "total_collections": len(collections),
    }

    # --- Index page ---
    _render_page(
        env, "index.html",
        out_dir / "index.html",
        {**ctx_base, "items": items, "collections": collections},
    )

    # --- Per-item pages ---
    for item in items:
        siblings = []
        if item.get("collection_id"):
            siblings = [
                i for i in items
                if i.get("collection_id") == item["collection_id"] and i["id"] != item["id"]
            ][:3]
        _render_page(
            env, "item.html",
            out_dir / "items" / item["id"] / "index.html",
            {**ctx_base, "item": item, "siblings": siblings},
        )

    # --- Table page + CSV ---
    table_dir = out_dir / "table"
    csv_path = table_dir / "data.csv"
    table_dir.mkdir(parents=True, exist_ok=True)
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        fieldnames = ["id", "title", "tags", "collection_id", "ingested_at"]
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for item in items:
            row = {k: item.get(k) for k in fieldnames}
            row["tags"] = ", ".join(row["tags"] or [])
            writer.writerow(row)
    _render_page(
        env, "table.html",
        table_dir / "index.html",
        {**ctx_base, "items": items, "csv_url": f"{base_url.rstrip('/')}/table/data.csv"},
    )

    # --- Collections index + per-collection pages ---
    cols_with_meta = []
    for col in collections:
        col_items = [i for i in items if i.get("collection_id") == col["id"]]
        cover_url = ""
        if col.get("cover_item_id"):
            cover_item = next((i for i in items if i["id"] == col["cover_item_id"]), None)
            if cover_item:
                cover_url = cover_item.get("preview_url", "")
        elif col_items:
            cover_url = col_items[0].get("preview_url", "")
        cols_with_meta.append({**col, "item_count": len(col_items), "cover_url": cover_url})

        _render_page(
            env, "collection.html",
            out_dir / "collections" / col["id"] / "index.html",
            {**ctx_base, "collection": col, "items": col_items},
        )

    collections_dir = out_dir / "collections"
    collections_dir.mkdir(parents=True, exist_ok=True)

    # Clean stale collection directories
    valid_ids = {col["id"] for col in collections}
    for d in collections_dir.iterdir():
        if d.is_dir() and d.name not in valid_ids:
            shutil.rmtree(d)

    _render_page(
        env, "collections.html",
        collections_dir / "index.html",
        {**ctx_base, "collections": cols_with_meta},
    )

    # --- Search index ---
    data_dir = out_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    search_index = [
        {
            "id": item["id"],
            "title": item["title"],
            "tags": item["tags"],
            "collection_id": item.get("collection_id"),
            "preview_url": item.get("preview_url"),
        }
        for item in items
    ]
    (data_dir / "search-index.json").write_text(
        json.dumps(search_index, default=str, ensure_ascii=False), encoding="utf-8"
    )

    console.print(f"[green]✓[/green] site built → {out_dir}/")
