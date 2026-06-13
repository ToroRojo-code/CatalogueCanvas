# CatalogCanvas

A domain-agnostic catalog server: ingest ZIP items into a SQLite-backed FastAPI app with a React admin UI, organize them into collections, and share public portfolios.

## Run with Docker (all-in-one)

The `server/` + `web/` apps are packaged as a single Docker image: a FastAPI backend with an embedded SQLite database, serving the React admin UI and public portfolio pages.

```bash
CC_ADMIN_PASSWORD=mysecretpassword CC_SECRET_KEY=$(openssl rand -hex 32) docker compose up --build
```

Then open `http://localhost:8000`:

- Log in with `CC_ADMIN_PASSWORD`.
- Upload ZIP items from the dashboard, edit titles/tags/notes, and organize them into collections.
- Generate per-item descriptions with a vision-capable LLM: in **Settings**, set an OpenAI-compatible `api_url` and model (an API key can also be entered per-request — used only for that request and never stored).
  - If the LLM server (e.g. LM Studio, Ollama) runs on your host machine and CatalogCanvas runs in Docker, use `http://host.docker.internal:1234/v1/chat/completions` (not `localhost`) — `localhost` inside the container refers to the container itself, not your host.
- Create a portfolio, select items, mark it **Public**, and share its `/p/<slug>` link — a slide-deck style presentation viewable without logging in.

All data (the SQLite database and uploaded item assets) is persisted in the `cc-data` Docker volume under `/data`.

## Layout

```
server/                  FastAPI backend (SQLite db, ingestion, LLM descriptions, auth)
web/                     React admin UI + public portfolio pages
legacy/                  deprecated static-site-generator pipeline (unsupported, kept for reference)
```

## Legacy static-site pipeline

`legacy/` contains the original ingestion + static-site-generator workflow (`pipeline/` CLI, Jinja `templates/`, `llm_description/` scripts, `config/` examples). It is **deprecated and unsupported** — use the Docker server above instead. Kept for reference only.
