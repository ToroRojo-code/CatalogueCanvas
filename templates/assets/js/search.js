(function () {
  let index = null;
  let allItems = [];
  let debounceTimer = null;

  // Theme toggle
  function initTheme() {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateToggleIcon(next);
  };

  // Search
  function basePath() {
    return window.SITE_BASE_URL || "";
  }

  async function loadIndex() {
    if (index !== null) return;
    try {
      const res = await fetch(basePath() + "/data/search-index.json");
      index = await res.json();
      allItems = index;
    } catch (_) {
      index = [];
    }
  }

  function tokenize(q) {
    return q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  }

  function matchItem(item, tokens) {
    const haystack = [
      item.title, item.collection_id,
      ...(item.tags || []),
    ].join(" ").toLowerCase();
    return tokens.every((t) => haystack.includes(t));
  }

  function renderGrid(items) {
    const grid = document.getElementById("works-grid");
    const count = document.getElementById("works-count");
    if (!grid) return;

    if (count) count.textContent = items.length;

    if (items.length === 0) {
      grid.innerHTML = '<div class="empty-state">No items match your search.</div>';
      return;
    }

    grid.innerHTML = items.map((it) => {
      const thumb = it.preview_url
        ? `<img src="${it.preview_url}" alt="${escHtml(it.title)}" loading="lazy">`
        : `<div class="no-preview">no preview</div>`;
      const tags = (it.tags || []).slice(0, 3)
        .map((t) => `<span class="tag">${escHtml(t)}</span>`).join("");
      return `
        <a class="work-card" href="${basePath()}/items/${it.id}/">
          <div class="work-card-thumb">${thumb}</div>
          <div class="work-card-body">
            <div class="work-card-title">${escHtml(it.title)}</div>
            ${tags ? `<div class="work-card-tags">${tags}</div>` : ""}
          </div>
        </a>`;
    }).join("");
  }

  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  async function onSearch(q) {
    await loadIndex();
    const tokens = tokenize(q);
    const results = tokens.length === 0 ? allItems : allItems.filter((it) => matchItem(it, tokens));
    renderGrid(results);

    // Update URL hash
    if (tokens.length > 0) {
      history.replaceState(null, "", "#q=" + encodeURIComponent(q));
    } else {
      history.replaceState(null, "", location.pathname);
    }
  }

  function initSearch() {
    const inputs = document.querySelectorAll(".search-input");
    inputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => onSearch(e.target.value), 150);
      });
      // Sync inputs
      input.addEventListener("input", (e) => {
        inputs.forEach((other) => {
          if (other !== e.target) other.value = e.target.value;
        });
      });
    });

    // Restore search from hash
    const hash = location.hash;
    if (hash.startsWith("#q=")) {
      const q = decodeURIComponent(hash.slice(3));
      inputs.forEach((i) => (i.value = q));
      onSearch(q);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSearch();
  });
})();
