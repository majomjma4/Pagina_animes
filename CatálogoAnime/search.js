(() => {
  const API_BASE = "https://api.jikan.moe/v4/anime";
  const suggestCache = new Map();
  const hasJapaneseChars = (v) => /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(v || "");

  const normalize = (value) =>
    (value || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const scoreMatch = (query, candidate) => {
    const q = normalize(query);
    const c = normalize(candidate);
    if (!q || !c) return 0;
    if (q === c) return 100;
    if (c.includes(q) || q.includes(c)) return 80;
    const qTokens = q.split(" ");
    const cTokens = c.split(" ");
    const overlap = qTokens.filter((t) => cTokens.includes(t)).length;
    if (!overlap) return 0;
    return Math.round((overlap / Math.max(qTokens.length, cTokens.length)) * 70);
  };

  const tokenMatchScore = (query, candidate) => {
    const qTokens = normalize(query).split(" ").filter(Boolean);
    const c = normalize(candidate);
    if (!qTokens.length || !c) return 0;
    const matched = qTokens.filter((t) => c.includes(t)).length;
    return matched / qTokens.length;
  };

  const getCardTitle = (card) => {
    const dataTitle = card.getAttribute("data-title");
    if (dataTitle) return dataTitle;
    const h = card.querySelector("h3,h4,h5");
    return h ? h.textContent : "";
  };

  const applyFilter = (term) => {
    const cards = Array.from(document.querySelectorAll("[data-anime-card]"));
    if (!cards.length) return false;
    const q = normalize(term);
    let shown = 0;
    cards.forEach((card) => {
      const title = normalize(getCardTitle(card));
      const match = !q || title.includes(q);
      card.style.display = match ? "" : "none";
      if (match) shown += 1;
    });
    return shown > 0;
  };

  const imageOf = (item) =>
    item?.images?.webp?.large_image_url ||
    item?.images?.jpg?.large_image_url ||
    item?.images?.jpg?.image_url ||
    "";

  const fetchRelatedByQuery = async (term, mediaType) => {
    const q = (term || "").trim();
    if (!q) return [];
    const wantMovie = pageForType(mediaType) === "catalogo.html";
    try {
      const url = `${API_BASE}?q=${encodeURIComponent(q)}&limit=25&order_by=popularity&sort=asc`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      const rows = (json?.data || []).filter((it) => {
        const t = normalize(it?.type || "");
        return wantMovie ? t.includes("movie") : !t.includes("movie");
      });
      const scored = rows
        .map((it) => {
          const best = Math.max(
            scoreMatch(q, it?.title || ""),
            scoreMatch(q, it?.title_english || ""),
            scoreMatch(q, it?.title_japanese || ""),
            Math.round(tokenMatchScore(q, it?.title || "") * 100),
            Math.round(tokenMatchScore(q, it?.title_english || "") * 100)
          );
          return { it, best };
        })
        .filter((x) => x.best >= 45)
        .sort((a, b) => b.best - a.best);
      return scored.map((x) => x.it);
    } catch {
      return [];
    }
  };

  const hydrateCardsWithResults = (items, mediaType, query = "") => {
    const cards = Array.from(document.querySelectorAll("[data-anime-card]"));
    if (!cards.length || !items.length) return false;
    cards.forEach((card, idx) => {
      const item = items[idx];
      if (!item) {
        card.style.display = "none";
        return;
      }
      card.style.display = "";
      const img = card.querySelector("img");
      if (img) {
        img.src = imageOf(item) || img.src;
        img.alt = item?.title || img.alt || "Anime";
      }
      const titleEl = card.querySelector("h3,h4,h5");
      if (titleEl) titleEl.textContent = item?.title || titleEl.textContent;
      const p = card.querySelector("p");
      if (p) {
        const genres = (item?.genres || []).map((g) => g?.name).filter(Boolean).slice(0, 2).join(", ");
        if (genres) p.textContent = `Géneros: ${genres}`;
      }
      card.setAttribute("data-title", (item?.title || "").toLowerCase());
      card.setAttribute("data-type", pageForType(mediaType) === "catalogo.html" ? "Pelicula" : "Anime");
    });
    if (query) {
      const target = document.querySelector("h1, h2");
      if (target) target.textContent = `Resultados para: ${query}`;
    }
    return true;
  };

  const goToSearchPage = (term, page = "series.html") => {
    const q = encodeURIComponent(term.trim());
    window.location.href = `${page}?q=${q}`;
  };
  const pageForType = (mediaType) => {
    const t = normalize(mediaType);
    if (t.includes("movie") || t.includes("pelicula")) return "catalogo.html";
    return "series.html";
  };

  const bindInput = (input) => {
    if (!input || input.dataset.searchBound === "1") return;
    input.dataset.searchBound = "1";
    let box = null;
    let timer = null;

    const ensureBox = () => {
      if (box) return box;
      const host = input.closest(".relative") || input.parentElement;
      if (!host) return null;
      if (getComputedStyle(host).position === "static") host.style.position = "relative";
      box = document.createElement("div");
      box.className =
        "absolute left-0 right-0 top-full mt-2 hidden border border-zinc-700 bg-zinc-900/95 backdrop-blur p-1 z-[80] max-h-64 overflow-y-auto anidex-suggest-box";
      box.style.width = "min(calc(44rem - 230px), calc(94vw - 180px))";
      box.style.left = "50%";
      box.style.right = "auto";
      box.style.transform = "translateX(-50%)";
      box.style.scrollbarWidth = "thin";
      box.style.scrollbarColor = "rgba(255,255,255,0.12) transparent";
      box.style.borderRadius = "0";
      const styleId = "anidex-suggest-style";
      if (!document.getElementById(styleId)) {
        const st = document.createElement("style");
        st.id = styleId;
        st.textContent = `
          .anidex-suggest-box::-webkit-scrollbar { width: 8px; }
          .anidex-suggest-box::-webkit-scrollbar-track { background: transparent; }
          .anidex-suggest-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 0; }
          .anidex-suggest-box::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        `;
        document.head.appendChild(st);
      }
      host.appendChild(box);
      return box;
    };

    const closeBox = () => {
      if (!box) return;
      box.classList.add("hidden");
      box.innerHTML = "";
    };

    const openBox = () => {
      const b = ensureBox();
      if (!b) return;
      b.classList.remove("hidden");
    };

    const getLocalSuggestions = (term) => {
      const q = normalize(term);
      if (!q) return [];
      const cards = Array.from(document.querySelectorAll("[data-anime-card]"));
      const seen = new Set();
      const out = [];
      cards.forEach((card) => {
        const title = (card.querySelector("h3,h4,h5")?.textContent || card.getAttribute("data-title") || "").trim();
        const value = normalize(title);
        if (!title || !value.includes(q) || seen.has(value)) return;
        seen.add(value);
        const img = card.querySelector("img")?.src || "";
        out.push({
          title,
          image: img,
          titleEn: "",
          titleJp: "",
          mediaType: card.getAttribute("data-type") || "Anime"
        });
      });
      return out.slice(0, 6);
    };

    const fetchApiSuggestions = async (term) => {
      const q = term.trim();
      if (!q) return [];
      if (suggestCache.has(q)) return suggestCache.get(q);
      try {
        const res = await fetch(`${API_BASE}?q=${encodeURIComponent(q)}&limit=6&order_by=popularity&sort=asc`);
        if (!res.ok) return [];
        const json = await res.json();
        const list = (json?.data || []).map((item) => {
          const base = item?.title || "";
          const english = item?.title_english || "";
          const japanese = item?.title_japanese || "";
          const safeTitle = hasJapaneseChars(base)
            ? (english || (hasJapaneseChars(japanese) ? "" : japanese) || base)
            : base;
          return {
            title: safeTitle,
            titleEn: english,
            titleJp: "",
            mediaType: item?.type || "",
            image:
              item?.images?.webp?.image_url ||
              item?.images?.jpg?.image_url ||
              ""
          };
        });

        // Filtro estricto: evita sugerencias que no tienen relación real.
        const filtered = list.filter((it) => {
          const best = Math.max(
            scoreMatch(q, it.title),
            scoreMatch(q, it.titleEn || ""),
            Math.round(tokenMatchScore(q, it.title) * 100),
            Math.round(tokenMatchScore(q, it.titleEn || "") * 100)
          );
          const tokenRatio = Math.max(
            tokenMatchScore(q, it.title),
            tokenMatchScore(q, it.titleEn || "")
          );
          return best >= 55 && tokenRatio >= 0.5;
        });

        suggestCache.set(q, filtered);
        return filtered;
      } catch {
        return [];
      }
    };

    const resolveBestTitle = async (term) => {
      const query = (term || "").trim();
      if (!query) return "";

      const local = getLocalSuggestions(query).map((x) => ({
        title: x.title,
        aliases: [x.title],
        mediaType: x.mediaType || "Anime"
      }));
      const api = (await fetchApiSuggestions(query)).map((x) => ({
        title: x.title,
        aliases: [x.title, x.titleEn].filter(Boolean),
        mediaType: x.mediaType || ""
      }));

      const pool = [...local, ...api];
      if (!pool.length) return { title: query, mediaType: "Anime" };

      let bestTitle = query;
      let bestType = "Anime";
      let bestScore = 0;
      pool.forEach((item) => {
        item.aliases.forEach((alias) => {
          const score = scoreMatch(query, alias);
          if (score > bestScore) {
            bestScore = score;
            bestTitle = item.title || query;
            bestType = item.mediaType || "Anime";
          }
        });
      });

      return {
        title: bestScore >= 55 ? bestTitle : query,
        mediaType: bestType
      };
    };

    const renderSuggestions = (items) => {
      const b = ensureBox();
      if (!b) return;
      b.innerHTML = "";
      if (!items.length) {
        closeBox();
        return;
      }
      items.forEach((it) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "w-full text-left px-2 py-2 hover:bg-zinc-800 transition-colors";
        btn.style.borderRadius = "0";
        const subtitle = [it.titleEn].filter(Boolean).join(" · ");
        btn.innerHTML = `
          <div class="flex items-center gap-3">
            <img src="${it.image || ""}" alt="${it.title}" class="h-14 w-10 object-cover bg-zinc-800" />
            <div class="min-w-0">
              <div class="text-sm text-zinc-100 truncate">${it.title}</div>
              ${subtitle ? `<div class="text-[11px] text-zinc-400 truncate">${subtitle}</div>` : ""}
            </div>
          </div>
        `;
        btn.addEventListener("click", () => {
          input.value = it.title;
          closeBox();
          goToSearchPage(it.title, pageForType(it.mediaType));
        });
        b.appendChild(btn);
      });
      openBox();
    };

    input.addEventListener("input", () => {
      const term = (input.value || "").trim();
      if (!term) {
        closeBox();
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const local = getLocalSuggestions(term);
        const api = await fetchApiSuggestions(term);
        const merged = [];
        const seen = new Set();
        [...local, ...api].forEach((it) => {
          const key = normalize(it.title);
          if (!key || seen.has(key)) return;
          const quality = Math.max(
            scoreMatch(term, it.title),
            scoreMatch(term, it.titleEn || ""),
            Math.round(tokenMatchScore(term, it.title) * 100),
            Math.round(tokenMatchScore(term, it.titleEn || "") * 100)
          );
          if (quality < 50) return;
          seen.add(key);
          merged.push(it);
        });
        renderSuggestions(merged.slice(0, 8));
      }, 180);
    });

    document.addEventListener("click", (e) => {
      if (!box) return;
      const host = input.closest(".relative") || input.parentElement;
      if (host && !host.contains(e.target)) closeBox();
    });

    input.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      closeBox();
      const term = (input.value || "").trim();
      if (!term) return;
      const resolved = await resolveBestTitle(term);
      const resolvedTerm = resolved.title;
      input.value = resolvedTerm;
      const hasCards = document.querySelector("[data-anime-card]");
      if (hasCards) {
        const ok = applyFilter(resolvedTerm);
        if (!ok) {
          goToSearchPage(resolvedTerm, pageForType(resolved.mediaType));
        }
      } else {
        goToSearchPage(resolvedTerm, pageForType(resolved.mediaType));
      }
    });
  };

  const init = () => {
    const navInputs = Array.from(document.querySelectorAll('input[placeholder*="Buscar"]'));
    navInputs.forEach(bindInput);

    const filterInput = document.getElementById("filter-search");
    if (filterInput) {
      bindInput(filterInput);
      filterInput.addEventListener("input", () => applyFilter(filterInput.value));
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && filterInput) {
      filterInput.value = q;
      const ok = applyFilter(q);
      if (!ok) {
        const mediaType = window.location.pathname.toLowerCase().includes("catalogo") ? "movie" : "tv";
        fetchRelatedByQuery(q, mediaType).then((items) => hydrateCardsWithResults(items, mediaType, q));
      }
    } else if (q && document.querySelector("[data-anime-card]")) {
      const ok = applyFilter(q);
      if (!ok) {
        const mediaType = window.location.pathname.toLowerCase().includes("catalogo") ? "movie" : "tv";
        fetchRelatedByQuery(q, mediaType).then((items) => hydrateCardsWithResults(items, mediaType, q));
      }
    }
  };

  window.AniDexSearch = { init };
})();
