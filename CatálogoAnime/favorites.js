(() => {
  const KEY = "anidex_my_list_v1";

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  };

  const write = (items) => localStorage.setItem(KEY, JSON.stringify(items));

  const upsertMyList = (item) => {
    const list = read();
    const id = (item.title || "").toLowerCase().trim();
    if (!id) return;
    const filtered = list.filter((x) => (x.title || "").toLowerCase().trim() !== id);
    filtered.unshift({ ...item, savedAt: Date.now() });
    write(filtered.slice(0, 80));
  };

  const removeFromMyList = (title) => {
    const id = (title || "").toLowerCase().trim();
    if (!id) return;
    const list = read().filter((x) => (x.title || "").toLowerCase().trim() !== id);
    write(list);
  };

  const existsInMyList = (title) => {
    const id = (title || "").toLowerCase().trim();
    if (!id) return false;
    return read().some((x) => (x.title || "").toLowerCase().trim() === id);
  };

  const detectFromPage = () => {
    const path = (location.pathname || "").toLowerCase();
    if (path.includes("detail")) {
      const title = document.querySelector("h1")?.textContent?.trim() || "Anime";
      const image =
        document.querySelector("main img")?.src ||
        "";
      return { title, image, type: "Anime" };
    }
    const heroTitle = document.getElementById("hero-title")?.textContent?.trim();
    const heroImage = document.getElementById("hero-image")?.src;
    if (heroTitle) return { title: heroTitle, image: heroImage || "", type: "Anime" };
    return null;
  };

  const detectTitleFromPage = () => detectFromPage()?.title || "";

  const setButtonAddedState = (btn) => {
    if (!btn) return;
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = "checklist";
    const labelNode = Array.from(btn.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim());
    if (labelNode) {
      labelNode.nodeValue = " AGREGADO";
    } else {
      const textEl = btn.querySelector("[data-add-label]");
      if (textEl) textEl.textContent = "AGREGADO";
      else btn.append(" AGREGADO");
    }
    btn.classList.add("opacity-80");
    btn.dataset.added = "1";
  };

  const setButtonDefaultState = (btn) => {
    if (!btn) return;
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) icon.textContent = "playlist_add";
    const textEl = btn.querySelector("[data-add-label]");
    const defaultLabel = btn.dataset.defaultLabel || "MI LISTA";
    if (textEl) textEl.textContent = defaultLabel;
    btn.classList.remove("opacity-80");
    btn.dataset.added = "0";
  };

  const getButtonTitle = (btn) => {
    const explicit = (btn.dataset.itemTitle || "").trim();
    if (explicit) return explicit;
    if (btn.dataset.dynamicTitle !== "0") {
      const t = detectTitleFromPage();
      if (t) btn.dataset.itemTitle = t;
      return t;
    }
    const t = detectTitleFromPage();
    return t;
  };

  const getButtonItem = (btn) => {
    const pageItem = detectFromPage() || {};
    const title = getButtonTitle(btn) || pageItem.title || "";
    const image = (btn.dataset.itemImage || "").trim() || pageItem.image || "";
    const type = (btn.dataset.itemType || "").trim() || pageItem.type || "Anime";
    return { title, image, type };
  };

  const refreshButtonState = (btn) => {
    const title = getButtonTitle(btn);
    if (!title) return;
    if (existsInMyList(title)) setButtonAddedState(btn);
    else setButtonDefaultState(btn);
  };

  const bindAddButtons = () => {
    const buttons = Array.from(document.querySelectorAll("[data-add-my-list]"));
    buttons.forEach((btn) => {
      if (btn.dataset.favBound === "1") return;
      btn.dataset.favBound = "1";
      if (!btn.dataset.dynamicTitle) btn.dataset.dynamicTitle = "1";
      const textEl = btn.querySelector("[data-add-label]");
      if (textEl && !btn.dataset.defaultLabel) {
        btn.dataset.defaultLabel = (textEl.textContent || "MI LISTA").trim();
      }
      setButtonDefaultState(btn);
      refreshButtonState(btn);
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const item = getButtonItem(btn);
        if (!item) return;
        btn.dataset.itemTitle = item.title;
        const already = existsInMyList(item.title);
        if (already) {
          removeFromMyList(item.title);
          setButtonDefaultState(btn);
        } else {
          upsertMyList(item);
          setButtonAddedState(btn);
        }
      });
    });

    // Re-evalua estado al volver a la pantalla o cuando cambia el título dinámico.
    setTimeout(() => buttons.forEach(refreshButtonState), 400);
    setTimeout(() => buttons.forEach(refreshButtonState), 1200);
  };

  const renderUserMyList = () => {
    const grid = document.getElementById("my-list-grid");
    if (!grid) return;
    const list = read();
    if (!list.length) {
      grid.innerHTML =
        '<p class="col-span-full text-sm text-on-surface-variant">Tu Mi Lista está vacía. Agrega títulos con "+ Mi Lista".</p>';
      return;
    }
    grid.innerHTML = list.map((it) => `
      <div class="group cursor-pointer">
        <div class="aspect-[2/3] rounded-lg overflow-hidden bg-surface-container-high relative mb-2">
          <img alt="${it.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${it.image || ""}"/>
          <button type="button" data-remove-my-list data-title="${it.title}" class="absolute top-2 right-2 p-1.5 glass-effect bg-black/40 rounded-full group/remove">
            <span class="material-symbols-outlined text-primary text-sm" style="font-variation-settings: 'FILL' 1;">checklist</span>
            <span class="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white opacity-0 transition-opacity duration-150 group-hover/remove:opacity-100">Eliminar</span>
          </button>
        </div>
        <h5 class="text-sm font-bold truncate px-1">${it.title}</h5>
        <p class="text-xs text-on-surface-variant px-1">${it.type || "Anime"}</p>
      </div>
    `).join("");

    grid.querySelectorAll("[data-remove-my-list]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const title = btn.getAttribute("data-title") || "";
        removeFromMyList(title);
        renderUserMyList();
        const current = detectFromPage();
        if (current && normalize(current.title) === normalize(title)) {
          document.querySelectorAll("[data-add-my-list]").forEach((addBtn) => setButtonDefaultState(addBtn));
        }
      });
    });
  };

  window.AniDexFavorites = {
    init() {
      bindAddButtons();
      renderUserMyList();
    },
    refresh() {
      document.querySelectorAll("[data-add-my-list]").forEach((btn) => refreshButtonState(btn));
    }
  };
})();
