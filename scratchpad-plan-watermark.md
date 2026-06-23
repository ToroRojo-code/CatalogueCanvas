# Plan — Portfolio watermark (export-only)

## Scope
Burn `©` text into pixels of **exported zip assets only**. Per-portfolio toggle + free text field, no prefill. Live deck unchanged.

## Data model — `server/src/cataloguecanvas/db.py`
- `SCHEMA_SQL` portfolios block (:52) → add
  - `watermark_enabled INTEGER NOT NULL DEFAULT 0`
  - `watermark_text TEXT NOT NULL DEFAULT ''`
- `ensure_schema` (:131) → migration `ALTER TABLE portfolios ADD COLUMN` for both, guarded by `portfolio_cols`.

## Render helper — `server/src/cataloguecanvas/convert.py`
New fn:
```python
watermark_webp(image_bytes: bytes, text: str) -> bytes
```
Pillow. Southeast gravity, +20+20 margin, ~36px font scaled to image, white `rgba(255,255,255,0.5)`. `ImageDraw`, `truetype` with `load_default` fallback. Return webp bytes (quality 85). Empty text → return input unchanged.

## Router — `server/src/cataloguecanvas/routers/portfolios.py`
- `PortfolioCreate` (:78) + `PortfolioUpdate` (:110) → `watermark_enabled: bool`, `watermark_text: str`
- `create_portfolio` (:97) + `update_portfolio` (:131) upsert dicts → include both
- `_enrich_portfolio` (:49) → coerce `watermark_enabled` bool, `watermark_text` str
- `get_public_portfolio` (:229) — no change (live deck un-watermarked)

## Static export — `server/src/cataloguecanvas/static_export.py`
`build_static_site` (:214):
- Read `portfolio["watermark_enabled"]`, `watermark_text`
- Asset write loop (:249): if enabled + text → read `src` bytes, `watermark_webp(...)`, `zf.writestr(rel, burned)`; else current `zf.write(src, rel)`

## Frontend — `web/src/api/client.ts`
- `Portfolio` type → `watermark_enabled: boolean`, `watermark_text: string`
- create/update bodies pass them

## Frontend — `web/src/pages/PortfolioEdit.tsx`
After Theme block (:97), inside `cc-panel`:
- `cc-check` checkbox "Watermark exported images"
- when on: `cc-input` text (empty default), `cc-hint` "Burned into images in the exported zip only."
- add both to `save()` payload (:38)

## Verify
- `uv run` server; new + existing db get cols (migration), default off
- Public portfolio, enable wm + text, export zip → assets burned SE corner
- wm off → assets identical to before
- Live deck preview unaffected

## Files
- `server/src/cataloguecanvas/db.py`
- `server/src/cataloguecanvas/convert.py`
- `server/src/cataloguecanvas/routers/portfolios.py`
- `server/src/cataloguecanvas/static_export.py`
- `web/src/api/client.ts`
- `web/src/pages/PortfolioEdit.tsx`

## After
Per PLAN.md:8 → update changelog `cataloguecanvas-website/inputdoc/cataloguecanvas-features.md` (separate repo).
