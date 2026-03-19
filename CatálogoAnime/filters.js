(function () {
  const COMMON_GENRES_ES = [
    "Acción", "Aventura", "Comedia", "Drama", "Fantasía", "Romance", "Sci-Fi",
    "Horror", "Misterio", "Sobrenatural", "Thriller / Suspenso", "Deportes",
    "Escolar", "Musical", "Histórico", "Magia", "psicologico"
  ];

  const GENRE_MAP = {
    "accion": "Acción",
    "adventure": "Aventura",
    "aventura": "Aventura",
    "comedy": "Comedia",
    "comedia": "Comedia",
    "drama": "Drama",
    "fantasy": "Fantasía",
    "fantasia": "Fantasía",
    "sci fi": "Sci-Fi",
    "sci-fi": "Sci-Fi",
    "science fiction": "Sci-Fi",
    "mystery": "Misterio",
    "misterio": "Misterio",
    "suspense": "Thriller / Suspenso",
    "thriller": "Thriller / Suspenso",
    "horror": "Horror",
    "terror": "Horror",
    "psychological": "psicologico",
    "romance": "Romance",
    "slice of life": "Slice of Life",
    "sobrenatural": "Sobrenatural",
    "supernatural": "Sobrenatural",
    "sports": "Deportes",
    "deporte": "Deportes",
    "school": "Escolar",
    "historical": "Histórico",
    "historico": "Histórico",
    "military": "Militar",
    "mecha": "Mecha",
    "music": "Musical",
    "parody": "Parodia",
    "seinen": "Seinen",
    "shounen": "Shounen",
    "shonen": "Shounen",
    "shoujo": "Shoujo",
    "josei": "Josei",
    "isekai": "Isekai",
    "ecchi": "Ecchi",
    "harem": "Harem",
    "dementia": "Demencia",
    "magic": "Magia",
    "samurai": "Samurái",
    "police": "Policía",
    "space": "Espacio",
    "vampire": "Vampiros",
    "vampiros": "Vampiros",
    "martial arts": "Artes marciales",
    "game": "Juegos",
    "cars": "Carreras",
    "work": "Trabajo",
    "super power": "Superpoderes",
    "survival": "Supervivencia",
    "gore": "Gore",
    "reincarnation": "Reencarnación",
    "gender bender": "Género bender",
    "yaoi": "Yaoi",
    "yuri": "Yuri",
    "avant garde": "Avant Garde",
    "award winning": "Premiado"
  };

  const STATUS_OPTIONS = ["Todos", "Emisión", "Finalizado", "Próximamente"];

  function normalize(v) {
    return String(v || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function canonicalGenre(g) {
    const key = normalize(g).replace(/_/g, " ");
    if (GENRE_MAP[key]) return GENRE_MAP[key];
    if (key.includes("action") || key.includes("acci")) return "Acción";
    if (key.includes("advent") || key.includes("avent")) return "Aventura";
    if (key.includes("comedy") || key.includes("comed")) return "Comedia";
    if (key.includes("drama")) return "Drama";
    if (key.includes("fantas")) return "Fantasía";
    if (key.includes("romance")) return "Romance";
    if (key.includes("sci") || key.includes("science")) return "Sci-Fi";
    if (key.includes("horror") || key.includes("terror")) return "Horror";
    if (key.includes("mister") || key.includes("mystery")) return "Misterio";
    if (key.includes("supernatural") || key.includes("sobrenat")) return "Sobrenatural";
    if (key.includes("thriller") || key.includes("suspense") || key.includes("suspenso")) return "Thriller / Suspenso";
    if (key.includes("sport") || key.includes("deport")) return "Deportes";
    if (key.includes("school") || key.includes("escolar")) return "Escolar";
    if (key.includes("music") || key.includes("musical")) return "Musical";
    if (key.includes("histor")) return "Histórico";
    if (key.includes("magic") || key.includes("magia")) return "Magia";
    if (key.includes("psych") || key.includes("psico")) return "psicologico";
    return "";
  }

  function chip(label, active, onClick, compact) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.className = `${compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"} rounded-md border transition-colors ${active ? "bg-primary text-on-primary border-primary" : "bg-surface-container-high text-on-surface-variant border-transparent hover:text-on-surface"}`;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function gridChip(label, active, onClick) {
    const btn = chip(label, active, onClick, true);
    btn.classList.add("w-full", "text-center", "inline-flex", "items-center", "justify-center");
    btn.classList.remove("px-2.5");
    btn.classList.add("px-3.5");
    btn.style.paddingLeft = "calc(0.875rem + 5px)";
    btn.style.paddingRight = "calc(0.875rem + 5px)";
    return btn;
  }

  function createWrap() {
    const div = document.createElement("div");
    div.className = "flex flex-wrap gap-2";
    return div;
  }

  function gatherCards() {
    return Array.from(document.querySelectorAll("[data-anime-card]"));
  }

  function readGenresFromCard(card) {
    if (card.dataset.genres) {
      return String(card.dataset.genres)
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
    }
    const fromBadges = Array.from(card.querySelectorAll(".flex.flex-wrap.gap-2 span"))
      .map((n) => n.textContent || "")
      .map((t) => t.trim())
      .filter(Boolean);
    if (fromBadges.length) return fromBadges;
    const genreLine = Array.from(card.querySelectorAll("p"))
      .map((p) => p.textContent || "")
      .find((t) => normalize(t).includes("genero"));
    if (genreLine) {
      const after = genreLine.split(":")[1] || genreLine;
      return after.split(",").map((g) => g.trim()).filter(Boolean);
    }
    return [];
  }

  function applyRuntimeCardData(cards) {
    cards.forEach((card) => {
      if (!card.dataset.title) {
        const t = card.querySelector("h3,h4")?.textContent?.trim();
        if (t) card.dataset.title = t;
      }
      if (!card.dataset.year) {
        const meta = card.querySelector("p")?.textContent || "";
        const y = meta.match(/(19|20)\d{2}/)?.[0];
        if (y) card.dataset.year = y;
      }
      if (card.dataset.year && !card.dataset.yearOriginal) {
        card.dataset.yearOriginal = card.dataset.year;
      }
      if (!card.dataset.genres) {
        const gs = readGenresFromCard(card).map((g) => canonicalGenre(g)).filter(Boolean);
        card.dataset.genres = gs.join(",");
      }
      if (!card.dataset.type) {
        const badge = card.querySelector("span.absolute")?.textContent || "";
        const b = normalize(badge);
        card.dataset.type = b.includes("pelicula") || b.includes("movie") ? "Película" : "Anime";
      }
      if (!card.dataset.status) card.dataset.status = "Finalizado";
    });
  }

  function setup() {
    const cards = gatherCards();
    if (!cards.length) return;
    applyRuntimeCardData(cards);
    const available = {
      genres: new Set(),
      years: new Set(),
      types: new Set(),
      statuses: new Set()
    };
    cards.forEach((card) => {
      readGenresFromCard(card).map((g) => canonicalGenre(g)).filter(Boolean).forEach((g) => available.genres.add(g));
      const y = Number(card.dataset.year || 0);
      if (y) available.years.add(y);
      const t = canonicalType(card.dataset.type || "");
      if (t) available.types.add(t);
      const s = canonicalStatus(card.dataset.status || "");
      if (s) available.statuses.add(s);
    });

    const searchInput = document.getElementById("filter-search");
    if (!searchInput) return;

    const searchWrap = searchInput.closest("div");
    if (searchWrap) {
      searchWrap.className = "flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2.5 border border-outline/40 focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/30 transition-all";
      searchInput.className = "w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-on-surface-variant/60";
    }

    const labels = Array.from(document.querySelectorAll("label"));
    let genreLabel = labels.find((l) => normalize(l.textContent).includes("genero"));
    if (!genreLabel) genreLabel = labels.find((l) => normalize(l.textContent).includes("gen"));
    const genreHeading = Array.from(document.querySelectorAll("*"))
      .find((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE" && normalize(el.textContent).trim() === "generos");
    const yearLabel = document.querySelector("label[for='filter-year']");
    const typeLabel = document.querySelector("label[for='filter-type']");
    const statusLabel = document.querySelector("label[for='filter-status']");
    const isMoviesPage = window.location.pathname.toLowerCase().includes("catalogo");
    if (isMoviesPage) {
      if (genreLabel) genreLabel.textContent = "Géneros";
      if (yearLabel) yearLabel.textContent = "Año";
      if (typeLabel) typeLabel.textContent = "Tipo";
      if (statusLabel) statusLabel.textContent = "Estado";
    }

    const genreWrap = createWrap();
    genreWrap.classList.add("anidex-genre-wrap");
    const yearWrap = document.createElement("div");
    yearWrap.className = "w-full grid grid-cols-5 gap-x-5 gap-y-2 anidex-year-wrap";
    const typeWrap = createWrap();
    typeWrap.classList.add("anidex-type-wrap");
    const statusWrap = createWrap();
    statusWrap.classList.add("anidex-status-wrap");
    yearWrap.classList.add("pr-1");

    const filterPanel = document.querySelector("section[aria-label='Filtros']");
    const genreHost = isMoviesPage
      ? (genreLabel?.parentElement
        || genreHeading?.parentElement
        || filterPanel?.querySelector(".space-y-2:nth-of-type(2)")
        || filterPanel?.querySelector(".space-y-2"))
      : (genreLabel?.parentElement || genreHeading?.parentElement);
    if (genreHost) {
      if (isMoviesPage) {
        const oldButtons = genreHost.querySelector(".flex.flex-wrap.gap-2");
        if (oldButtons) oldButtons.remove();
      }
      genreHost.querySelectorAll(".anidex-genre-wrap").forEach((n) => n.remove());
      genreHost.appendChild(genreWrap);
    }
    if (yearLabel?.parentElement) {
      yearLabel.parentElement.querySelectorAll(".anidex-year-wrap").forEach((n) => n.remove());
      yearLabel.parentElement.appendChild(yearWrap);
    }
    if (!isMoviesPage) {
      if (typeLabel?.parentElement) {
        typeLabel.parentElement.querySelectorAll(".anidex-type-wrap").forEach((n) => n.remove());
        typeLabel.parentElement.appendChild(typeWrap);
      }
      if (statusLabel?.parentElement) {
        statusLabel.parentElement.querySelectorAll(".anidex-status-wrap").forEach((n) => n.remove());
        statusLabel.parentElement.appendChild(statusWrap);
      }
    } else {
      typeLabel?.parentElement?.remove();
      statusLabel?.parentElement?.remove();
    }

    const oldGenreRow = genreLabel?.parentElement?.querySelector("div.flex.flex-wrap.gap-2");
    if (oldGenreRow) oldGenreRow.remove();
    ["filter-year", "filter-type", "filter-status"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    Array.from(document.querySelectorAll("button")).forEach((btn) => {
      const t = normalize(btn.textContent);
      if (t === "aplicar" || t === "reiniciar") btn.remove();
    });

    const sortHost = Array.from(document.querySelectorAll("header .flex.items-center.gap-3")).find((d) => normalize(d.textContent).includes("ordenar"));
    let sortSelect = null;
    if (sortHost) {
      const oldButton = sortHost.querySelector("button");
      if (oldButton) oldButton.remove();
      const existingSelect = sortHost.querySelector("select");
      if (existingSelect) {
        sortSelect = existingSelect;
      } else {
        sortSelect = document.createElement("select");
        sortSelect.className = "rounded-lg bg-surface-container-high px-3 py-2 text-sm text-on-surface border border-outline/40";
        sortSelect.innerHTML = [
          ["popularity_desc", "Popularidad"],
          ["year_desc", "Año (más nuevo)"],
          ["year_asc", "Año (más antiguo)"],
          ["title_asc", "Título (A-Z)"],
          ["title_desc", "Título (Z-A)"]
        ].map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
        sortHost.appendChild(sortSelect);
      }
      if (sortSelect) sortSelect.dataset.sortSelect = "1";
    }

    const state = {
      search: "",
      genres: new Set(),
      years: new Set(),
      types: new Set(),
      statuses: new Set(),
      sort: "popularity_desc"
    };
    const grid = cards[0]?.parentElement || null;
    let emptyBox = null;
    cards.forEach((card) => {
      const p = card.querySelector("p");
      const y = card.dataset.year || "";
      if (!p || !y) return;
      if (card.querySelector("[data-card-year]")) return;
      const yearEl = document.createElement("span");
      yearEl.dataset.cardYear = "1";
      yearEl.className = "block text-xs text-on-surface-variant/80 mt-0.5";
      yearEl.textContent = y;
      p.insertAdjacentElement("afterend", yearEl);
    });

    function ensureEmptyBox() {
      if (emptyBox || !grid) return;
      emptyBox = document.createElement("div");
      emptyBox.className = "hidden col-span-full rounded-xl border border-outline/30 bg-surface-container-low p-8 text-center";
      const emptyTitle = isMoviesPage
        ? "No se encontraron peliculas que coincidan con tu filtro."
        : "No se encontraron animes que coincidan con tu filtro.";
      emptyBox.innerHTML = `
        <img src="https://media.giphy.com/media/52OAVA0xaq5hd8HbfY/giphy.gif" alt="Doraemon triste" class="mx-auto mb-4 h-36 w-36 object-cover rounded-lg" />
        <h3 class="text-xl font-bold text-on-surface">${emptyTitle}</h3>
        <p class="mt-2 text-sm text-on-surface-variant">Prueba con otro nombre, género, año o tipo.</p>
      `;
      grid.appendChild(emptyBox);
    }

    function renderGenreChips() {
      genreWrap.innerHTML = "";
      const list = ["Todos", ...COMMON_GENRES_ES];
      list.forEach((name) => {
        const active = name === "Todos" ? state.genres.size === 0 : state.genres.has(name);
        genreWrap.appendChild(chip(name, active, () => {
          if (name === "Todos") {
            state.genres.clear();
          } else {
            if (state.genres.has(name)) state.genres.delete(name);
            else state.genres.add(name);
          }
          renderGenreChips();
          applyFilters();
        }, true));
      });
    }

    function renderYearChips() {
      yearWrap.innerHTML = "";
      const years = ["<=2000"];
      for (let y = 2001; y <= 2026; y += 1) years.push(String(y));
      ["Todos", ...years].forEach((label) => {
        const active = label === "Todos" ? state.years.size === 0 : state.years.has(label);
        yearWrap.appendChild(gridChip(label, active, () => {
          if (label === "Todos") {
            state.years.clear();
          } else if (state.years.has(label)) {
            state.years.delete(label);
          } else {
            state.years.add(label);
          }
          renderYearChips();
          applyFilters();
        }));
      });
    }

    function renderSimple(wrap, options, key) {
      wrap.innerHTML = "";
      options.forEach((name) => {
        const set = state[key];
        const active = name === "Todos" ? set.size === 0 : set.has(name);
        wrap.appendChild(chip(name, active, () => {
          if (name === "Todos") {
            set.clear();
          } else if (set.has(name)) {
            set.delete(name);
          } else {
            set.add(name);
          }
          renderSimple(wrap, options, key);
          applyFilters();
        }, true));
      });
    }

    function getPopularity(card) {
      const score = Number(card.dataset.score || "0");
      if (score) return score;
      const chipScore = Number((card.querySelector(".fa-star")?.parentElement?.textContent || "").replace(/[^\d.]/g, ""));
      return Number.isFinite(chipScore) ? chipScore : 0;
    }

    function syncCardYears(cardsList) {
      cardsList.forEach((card) => {
        const y = card.dataset.year || card.dataset.yearOriginal || "";
        const yearEls = Array.from(card.querySelectorAll("[data-card-year]"));
        if (yearEls.length > 1) yearEls.slice(1).forEach((el) => el.remove());
        const yearEl = yearEls[0] || null;
        if (!y) {
          if (yearEl) yearEl.remove();
          return;
        }
        const p = card.querySelector("p");
        if (p) {
          const txt = p.textContent || "";
          const cleaned = txt.replace(/\b(19|20)\d{2}\b/g, "").replace(/\s{2,}/g, " ").trim();
          if (cleaned !== txt) p.textContent = cleaned;
        }
        let out = yearEl;
        if (!out && p) {
          out = document.createElement("span");
          out.dataset.cardYear = "1";
          out.className = "block text-xs text-on-surface-variant/80 mt-0.5";
          p.insertAdjacentElement("afterend", out);
        }
        if (out) out.textContent = String(y);
      });
    }

    function applyFilters() {
      const currentCards = gatherCards();
      syncCardYears(currentCards);
      const q = normalize(state.search);
      currentCards.forEach((card) => {
        const title = normalize(card.dataset.title);
        const genres = readGenresFromCard(card)
          .map((g) => canonicalGenre(g))
          .filter(Boolean);
        if (!card.dataset.year) {
          const yNode = card.querySelector("[data-card-year]");
          const yMatch = yNode?.textContent?.match(/(19|20)\d{2}/);
          if (yMatch) card.dataset.year = yMatch[0];
        }
        const year = Number(card.dataset.year || 0);
        const type = canonicalType(card.dataset.type || "");
        const status = canonicalStatus(card.dataset.status || "");

        const matchText = !q || title.includes(q);
        const matchGenres = state.genres.size === 0 || Array.from(state.genres).every((g) => genres.includes(g));
        const matchYear = state.years.size === 0 || Array.from(state.years).some((y) => (y === "<=2000" ? year > 0 && year <= 2000 : String(year) === y));
        const matchType = state.types.size === 0 || state.types.has(type);
        const matchStatus = state.statuses.size === 0 || state.statuses.has(status);

        card.style.display = matchText && matchGenres && matchYear && matchType && matchStatus ? "" : "none";
      });

      const visible = currentCards.filter((c) => c.style.display !== "none");
      sortAndRepaint(visible);
      updateHeaderCount(visible.length);
      toggleEmptyState(visible.length);
    }

    function canonicalType(v) {
      const n = normalize(v);
      if (["pelicula", "movie", "film"].includes(n)) return "Película";
      if (n === "special") return "Especial";
      if (n === "tv" || n === "anime" || n === "serie") return "Anime";
      if (n === "ona") return "ONA";
      if (n === "ova") return "OVA";
      return v || "Anime";
    }

  function canonicalStatus(v) {
    const n = normalize(v);
    if (n.includes("emision") || n.includes("airing")) return "Emisión";
      if (n.includes("upcoming") || n.includes("proxim")) return "Próximamente";
      if (n.includes("final") || n.includes("finished")) return "Finalizado";
      return v || "Finalizado";
    }

    function sortAndRepaint(visible) {
      const host = grid || document.querySelector("[data-anime-card]")?.parentElement;
      if (!host) return;
      const sorted = [...visible];
      switch (state.sort) {
        case "year_desc": sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0)); break;
        case "year_asc": sorted.sort((a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0)); break;
        case "title_asc": sorted.sort((a, b) => normalize(a.dataset.title).localeCompare(normalize(b.dataset.title))); break;
        case "title_desc": sorted.sort((a, b) => normalize(b.dataset.title).localeCompare(normalize(a.dataset.title))); break;
        default: sorted.sort((a, b) => getPopularity(b) - getPopularity(a)); break;
      }
      sorted.forEach((c) => host.appendChild(c));
    }

    function toggleEmptyState(count) {
      ensureEmptyBox();
      if (!emptyBox) return;
      emptyBox.classList.toggle("hidden", count > 0);
      emptyBox.style.display = count > 0 ? "none" : "";
    }

    function updateHeaderCount(count) {
      const p = document.querySelector("header p");
      if (!p) return;
      p.textContent = `Mostrando ${count} títulos seleccionados para ti`;
    }

    searchInput.addEventListener("input", () => {
      state.search = searchInput.value || "";
      applyFilters();
    });

    if (sortSelect) {
      state.sort = sortSelect.value || state.sort;
      sortSelect.addEventListener("change", () => {
        state.sort = sortSelect.value;
        applyFilters();
      });
    }
    if (!window.__aniSortDelegate) {
      document.addEventListener("change", (e) => {
        const t = e.target;
        if (t && t.tagName === "SELECT" && t.dataset && t.dataset.sortSelect === "1") {
          if (window.__aniSortHandler) window.__aniSortHandler(t.value);
        }
      });
      window.__aniSortDelegate = true;
    }
    window.__aniSortHandler = (value) => {
      state.sort = value;
      applyFilters();
    };

    renderGenreChips();
    if (genreHost && !genreHost.contains(genreWrap)) genreHost.appendChild(genreWrap);
    renderYearChips();
    if (!isMoviesPage) {
      const typeList = ["Todos", "Anime", "OVA"];
      renderSimple(typeWrap, typeList, "types");
      const statusList = ["Todos", ...STATUS_OPTIONS.filter((s) => s !== "Todos" && available.statuses.has(s))];
      renderSimple(statusWrap, statusList, "statuses");
    } else {
      state.types.clear();
      state.statuses.clear();
    }
    applyFilters();
  }

  window.AniDexFilters = { init: setup };
})();
