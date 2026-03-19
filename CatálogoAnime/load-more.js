(function () {
  const API_BASE = "https://api.jikan.moe/v4/anime";
  const path = window.location.pathname.toLowerCase();
  const isCatalog = path.includes("catalogo");
  const grid = document.querySelector("section[aria-label='Grid de anime']");
  const loadBtn = Array.from(document.querySelectorAll("button"))
    .find((b) => (b.textContent || "").toLowerCase().includes("cargar"));

  if (!grid || !loadBtn) return;

  const cols = 5;
  const batchRows = 3;
  const batchSize = cols * batchRows;

  let page = 1;
  let lastPage = null;
  let loading = false;
  const seen = new Set();

  function norm(v) {
    return String(v || "").toLowerCase().trim();
  }

  function hydrateSeen() {
    grid.querySelectorAll("[data-anime-card]").forEach((card) => {
      const title = card.getAttribute("data-title") || card.querySelector("h3,h4,h5")?.textContent || "";
      if (title) seen.add(norm(title));
    });
  }

  function setGenres(card, item) {
    const wrap = card.querySelector(".flex.flex-wrap.gap-2");
    if (!wrap) return;
    wrap.innerHTML = "";
    const genres = (item?.genres || []).map((g) => g?.name).filter(Boolean).slice(0, 2);
    genres.forEach((g) => {
      const span = document.createElement("span");
      span.className = "text-xs font-bold uppercase tracking-widest text-primary bg-primary/15 px-3 py-1 rounded-full";
      span.textContent = g;
      wrap.appendChild(span);
    });
  }

  function setYear(card, item) {
    const year = item?.year || item?.aired?.prop?.from?.year || "";
    if (!year) return;
    card.setAttribute("data-year", String(year));
    const yearEl = card.querySelector("[data-card-year]");
    if (yearEl) {
      yearEl.textContent = String(year);
      return;
    }
    const p = card.querySelector("p");
    if (!p) return;
    const span = document.createElement("span");
    span.dataset.cardYear = "1";
    span.className = "block text-xs text-on-surface-variant/80 mt-0.5";
    span.textContent = String(year);
    p.insertAdjacentElement("afterend", span);
  }

  function setStudio(card, item) {
    const p = card.querySelector("p");
    if (!p) return;
    const studio = (item?.studios || [])[0]?.name || "Estudio";
    p.textContent = `Estudio: ${studio}`;
  }

  function buildCard(item) {
    const base = grid.querySelector("[data-anime-card]");
    if (!base) return null;
    const card = base.cloneNode(true);

    const title = item?.title || "Anime";
    const img = card.querySelector("img");
    if (img) {
      const src = item?.images?.webp?.large_image_url || item?.images?.jpg?.large_image_url || item?.images?.jpg?.image_url || img.getAttribute("src");
      if (src) img.setAttribute("src", src);
      img.setAttribute("alt", title);
    }

    const h = card.querySelector("h3,h4,h5");
    if (h) h.textContent = title;

    card.setAttribute("data-title", norm(title));
    card.setAttribute("data-type", isCatalog ? "Pelicula" : "Anime");
    setStudio(card, item);
    setGenres(card, item);
    setYear(card, item);

    return card;
  }

  async function fetchMore() {
    const type = isCatalog ? "movie" : "tv";
    page += 1;
    const url = `${API_BASE}?type=${type}&page=${page}&limit=${batchSize}&order_by=popularity&sort=asc`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    lastPage = json?.pagination?.last_visible_page || lastPage;
    const rows = json?.data || [];
    const unique = [];
    rows.forEach((it) => {
      const t = norm(it?.title);
      if (!t || seen.has(t)) return;
      seen.add(t);
      unique.push(it);
    });
    return unique;
  }

  async function onLoadMore() {
    if (loading) return;
    loading = true;
    loadBtn.disabled = true;
    hydrateSeen();
    const items = await fetchMore();
    items.forEach((it) => {
      const card = buildCard(it);
      if (card) grid.appendChild(card);
    });
    if (items.length < batchSize || (lastPage && page >= lastPage)) loadBtn.remove();
    loadBtn.disabled = false;
    loading = false;
    if (window.AniDexFilters) window.AniDexFilters.init();
  }

  loadBtn.addEventListener("click", onLoadMore);
  // Hide when filters/search are active (set by filters.js)
  window.AniDexLoadMore = {
    hide: () => { if (loadBtn) loadBtn.style.display = "none"; },
    show: () => { if (loadBtn) loadBtn.style.display = ""; }
  };
})();
