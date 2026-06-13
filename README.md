# CatalogCanvas

A domain-agnostic ingestion and static-site-generator pipeline. Drop any files into an ingestion folder, curate metadata via TOML overrides, and generate a static catalog site.

## Layout

```
config/                  example config files (copy to config.toml / catalog.toml)
ingestion/                drop input items here (configurable via [paths] ingestion_dir)
output/                   generated site + per-item assets (configurable via [paths] output_dir)
templates/                Jinja2 templates for the static site
llm_description/          LLM-based per-item description generator (see below)
pipeline/                 uv project: catalogcanvas CLI (catalog init, ...)
```

## Setup

Install dependencies, then run the interactive configuration wizard:

```bash
uv sync --project pipeline
uv run --project pipeline catalog init
```

This asks for the catalog title, input/output folders, database path, optional backup folder, build settings, and LLM provider/model/prompt preferences, then writes `config/config.toml`. Re-run `catalog init` any time to update the configuration (it will ask before overwriting).

## Ingestion

Each item is a ZIP file dropped into `ingestion/` (or wherever `[paths] ingestion_dir` points). Run:

```bash
uv run --project pipeline catalog ingest [--file PATH] [--force]
```

- Without `--file`, all `*.zip` files in the ingestion folder are processed.
- Each ZIP is assigned a unique item ID (`<random-word>-<3-digit-number>`, e.g. `quartz-482`), checked against the database to avoid collisions.
- The ZIP's content hash is recorded; re-running `catalog ingest` skips ZIPs already ingested unless `--force` is passed.
- One image inside the ZIP is chosen as the preview and converted to `preview.webp`, by priority **png > jpeg > tiff > svg**. If multiple images share the top priority type, the first one (by zip order) is used and a note is printed.
- All other files (including any non-chosen images) are copied into `other/` alongside the preview; set `[ingest] compress_other_files = true` in `config/config.toml` to lz4-compress them.
- A `metadata.json` or `metadata.toml` file inside the ZIP is parsed and stored as `raw_meta`.
- Per-item overrides (title, tags, note, collection) can be set in `config/catalog.toml`, keyed by the ZIP's content hash or filename stem — see `config/catalog.toml.example`.

Results are stored in the DuckDB database at `[paths] db_path` (`items` and `collections` tables), and per-item assets land in `output/items/<id>/`.

## Building the site

Once items are ingested, generate the static catalog site:

```bash
uv run --project pipeline catalog build
```

This renders Jinja2 templates from `templates/` into `[paths] output_dir` (default `output/`):

- `index.html` — landing page with item grid, collection pills, and live search
- `items/<id>/index.html` — per-item detail page (preview, tags, `note`, downloads for accessory files including any metadata file, related items)
- `collections/index.html` and `collections/<id>/index.html` — collection listing and per-collection item grids
- `table/index.html` and `table/data.csv` — sortable/filterable table view with CSV export
- `data/search-index.json` — search index consumed by client-side search (`assets/js/search.js`)
- `assets/` — copied from `templates/assets/` (CSS/JS, shared across builds)

Re-running `catalog build` regenerates all of the above; per-item assets under `output/items/<id>/` produced by `catalog ingest` (previews, accessory files) are left untouched.

To preview locally:

```bash
python3 -m http.server --directory output
```

To deploy, host the contents of `output/` on any static file host (GitHub Pages, S3, Netlify, etc.). If the site is served from a subpath (e.g. GitHub Pages project sites at `https://user.github.io/repo/`), set `[site] base_url = "/repo"` in `config/config.toml` (via `catalog init`) before building so internal links resolve correctly.

## LLM item descriptions

`llm_description/` generates per-item descriptions using a vision-capable LLM (local, e.g. LM Studio or Ollama, or any remote OpenAI-compatible API such as OpenAI, Anthropic, or Gemini).

```bash
bash llm_description/describe.sh [--force]
```

Configuration precedence: environment variables > `config/config.toml` `[llm]` section (written by `catalog init`) > hardcoded defaults for local LM Studio.

| Variable | `[llm]` key | Default | Purpose |
|---|---|---|---|
| `LLM_MODEL` | `model` | `google/gemma-4-12b-qat` | model name passed to the API |
| `LLM_API_URL` | `api_url` | `http://localhost:1234/v1/chat/completions` | OpenAI-compatible chat completions endpoint |
| `LLM_ITEM_TYPE` | `item_type` | `image` | substituted into `{item_type}` in the prompt |
| `LLM_SUMMARY_FOCUS` | `summary_focus` | `the item's notable characteristics` | substituted into `{summary_focus}` in the prompt |
| `LLM_API_KEY_ENV` | `api_key_env` | _(none)_ | name of an env var holding an API key, sent as `Authorization: Bearer <key>` |
| `LLM_PROMPT_FILE` | _(none)_ | `llm_description/prompt.template.toml` | prompt template (TOML) |

The script loops over `output/items/*/preview.webp`, calls the LLM for each, and merges results into `llm_description/llm_descriptions.json`. Items already present in that file are skipped unless `--force` is passed.

Example for a remote OpenAI-compatible endpoint with custom focus, overriding `config/config.toml` for one run:

```bash
LLM_API_URL="https://api.example.com/v1/chat/completions" \
LLM_MODEL="gpt-4o-mini" \
LLM_ITEM_TYPE="product photo" \
LLM_SUMMARY_FOCUS="the product's condition and notable features" \
LLM_API_KEY_ENV="OPENAI_API_KEY" \
bash llm_description/describe.sh
```

To customize the prompt structure itself, edit `llm_description/prompt.template.toml`.
