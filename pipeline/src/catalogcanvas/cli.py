from __future__ import annotations
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from .config import BuildConfig, CatalogConfig, LLMConfig, PathsConfig, SiteConfig, load_config, save_config

app = typer.Typer(help="CatalogCanvas — generic ingestion & site builder")
console = Console()

REPO_ROOT = Path(__file__).resolve().parents[3]  # pipeline/src/catalogcanvas → repo root
CONFIG_DIR = REPO_ROOT / "config"


@app.callback()
def main():
    pass


@app.command()
def init():
    """Interactively configure this catalog and write config/config.toml."""
    config_path = CONFIG_DIR / "config.toml"
    cfg = load_config(CONFIG_DIR)

    if config_path.exists():
        console.print(f"[yellow]{config_path.relative_to(REPO_ROOT)} already exists.[/yellow]")
        if not typer.confirm("Overwrite it?", default=False):
            console.print("[yellow]aborted[/yellow]")
            raise typer.Exit()

    console.print("\n[bold]Site[/bold]")
    site = SiteConfig(
        title=typer.prompt("Catalog title", default=cfg.site.title),
        description=typer.prompt("Description", default=cfg.site.description),
        author=typer.prompt("Author", default=cfg.site.author),
        base_url=typer.prompt("Base URL (for GitHub Pages, e.g. /my-catalog)", default=cfg.site.base_url),
        theme=cfg.site.theme,
    )

    console.print("\n[bold]Paths[/bold]")
    paths = PathsConfig(
        ingestion_dir=typer.prompt("Input folder", default=cfg.paths.ingestion_dir),
        output_dir=typer.prompt("Output folder", default=cfg.paths.output_dir),
        db_path=typer.prompt("Database path", default=cfg.paths.db_path),
        backup_dir=typer.prompt("Backup folder (leave empty to disable)", default=cfg.paths.backup_dir),
    )

    console.print("\n[bold]Build[/bold]")
    build = BuildConfig(
        items_per_page=typer.prompt("Items per page", default=cfg.build.items_per_page, type=int),
        image_format=typer.prompt("Image format", default=cfg.build.image_format),
        image_scale=typer.prompt("Image scale", default=cfg.build.image_scale, type=float),
    )

    console.print("\n[bold]LLM (item descriptions)[/bold]")
    console.print("[dim]Works with any OpenAI-compatible chat completions API (LM Studio, Ollama, OpenAI, Anthropic, Gemini, etc.)[/dim]")
    llm = LLMConfig(
        provider=typer.prompt("Provider name (label only)", default=cfg.llm.provider),
        api_url=typer.prompt("API URL", default=cfg.llm.api_url),
        model=typer.prompt("Model name", default=cfg.llm.model),
        api_key_env=typer.prompt(
            "Env var holding API key (leave empty if none/local)", default=cfg.llm.api_key_env
        ),
        item_type=typer.prompt("Item type (used in description prompt)", default=cfg.llm.item_type),
        summary_focus=typer.prompt("Summary focus (used in description prompt)", default=cfg.llm.summary_focus),
    )

    new_cfg = CatalogConfig(site=site, build=build, paths=paths, llm=llm)
    written = save_config(CONFIG_DIR, new_cfg)

    table = Table(title="Catalog configuration")
    table.add_column("Section", style="bold")
    table.add_column("Key")
    table.add_column("Value")
    for section_name, section in (
        ("site", site),
        ("build", build),
        ("paths", paths),
        ("llm", llm),
    ):
        for key, value in vars(section).items():
            table.add_row(section_name, key, str(value))
    console.print()
    console.print(table)
    console.print(f"\n[green]✓[/green] wrote {written.relative_to(REPO_ROOT)}")
