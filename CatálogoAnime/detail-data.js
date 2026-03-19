(() => {
  const API = "https://api.jikan.moe/v4";
  const GENRE_ES = {
    Action: "Acción",
    Adventure: "Aventura",
    Comedy: "Comedia",
    Drama: "Drama",
    Fantasy: "Fantasía",
    Romance: "Romance",
    Suspense: "Suspenso",
    Mystery: "Misterio",
    SciFi: "Ciencia ficción",
    "Sci-Fi": "Ciencia ficción",
    Horror: "Terror",
    Sports: "Deportes",
    "Slice of Life": "Recuentos de la vida",
    Supernatural: "Sobrenatural",
    "Award Winning": "Premiado"
  };

  const norm = (v) =>
    (v || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const score = (q, t) => {
    const a = norm(q);
    const b = norm(t);
    if (!a || !b) return 0;
    if (a === b) return 100;
    if (b.includes(a) || a.includes(b)) return 80;
    const at = a.split(" ");
    const bt = b.split(" ");
    const overlap = at.filter((x) => bt.includes(x)).length;
    return Math.round((overlap / Math.max(at.length, bt.length)) * 70);
  };

  const pickTitle = async (query) => {
    const r = await fetch(`${API}/anime?q=${encodeURIComponent(query)}&limit=10&order_by=popularity&sort=asc`);
    if (!r.ok) return null;
    const j = await r.json();
    const list = j?.data || [];
    const best = list
      .map((it) => ({
        it,
        s: Math.max(score(query, it?.title), score(query, it?.title_english), score(query, it?.title_japanese))
      }))
      .sort((a, b) => b.s - a.s)[0];
    return best?.it || list[0] || null;
  };

  const byId = async (id, suffix = "full") => {
    const r = await fetch(`${API}/anime/${id}/${suffix}`);
    if (!r.ok) return null;
    const j = await r.json();
    return j?.data || null;
  };

  const fetchTopByType = async (type, limit = 10) => {
    try {
      const r = await fetch(`${API}/top/anime?filter=bypopularity&type=${encodeURIComponent(type)}&limit=${limit}`);
      if (!r.ok) return [];
      const j = await r.json();
      return j?.data || [];
    } catch {
      return [];
    }
  };

  const imgOf = (it) =>
    it?.images?.webp?.large_image_url ||
    it?.images?.jpg?.large_image_url ||
    it?.images?.jpg?.image_url ||
    "";

  const toSpanishStatus = (value) => {
    const v = (value || "").toLowerCase();
    if (v.includes("finished")) return "Finalizado";
    if (v.includes("currently")) return "En emisi?n";
    if (v.includes("not yet")) return "Próximamente";
    return value || "N/A";
  };

  const toSpanishSeason = (value) => {
    const v = (value || "").toLowerCase();
    if (v === "winter") return "invierno";
    if (v === "spring") return "primavera";
    if (v === "summer") return "verano";
    if (v === "fall") return "otoño";
    return value || "";
  };

  const toSpanishType = (value) => {
    const v = (value || "").toLowerCase();
    if (v === "tv") return "Serie";
    if (v === "movie") return "Película";
    if (v === "ova") return "OVA";
    if (v === "special") return "Especial";
    return value || "N/A";
  };

  const toSpanishDuration = (value) => {
    const raw = value || "";
    return raw.replace("min per ep", "min por episodio").replace("hr", "h");
  };
  const toSpanishRating = (value) => {
    const v = value || "";
    return v
      .replace("R - 17+ (violence & profanity)", "R - 17+ (violencia y lenguaje explícito)")
      .replace("PG-13 - Teens 13 or older", "PG-13 - Mayores de 13 años")
      .replace("PG - Children", "PG - Público general")
      .replace("G - All Ages", "G - Todas las edades")
      .replace("Rx - Hentai", "Rx - Adultos");
  };
  const genresEs = (arr) => (arr || []).map((g) => GENRE_ES[g?.name] || g?.name).join(", ");

  const translateToEs = async (text) => {
    const raw = (text || "").trim();
    if (!raw) return "";
    try {
      const res = await fetch(
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=" +
          encodeURIComponent(raw)
      );
      const data = await res.json();
      return (data?.[0] || []).map((r) => r?.[0] || "").join("").trim() || raw;
    } catch {
      return raw;
    }
  };

  const renderMetaBlock = (container, label, value) => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-1";
    wrap.innerHTML = `<span class="text-xs text-on-surface-variant uppercase tracking-widest font-bold">${label}</span><span class="text-on-surface font-medium">${value || "N/A"}</span>`;
    container.appendChild(wrap);
  };

  const slider = (title, items, renderItemHtml, idBase) => {
    const section = document.createElement("div");
    section.className = "space-y-4";
    section.innerHTML = `<div class="flex items-center justify-between"><h3 class="font-headline text-2xl font-bold">${title}</h3><div class="flex gap-2"><button id="${idBase}-prev" class="px-3 py-1 border border-outline-variant/30 text-primary">‹</button><button id="${idBase}-next" class="px-3 py-1 border border-outline-variant/30 text-primary">›</button></div></div>`;
    const row = document.createElement("div");
    row.id = `${idBase}-row`;
    row.className = "flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth";
    items.forEach((it) => {
      const card = document.createElement("div");
      card.className = "shrink-0";
      card.innerHTML = renderItemHtml(it);
      row.appendChild(card);
    });
    section.appendChild(row);
    setTimeout(() => {
      const prev = section.querySelector(`#${idBase}-prev`);
      const next = section.querySelector(`#${idBase}-next`);
      if (prev) prev.addEventListener("click", () => row.scrollBy({ left: -340, behavior: "smooth" }));
      if (next) next.addEventListener("click", () => row.scrollBy({ left: 340, behavior: "smooth" }));
    }, 0);
    return section;
  };

  const init = async () => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || document.querySelector("h1")?.textContent?.trim() || "Solo Leveling";
    const malIdParam = params.get("mal_id");
    const preTitle = params.get("q");
    if (preTitle && document.querySelector("h1")) {
      document.querySelector("h1").textContent = preTitle;
    }
    let full = null;
    let selectedId = null;
    if (malIdParam) {
      selectedId = Number(malIdParam);
      if (selectedId) full = await byId(selectedId, "full");
    }
    if (!full) {
      const found = await pickTitle(query);
      if (!found?.mal_id) return;
      selectedId = found.mal_id;
      full = await byId(selectedId, "full");
    }
    if (!full) return;
    const chars = (await byId(selectedId, "characters")) || [];
    const vids = (await byId(selectedId, "videos")) || {};
    const pics = (await byId(selectedId, "pictures")) || [];

    const preferredTitle = full.title_english || full.title || full.title_japanese || "Anime";
    const originalTitle = full.title || full.title_japanese || full.title_english || "N/A";
    const titleMain = document.querySelector("h1");
    if (titleMain) {
      titleMain.textContent = preferredTitle;
      let sub = document.getElementById("detail-original-title");
      if (!sub) {
        sub = document.createElement("p");
        sub.id = "detail-original-title";
        sub.className = "text-sm text-on-surface-variant font-medium mt-1";
        titleMain.insertAdjacentElement("afterend", sub);
      }
      sub.textContent = `Título original: ${originalTitle}`;
    }
    document.title = `${preferredTitle} | AniDex`;

    const poster = document.querySelector("section .aspect-\\[2\\/3\\] img");
    const bg = document.querySelector("section img[alt='Background Art']");
    const src = imgOf(full);
    if (poster && src) poster.src = src;
    if (bg && src) bg.src = src;

    const syn = document.querySelector("h2 + p");
    if (syn) syn.textContent = (await translateToEs(full.synopsis)) || "Sinopsis no disponible.";

    const scoreEl = document.querySelector(".font-bold.text-lg");
    if (scoreEl) scoreEl.textContent = (full.score || "N/A").toString();

    const statusLine = document.getElementById("detail-status-meta") || document.querySelector("h1 + p");
    if (statusLine) {
      statusLine.className = "text-on-surface-variant font-medium space-y-2 text-sm lg:text-base";
      statusLine.innerHTML = `
        <div class="flex flex-wrap items-start gap-x-10 gap-y-2">
          <span class="flex flex-col"><span class="text-primary-dim text-xs uppercase tracking-wider">Estado</span><span>${toSpanishStatus(full.status)}</span></span>
          <span class="flex flex-col"><span class="text-primary-dim text-xs uppercase tracking-wider">Año</span><span>${full.year || "N/A"}</span></span>
        </div>
        <div>
          <span class="flex flex-col"><span class="text-primary-dim text-xs uppercase tracking-wider">Episodios</span><span>${full.episodes || "N/A"}</span></span>
        </div>
      `;
    }

    const genres = document.querySelector("h1")?.parentElement?.querySelector(".flex.flex-wrap.gap-2");
    if (genres) {
      genres.innerHTML = (full.genres || []).map((g) => `<span class="px-4 py-1.5 bg-surface-container-high text-on-surface-variant text-sm rounded-full border border-outline-variant/10">${g.name}</span>`).join("");
    }

    const infoBox = Array.from(document.querySelectorAll("h3")).find((x) => /informaci/i.test(x.textContent || ""));
    const infoList = infoBox?.parentElement?.querySelector(".space-y-6");
    if (infoList) {
      infoList.innerHTML = "";
      renderMetaBlock(infoList, "Título (EN)", full.title_english || "N/A");
      renderMetaBlock(infoList, "Título (JP)", full.title_japanese || "N/A");
      renderMetaBlock(infoList, "Título Original", full.title || "N/A");
      renderMetaBlock(infoList, "Tipo", toSpanishType(full.type));
      renderMetaBlock(infoList, "Episodios", full.episodes || "N/A");
      renderMetaBlock(infoList, "Duración", toSpanishDuration(full.duration) || "N/A");
      renderMetaBlock(infoList, "Año", `${full.year || "N/A"}`);
      renderMetaBlock(infoList, "Temporadas", `${((full?.relations || []).filter((r) => /sequel/i.test(r?.relation || "")).length + 1) || 1}`);
      renderMetaBlock(infoList, "Estado", toSpanishStatus(full.status));
      renderMetaBlock(infoList, "Géneros", (genresEs(full.genres) || "N/A").replace(/,/g, " ·"));
      renderMetaBlock(infoList, "Clasificación", toSpanishRating(full.rating) || "N/A");
      renderMetaBlock(infoList, "Ranking", full.rank ? `# ${full.rank}` : "N/A");
      renderMetaBlock(infoList, "Estudio", full.studios?.[0]?.name || "N/A");
    }

    const charsRow = document.querySelector(".hide-scrollbar");
    if (charsRow) {
      const mains = chars.filter((c) => /main/i.test(c?.role || ""));
      const supports = chars.filter((c) => !/main/i.test(c?.role || ""));
      const topChars = [...mains, ...supports].slice(0, 9);
      charsRow.innerHTML = topChars.map((c) => {
        const vaJp = ((c?.voice_actors || []).find((v) => v?.language === "Japanese")?.person?.name || "N/A").replace(/,/g, "");
        const vaEn = ((c?.voice_actors || []).find((v) => v?.language === "English")?.person?.name || "N/A").replace(/,/g, "");
        const vaEs = ((c?.voice_actors || []).find((v) => /spanish/i.test(v?.language || ""))?.person?.name || "N/A").replace(/,/g, "");
        const cleanName = (c.character?.name || "Personaje").replace(/,/g, "");
        return `
        <div class="flex flex-col items-center gap-2 shrink-0 w-44 text-center">
          <div class="w-24 h-24 overflow-hidden border border-primary/20 rounded-full">
            <img alt="${c.character?.name || "Personaje"}" class="w-full h-full object-cover" src="${c.character?.images?.jpg?.image_url || ""}"/>
          </div>
          <span class="text-sm font-bold">${cleanName}</span>
          <span class="text-xs text-on-surface-variant">Doblaje JP: ${vaJp}</span>
          <span class="text-xs text-on-surface-variant">Doblaje EN: ${vaEn}</span>
          <span class="text-xs text-on-surface-variant">Doblaje ES: ${vaEs}</span>
        </div>`;
      }).join("");
      const prev = document.getElementById("chars-prev");
      const next = document.getElementById("chars-next");
      if (prev) prev.onclick = () => charsRow.scrollBy({ left: -320, behavior: "smooth" });
      if (next) next.onclick = () => charsRow.scrollBy({ left: 320, behavior: "smooth" });
    }

    const synopsisBlock = Array.from(document.querySelectorAll("h2")).find((x) => /sinopsis/i.test(x.textContent || ""))?.parentElement;
    if (synopsisBlock) {
      const images = pics.slice(0, 8);
      if (images.length) {
        synopsisBlock.appendChild(slider("Imágenes del Título", images, (it) => `
          <img data-zoomable src="${it?.jpg?.large_image_url || it?.jpg?.image_url || ""}" class="h-36 w-36 object-cover border border-outline-variant/20 cursor-zoom-in" />
        `, "detail-images"));
      }
      const clips = [vids?.promo?.[0], ...(vids?.promo || []).slice(1, 8)]
        .filter(Boolean)
        .filter((it) => it?.trailer?.url || it?.trailer?.youtube_id);
      if (clips.length) {
        synopsisBlock.appendChild(slider("Videos / Clips", clips, (it) => `
          <a href="${it?.trailer?.url || (it?.trailer?.youtube_id ? `https://www.youtube.com/watch?v=${it.trailer.youtube_id}` : "#")}" target="_blank" rel="noopener noreferrer" class="block h-36 w-36 overflow-hidden border border-outline-variant/20 bg-surface-container-high relative">
            <img src="${it?.trailer?.images?.medium_image_url || it?.trailer?.images?.image_url || ""}" class="h-full w-full object-cover"/>
            <span class="absolute inset-0 bg-black/30 flex items-center justify-center text-xs font-bold">Ver clip</span>
          </a>
        `, "detail-videos"));
      }
    }

    // Galería relacionada eliminada por solicitud.

    const external = Array.from(document.querySelectorAll("h3")).find((x) => /enlaces externos/i.test((x.textContent || "").toLowerCase()));
    if (external) external.parentElement?.remove();

    const trailerBtn = document.getElementById("detail-trailer-btn");
    if (trailerBtn) {
      const turl =
        (full?.trailer?.youtube_id ? `https://www.youtube.com/watch?v=${full.trailer.youtube_id}` : "") ||
        full?.trailer?.url ||
        `https://www.youtube.com/results?search_query=${encodeURIComponent((full?.title || query || "") + " trailer")}`;
      trailerBtn.href = turl;
    }

    const actionBtns = document.querySelectorAll("[data-add-my-list], [data-add-favorite]");
    actionBtns.forEach((btn) => {
      btn.dataset.itemTitle = preferredTitle;
      btn.dataset.itemImage = src || "";
      btn.dataset.itemType = (full.type || "").toLowerCase() === "movie" ? "Pelicula" : "Anime";
      btn.dataset.itemId = String(selectedId || "");
    });
    document.body.dataset.detailTitle = preferredTitle;
    document.body.dataset.detailImage = src || "";
    document.body.dataset.detailType = (full.type || "").toLowerCase() === "movie" ? "Pelicula" : "Anime";
    if (window.AniDexFavorites) window.AniDexFavorites.refresh();

    // Recomendados: si es película, mostrar películas; si no, series.
    const recCards = Array.from(document.querySelectorAll("section a.group.cursor-pointer"));
    if (recCards.length) {
      const recType = (full.type || "").toLowerCase() === "movie" ? "movie" : "tv";
      const recItems = await fetchTopByType(recType, recCards.length);
      recCards.forEach((a, i) => {
        const it = recItems[i];
        if (!it) return;
        const img = a.querySelector("img");
        const h = a.querySelector("h4,h3,h5");
        const p = a.querySelector("p");
        const scoreEl = a.querySelector(".text-xs.font-bold");
        if (img) img.src = imgOf(it) || img.src;
        if (h) h.textContent = it.title || h.textContent;
        if (p) p.textContent = (it.genres || []).map((g) => g.name).slice(0, 2).join(", ");
        if (scoreEl && typeof it.score === "number") scoreEl.textContent = it.score.toFixed(1);
        if (it?.mal_id) a.setAttribute("data-mal-id", String(it.mal_id));
        a.href = `detail.html?mal_id=${encodeURIComponent(String(it.mal_id || ""))}&q=${encodeURIComponent(it.title || "")}`;
      });
    }

    // Zoom simple para imágenes del slider
    document.addEventListener("click", (e) => {
      const img = e.target.closest("img[data-zoomable]");
      if (!img) return;
      const overlay = document.createElement("div");
      overlay.className = "fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-6";
      overlay.innerHTML = `<img src="${img.src}" class="max-h-[92vh] max-w-[92vw] object-contain border border-zinc-700" />`;
      overlay.addEventListener("click", () => overlay.remove());
      document.body.appendChild(overlay);
    });
  };

  window.AniDexDetailData = { init };
})();
