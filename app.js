// Vérification que DATABASE est bien chargé
if (typeof DATABASE === "undefined") {
  console.error("DATABASE non chargé !");
}

// État global
let currentLevel = null;

// Fonction appelée par les boutons
function selectLevel(level) {
  console.log("Niveau sélectionné :", level);
  currentLevel = level;

  // UI (activation bouton)
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const activeBtn = document.querySelector(`[data-level="${level}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Afficher sections
  document.getElementById("cats-section").style.display = "block";
  document.getElementById("tabs-section").style.display = "grid";

  // Exemple : filtrer les catégories
  loadCategories();
}

// Charger catégories dynamiques
function loadCategories() {
  const catsContainer = document.getElementById("cats");
  catsContainer.innerHTML = "";

  let filtered = DATABASE;

  if (currentLevel !== "random") {
    filtered = DATABASE.filter(item => item.level === currentLevel);
  }

  const categories = [...new Set(filtered.map(item => item.cat))];

  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "cat";
    div.textContent = cat;
    catsContainer.appendChild(div);
  });
}
