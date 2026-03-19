(() => {
  const API = "https://api.jikan.moe/v4";
  const qp = new URLSearchParams(location.search);
  const animeId = qp.get("anime_id");

  const init = async () => {
    if (!animeId) return;
    const res = await fetch(`${API}/anime/${animeId}/characters`);
    if (!res.ok) return;
    const json = await res.json();
    const list = json?.data || [];
    const wrap = document.getElementById("chars-list");
    if (!wrap) return;
    wrap.innerHTML = list.map((x) => {
      const c = x.character || {};
      const jp = (x.voice_actors || []).find((v) => v.language === "Japanese")?.person?.name || "N/A";
      return `
        <a href="character.html?anime_id=${animeId}&char_id=${c.mal_id}" class="grid grid-cols-[110px_1fr] gap-4 border border-zinc-700 p-3">
          <img src="${c?.images?.jpg?.image_url || ""}" class="w-[110px] h-[110px] object-cover" alt="${c.name || "Personaje"}"/>
          <div>
            <h3 class="font-bold text-lg">${c.name || "Personaje"}</h3>
            <p class="text-sm text-zinc-300">Rol: ${x.role || "N/A"}</p>
            <p class="text-sm text-zinc-300">Doblaje JP: ${jp}</p>
          </div>
        </a>
      `;
    }).join("");
  };

  window.AniDexCharactersData = { init };
})();
