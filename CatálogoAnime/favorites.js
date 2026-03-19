(() => {
  const KEY_MY_LIST = "anidex_my_list_v1";
  const KEY_FAVORITES = "anidex_favorites_v1";
  const norm = (v) => (v || "").toLowerCase().trim();

  const readKey = (k) => {
    try { return JSON.parse(localStorage.getItem(k) || "[]"); }
    catch { return []; }
  };
  const writeKey = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const upsert = (key, item) => {
    const id = norm(item.title);
    if (!id) return;
    const list = readKey(key).filter((x) => norm(x.title) !== id);
    list.unshift({ ...item, savedAt: Date.now() });
    writeKey(key, list.slice(0, 120));
  };
  const remove = (key, title) => writeKey(key, readKey(key).filter((x) => norm(x.title) !== norm(title)));
  const exists = (key, title) => readKey(key).some((x) => norm(x.title) === norm(title));

  const detectFromPage = () => {
    const path = (location.pathname || "").toLowerCase();
    if (path.includes("detail")) {
      const qTitle = new URLSearchParams(location.search).get("q");
      const title = (qTitle && qTitle.trim()) || document.querySelector("h1")?.textContent?.trim() || "Anime";
      const image = document.querySelector("main img")?.src || "";
      return { title, image, type: "Anime" };
    }
    const heroTitle = document.getElementById("hero-title")?.textContent?.trim();
    const heroImage = document.getElementById("hero-image")?.src;
    if (heroTitle) return { title: heroTitle, image: heroImage || "", type: "Anime" };
    return null;
  };

  const getButtonTitle = (btn) => {
    const path = (location.pathname || "").toLowerCase();
    if (path.includes("detail")) {
      const live = detectFromPage()?.title || document.querySelector("h1")?.textContent?.trim() || "";
      if (live) btn.dataset.itemTitle = live;
      return live;
    }
    const explicit = (btn.dataset.itemTitle || "").trim();
    if (explicit) return explicit;
    const pageTitle = detectFromPage()?.title || "";
    if (pageTitle) btn.dataset.itemTitle = pageTitle;
    return pageTitle;
  };

  const getButtonItem = (btn) => {
    const pageItem = detectFromPage() || {};
    return {
      title: getButtonTitle(btn) || pageItem.title || "",
      image: (btn.dataset.itemImage || "").trim() || pageItem.image || "",
      type: (btn.dataset.itemType || "").trim() || pageItem.type || "Anime"
    };
  };

  const setMyListAddedState = (btn) => {
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = "checklist";
    const text = btn.querySelector("[data-add-label]");
    if (text) text.textContent = "AGREGADO";
    btn.classList.add("opacity-80");
  };
  const setMyListDefaultState = (btn) => {
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = "playlist_add";
    const text = btn.querySelector("[data-add-label]");
    if (text) text.textContent = "MI LISTA";
    btn.classList.remove("opacity-80");
  };

  const setFavoriteAddedState = (btn) => {
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    btn.classList.add("text-violet-400");
    btn.classList.remove("text-on-surface-variant");
    btn.style.color = "#a855f7";
    const tip = btn.querySelector("[data-fav-label]");
    if (tip) tip.textContent = "Eliminar de Favoritos";
  };
  const setFavoriteDefaultState = (btn) => {
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.style.fontVariationSettings = "'FILL' 0";
    btn.classList.remove("text-violet-400");
    btn.classList.add("text-on-surface-variant");
    btn.style.color = "";
    const tip = btn.querySelector("[data-fav-label]");
    if (tip) tip.textContent = "Agregar a Favoritos";
  };

  const refreshMyListButtonState = (btn) => {
    const t = getButtonTitle(btn);
    if (!t) return;
    if (exists(KEY_MY_LIST, t)) setMyListAddedState(btn);
    else setMyListDefaultState(btn);
  };
  const refreshFavoriteButtonState = (btn) => {
    const t = getButtonTitle(btn);
    if (!t) return;
    if (exists(KEY_FAVORITES, t)) setFavoriteAddedState(btn);
    else setFavoriteDefaultState(btn);
  };

  const bindMyListButtons = () => {
    document.querySelectorAll("[data-add-my-list]").forEach((btn) => {
      if (btn.dataset.boundMyList === "1") return;
      btn.dataset.boundMyList = "1";
      refreshMyListButtonState(btn);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const item = getButtonItem(btn);
        if (!item.title) return;
        if (exists(KEY_MY_LIST, item.title)) {
          remove(KEY_MY_LIST, item.title);
          setMyListDefaultState(btn);
        } else {
          upsert(KEY_MY_LIST, item);
          setMyListAddedState(btn);
        }
      });
    });
  };

  const bindFavoriteButtons = () => {
    document.querySelectorAll("[data-add-favorite]").forEach((btn) => {
      if (btn.dataset.boundFav === "1") return;
      btn.dataset.boundFav = "1";
      refreshFavoriteButtonState(btn);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const item = getButtonItem(btn);
        if (!item.title) return;
        if (exists(KEY_FAVORITES, item.title)) {
          remove(KEY_FAVORITES, item.title);
          setFavoriteDefaultState(btn);
        } else {
          upsert(KEY_FAVORITES, item);
          setFavoriteAddedState(btn);
        }
      });
    });
  };

  const renderUserMyList = () => {
    const grid = document.getElementById("my-list-grid");
    if (!grid) return;
    const list = readKey(KEY_MY_LIST);
    if (!list.length) {
      grid.innerHTML = '<p class="col-span-full text-sm text-on-surface-variant">Tu Mi Lista est? vacia.</p>';
      return;
    }
    grid.innerHTML = list.map((it) => `
      <div class="group cursor-pointer">
        <div class="aspect-[2/3] rounded-lg overflow-hidden bg-surface-container-high relative mb-2">
          <img alt="${it.title}" class="w-full h-full object-cover" src="${it.image || ""}"/>
          <button type="button" data-remove-my-list data-title="${it.title}" class="absolute top-2 right-2 p-1.5 glass-effect bg-black/40 rounded-full">
            <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">checklist</span>
          </button>
        </div>
        <h5 class="text-sm font-bold truncate px-1">${it.title}</h5>
      </div>`).join("");

    grid.querySelectorAll("[data-remove-my-list]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        const t = b.getAttribute("data-title") || "";
        remove(KEY_MY_LIST, t);
        renderUserMyList();
        document.querySelectorAll("[data-add-my-list]").forEach((btn) => {
          if (norm(getButtonTitle(btn)) === norm(t)) setMyListDefaultState(btn);
        });
      });
    });
  };

  const renderUserFavorites = () => {
    const grid = document.getElementById("favorites-grid");
    if (!grid) return;
    const list = readKey(KEY_FAVORITES);
    if (!list.length) {
      grid.innerHTML = '<p class="col-span-full text-sm text-on-surface-variant">No hay favoritos aun.</p>';
      return;
    }
    grid.innerHTML = list.map((it) => `
      <div class="group cursor-pointer">
        <div class="aspect-[2/3] relative mb-2">
          <div class="absolute inset-0 rounded-lg overflow-hidden bg-surface-container-high">
            <img alt="${it.title}" class="w-full h-full object-cover" src="${it.image || ""}"/>
          </div>
          <button type="button" data-remove-favorite data-title="${it.title}" class="absolute top-2 right-2 p-1.5 glass-effect bg-black/40 rounded-full group/remove">
            <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">favorite</span>
            <span class="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white opacity-0 transition-opacity duration-150 group-hover/remove:opacity-100 z-20">Eliminar de Favoritos</span>
          </button>
        </div>
        <h5 class="text-sm font-bold truncate px-1">${it.title}</h5>
      </div>`).join("");

    grid.querySelectorAll("[data-remove-favorite]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        const t = b.getAttribute("data-title") || "";
        remove(KEY_FAVORITES, t);
        renderUserFavorites();
        document.querySelectorAll("[data-add-favorite]").forEach((btn) => {
          if (norm(getButtonTitle(btn)) === norm(t)) setFavoriteDefaultState(btn);
        });
      });
    });
  };

  window.AniDexFavorites = {
    init() {
      bindMyListButtons();
      bindFavoriteButtons();
      renderUserMyList();
      renderUserFavorites();
      setTimeout(() => {
        document.querySelectorAll("[data-add-my-list]").forEach(refreshMyListButtonState);
        document.querySelectorAll("[data-add-favorite]").forEach(refreshFavoriteButtonState);
      }, 700);
    },
    refresh() {
      document.querySelectorAll("[data-add-my-list]").forEach(refreshMyListButtonState);
      document.querySelectorAll("[data-add-favorite]").forEach(refreshFavoriteButtonState);
    }
  };
})();
