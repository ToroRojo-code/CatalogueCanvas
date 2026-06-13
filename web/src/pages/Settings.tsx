import { useEffect, useState } from 'react'
import * as api from '../api/client'
import type { AppSettings } from '../api/client'
import { ApiError } from '../api/client'

export function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.getSettings().then(setSettings).catch((err) => {
      setError(err instanceof ApiError ? err.message : 'failed to load settings')
    })
  }, [])

  if (!settings) return <div className="container empty-state">{error || 'Loading...'}</div>

  const save = async () => {
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      const updated = await api.updateSettings({
        llm_api_url: settings.llm_api_url,
        llm_model: settings.llm_model,
        llm_item_type: settings.llm_item_type,
        llm_summary_focus: settings.llm_summary_focus,
        llm_bullet_count: settings.llm_bullet_count,
        llm_bullet_max_words: settings.llm_bullet_max_words,
        llm_prompt_template: settings.llm_prompt_template,
      })
      setSettings(updated)
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <section className="field" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <h2>LLM defaults</h2>
        <div className="field">
          <label htmlFor="set-llm-api-url">API URL</label>
          <input
            id="set-llm-api-url"
            value={settings.llm_api_url}
            onChange={(e) => setSettings({ ...settings, llm_api_url: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="set-llm-model">Model</label>
          <input
            id="set-llm-model"
            value={settings.llm_model}
            onChange={(e) => setSettings({ ...settings, llm_model: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="set-llm-item-type">Item type</label>
          <input
            id="set-llm-item-type"
            value={settings.llm_item_type}
            onChange={(e) => setSettings({ ...settings, llm_item_type: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="set-llm-summary-focus">Summary focus</label>
          <input
            id="set-llm-summary-focus"
            value={settings.llm_summary_focus}
            onChange={(e) => setSettings({ ...settings, llm_summary_focus: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="set-llm-bullet-count">Bullet points</label>
          <input
            id="set-llm-bullet-count"
            type="number"
            min="1"
            value={settings.llm_bullet_count}
            onChange={(e) => setSettings({ ...settings, llm_bullet_count: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="set-llm-bullet-max-words">Max words per bullet</label>
          <input
            id="set-llm-bullet-max-words"
            type="number"
            min="1"
            value={settings.llm_bullet_max_words}
            onChange={(e) => setSettings({ ...settings, llm_bullet_max_words: e.target.value })}
          />
        </div>
        <button className="btn" onClick={save} disabled={busy} type="button">
          {busy ? 'Saving...' : 'Save'}
        </button>
        {saved && <span style={{ marginLeft: 8 }}>Saved</span>}
        {error && <div className="error-text">{error}</div>}
      </section>

      <section className="field" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <h2>Prompt template</h2>
        <p className="list-row-meta">
          Raw TOML used to build the LLM prompt. Placeholders: {'{item_type}'}, {'{summary_focus}'}, {'{bullet_count}'}, {'{bullet_max_words}'}.
        </p>
        <div className="field">
          <textarea
            id="set-llm-prompt-template"
            rows={16}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={settings.llm_prompt_template}
            onChange={(e) => setSettings({ ...settings, llm_prompt_template: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={save} disabled={busy} type="button">
            {busy ? 'Saving...' : 'Save'}
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => setSettings({ ...settings, llm_prompt_template: settings.llm_prompt_template_default })}
          >
            Reset to default
          </button>
        </div>
      </section>

      <section className="field" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <h2>Backup &amp; export</h2>
        <div className="list-row-meta">
          {settings.stats.total_items} items, {settings.stats.total_collections} collections
          {settings.stats.missing_preview > 0 && `, ${settings.stats.missing_preview} missing preview`}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <a className="btn" href="/api/settings/export/db" download>Download database backup</a>
          <a className="btn" href="/api/settings/export/all" download>Download full backup (db + storage)</a>
        </div>
      </section>
    </div>
  )
}
