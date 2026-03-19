(() => {
  const API = "https://api.jikan.moe/v4";
  const qp = new URLSearchParams(location.search);
  const animeId = qp.get("anime_id");
  const charId = qp.get("char_id");

  const init = async () => {
    if (!animeId || !charId) return;
    const res = await fetch(`${API}/anime/${animeId}/characters`);
    if (!res.ok) return;
    const json = await res.json();
    const ch = (json?.data || []).find((x) => String(x?.character?.mal_id) === String(charId));
    if (!ch) return;
    const c = ch.character || {};
    const vas = ch.voice_actors || [];
    const jp = vas.find((v) => v.language === "Japanese")?.person?.name || "N/A";
    const en = vas.find((v) => v.language === "English")?.person?.name || "N/A";
    const es = vas.find((v) => /spanish/i.test(v.language || ""))?.person?.name || "N/A";

    const title = document.getElementById("char-title");
    const img = document.getElementById("char-image");
    const about = document.getElementById("char-about");
    const info = document.getElementById("char-info");
    if (title) title.textContent = c.name || "Personaje";
    if (img) img.src = c?.images?.jpg?.image_url || "";
    if (about) about.textContent = c.about || "Sin descripción disponible.";
    if (info) {
      info.innerHTML = `
        <p><strong>Doblaje japonés:</strong> ${jp}</p>
        <p><strong>Doblaje inglés:</strong> ${en}</p>
        <p><strong>Doblaje español:</strong> ${es}</p>
        <p><strong>Creador:</strong> N/A (no disponible en endpoint)</p>
      `;
    }
  };

  window.AniDexCharacterData = { init };
})();
