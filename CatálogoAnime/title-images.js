(() => {
  const API_BASE = "https://api.jikan.moe/v4/top/anime";
  const cache = {};
  const INDEX_TITLE_ALIASES = {
    "Frieren: Más allá del final del viaje": "Frieren: Beyond Journey's End",
    "Solo Leveling": "Solo Leveling",
    "The Apothecary Diaries": "Kusuriya no Hitorigoto",
    "Undead Unluck": "Undead Unluck",
    "Haikyuu!! Final": "Haikyuu!! Movie: Gomisuteba no Kessen"
  };
  const INDEX_FIXED_BY_TITLE = {
    "Frieren: Más allá del final del viaje": 52991, // Sousou no Frieren
    "Solo Leveling": 52299,
    "The Apothecary Diaries": 54492, // Kusuriya no Hitorigoto
    "Undead Unluck": 52741,
    "Haikyuu!! Final": 20583 // Haikyuu!!
  };

  function imageOf(item) {
    return (
      item?.images?.webp?.large_image_url ||
      item?.images?.jpg?.large_image_url ||
      item?.images?.jpg?.image_url ||
      ""
    );
  }

  async function searchByTitle(title) {
    if (!title) return null;
    try {
      const url =
        "https://api.jikan.moe/v4/anime?q=" +
        encodeURIComponent(title) +
        "&limit=10&order_by=popularity&sort=asc";
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      return (json?.data || [])[0] || null;
    } catch {
      return null;
    }
  }

  function norm(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function allTitles(item) {
    return [
      item?.title,
      item?.title_english,
      item?.title_japanese,
      ...(item?.titles || []).map((t) => t.title)
    ].filter(Boolean);
  }

  async function searchByTitleCanonical(rawTitle) {
    const query = INDEX_TITLE_ALIASES[rawTitle] || rawTitle;
    const base = await searchByTitle(query);
    if (!base) return null;

    try {
      const url =
        "https://api.jikan.moe/v4/anime?q=" +
        encodeURIComponent(query) +
        "&limit=10&order_by=popularity&sort=asc";
      const res = await fetch(url);
      if (!res.ok) return base;
      const json = await res.json();
      const list = json?.data || [];
      const qn = norm(query);
      const exact = list.find((item) =>
        allTitles(item).some((t) => norm(t) === qn || norm(t).includes(qn) || qn.includes(norm(t)))
      );
      return exact || base;
    } catch {
      return base;
    }
  }

  async function fetchByMalId(id) {
    if (!id) return null;
    const key = `id:${id}`;
    if (cache[key]) return cache[key];
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
      if (!res.ok) return null;
      const json = await res.json();
      const item = json?.data || null;
      if (item) cache[key] = item;
      return item;
    } catch {
      return null;
    }
  }

  function trailerOrImageOf(item) {
    return (
      item?.trailer?.images?.maximum_image_url ||
      item?.trailer?.images?.large_image_url ||
      imageOf(item)
    );
  }

  async function fetchTop(type, needed) {
    const key = `${type}:${needed}`;
    if (cache[key]) return cache[key];

    const out = [];
    let page = 1;
    while (out.length < needed && page <= 5) {
      const url =
        `${API_BASE}?filter=bypopularity&type=${encodeURIComponent(type)}&limit=25&page=${page}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const json = await res.json();
      const rows = json?.data || [];
      if (!rows.length) break;
      out.push(...rows);
      page += 1;
    }
    cache[key] = out;
    return out;
  }

  function setTitle(card, title) {
    const h = card.querySelector("h3,h4,h5");
    if (h) h.textContent = title;

    const landscapeTitle = card.querySelector("span.font-bold");
    if (landscapeTitle && !h) landscapeTitle.textContent = title;
  }

  function setMeta(card, item) {
    const p = card.querySelector("p");
    if (!p) return;
    const studio = item?.studios?.[0]?.name || "N/A";
    const year = item?.year ? ` ${item.year}` : "";
    p.textContent = `Studio: ${studio}${year}`;
  }

  function setImage(card, item) {
    const img = card.querySelector("img");
    if (!img) return;
    const title = item?.title || "Anime";
    const src = imageOf(item);
    if (src) img.src = src;
    img.alt = title;
    img.loading = "lazy";
  }

  function setBadge(card, item, type) {
    const badge = card.querySelector("span.absolute.left-3.top-3, span.absolute.left-3.bottom-3");
    if (!badge) return;
    if (type === "movie") {
      const mins = (item?.duration || "").match(/\d+\s*min/i)?.[0] || (item?.duration || "");
      if (mins) badge.textContent = mins.trim();
      return;
    }
    const eps = item?.episodes;
    if (eps) badge.textContent = `${eps} ep`;
  }

  function setScore(card, item) {
    const media = card.querySelector(".relative");
    if (!media) return;
    const scoreValue = typeof item?.score === "number" ? item.score.toFixed(1) : null;
    if (!scoreValue) return;

    let badge = media.querySelector(".anidex-score-badge");
    if (!badge) {
      badge = document.createElement("div");
      badge.className =
        "anidex-score-badge absolute top-3 right-3 bg-surface-container-lowest/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary flex items-center gap-1";
      badge.innerHTML =
        "<span class=\"material-symbols-outlined text-[10px]\" style=\"font-variation-settings: 'FILL' 1;\">star</span><span></span>";
      media.appendChild(badge);
    }
    const valueEl = badge.querySelector("span:last-child");
    if (valueEl) valueEl.textContent = scoreValue;
  }

  function setDataAttrs(card, item, type) {
    if (item?.mal_id) {
      card.setAttribute("data-mal-id", String(item.mal_id));
      const link = card.matches("a") ? card : card.querySelector("a");
      if (link) link.setAttribute("data-mal-id", String(item.mal_id));
    }
    if (!card.hasAttribute("data-anime-card")) return;
    const genres = (item?.genres || []).map((g) => (g?.name || "").toLowerCase()).filter(Boolean);
    card.setAttribute("data-title", (item?.title || "").toLowerCase());
    card.setAttribute("data-genres", genres.join(","));
    card.setAttribute("data-year", String(item?.year || ""));
    card.setAttribute("data-type", type === "movie" ? "Pelicula" : "Anime");
    card.setAttribute("data-status", "Finalizado");
  }

  function applyItemsToCards(cards, items, type) {
    cards.forEach((card, idx) => {
      const item = items[idx];
      if (!item) return;
      setTitle(card, item.title || "Anime");
      setMeta(card, item);
      setImage(card, item);
      setBadge(card, item, type);
      setScore(card, item);
      setDataAttrs(card, item, type);
    });
  }

  async function applyIndexSpecials() {
    // Hero de Frieren
    const heroTitleEl = document.querySelector("h1");
    const heroImg = document.querySelector("section img.hero-mask");
    if (heroTitleEl && heroImg) {
      const title = heroTitleEl.textContent.replace(/\s+/g, " ").trim();
      const fixedId = INDEX_FIXED_BY_TITLE[title];
      let item = fixedId ? await fetchByMalId(fixedId) : await searchByTitleCanonical(title);
      if (!item && /haikyuu/i.test(title)) {
        item = await searchByTitleCanonical("Haikyuu!!");
      }
      const src = trailerOrImageOf(item);
      if (src) heroImg.src = src;
    }

    // Destacados de la temporada
    const seasonal = Array.from(
      document.querySelectorAll("section img[alt*='Destacado']")
    );

    for (const img of seasonal) {
      const card = img.closest(".group.cursor-pointer");
      if (!card) continue;
      const titleEl = card.querySelector("h3,h4");
      const title = titleEl?.textContent?.replace(/\s+/g, " ").trim();
      if (!title) continue;
      const fixedId = INDEX_FIXED_BY_TITLE[title];
      const item = fixedId ? await fetchByMalId(fixedId) : await searchByTitleCanonical(title);
      const src = trailerOrImageOf(item);
      if (src) {
        img.src = src;
        img.alt = title;
      }
    }
  }

  function cardsBySelector(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  async function applyAnimesPage() {
    const cards = cardsBySelector("[data-anime-card]");
    if (!cards.length) return;
    const items = await fetchTop("tv", cards.length);
    applyItemsToCards(cards, items, "tv");
  }

  async function applyCatalogPage() {
    const cards = cardsBySelector("[data-anime-card]");
    if (!cards.length) return;
    const items = await fetchTop("movie", cards.length);
    applyItemsToCards(cards, items, "movie");
  }

  async function applyIndexPage() {
    const tvCards = cardsBySelector("#trending-row .flex-none.group.cursor-pointer");
    const movieCards = cardsBySelector("#movies-row .flex-none.group.cursor-pointer");

    if (tvCards.length) {
      const tvItems = await fetchTop("tv", tvCards.length);
      applyItemsToCards(tvCards, tvItems, "tv");
    }

    if (movieCards.length) {
      const movieItems = await fetchTop("movie", movieCards.length);
      applyItemsToCards(movieCards, movieItems, "movie");
    }
  }

  async function applyDetailPage() {
    const recCards = cardsBySelector("section a.group.cursor-pointer");
    if (!recCards.length) return;
    const items = await fetchTop("tv", recCards.length);
    applyItemsToCards(recCards, items, "tv");
  }

  async function applyUserPage() {
    const userCards = cardsBySelector("main .group.cursor-pointer");
    if (!userCards.length) return;
    const items = await fetchTop("tv", userCards.length);
    applyItemsToCards(userCards, items, "tv");
  }

  window.AniDexTitleImages = {
    async init() {
      const path = (window.location.pathname || "").toLowerCase();
      try {
        if (path.includes("series")) await applyAnimesPage();
        else if (path.includes("catalogo")) await applyCatalogPage();
        else if (path.includes("detail")) await applyDetailPage();
        else if (path.includes("user")) await applyUserPage();
        else {
          await applyIndexPage();
          await applyIndexSpecials();
        }
      } catch {
        // Keep original hardcoded cards if API fails.
      }
    }
  };
})();
