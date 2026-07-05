const STORAGE_KEY = "funko-collection-items";

const seedItems = [
  { id: "spider-man-923", name: "Spider-Man Integrated Suit", series: "Marvel", number: "923", value: 24, status: "owned" },
  { id: "aang-541", name: "Aang with Momo", series: "Avatar", number: "541", value: 38, status: "wishlist" },
  { id: "mando-345", name: "The Mandalorian", series: "Star Wars", number: "345", value: 31, status: "owned" },
  { id: "miles-765", name: "Miles Morales", series: "Spider-Verse", number: "765", value: 18, status: "preorder" },
];

let items = loadItems();

const grid = document.querySelector("#collectionGrid");
const summary = document.querySelector("#summary");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const sortSelect = document.querySelector("#sortSelect");
const addForm = document.querySelector("#addForm");
const resetButton = document.querySelector("#resetButton");

function loadItems() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [...seedItems];

  try {
    return JSON.parse(stored);
  } catch {
    return [...seedItems];
  }
}

function saveItems() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getVisibleItems() {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const sort = sortSelect.value;

  return items
    .filter((item) => {
      const searchable = `${item.name} ${item.series} ${item.number}`.toLowerCase();
      return searchable.includes(query) && (status === "all" || item.status === status);
    })
    .sort((a, b) => {
      if (sort === "value") return Number(b.value || 0) - Number(a.value || 0);
      return String(a[sort]).localeCompare(String(b[sort]));
    });
}

function renderSummary() {
  const owned = items.filter((item) => item.status === "owned").length;
  const wishlist = items.filter((item) => item.status === "wishlist").length;
  const totalValue = items.reduce((sum, item) => sum + Number(item.value || 0), 0);

  summary.innerHTML = `
    <div class="stat"><strong>${items.length}</strong><span>Total figures</span></div>
    <div class="stat"><strong>${owned}</strong><span>Owned</span></div>
    <div class="stat"><strong>$${totalValue}</strong><span>Est. value</span></div>
  `;

  summary.setAttribute("aria-label", `${items.length} total figures, ${owned} owned, ${wishlist} wishlist`);
}

function renderGrid() {
  const visibleItems = getVisibleItems();
  emptyState.classList.toggle("visible", visibleItems.length === 0);

  grid.innerHTML = visibleItems
    .map(
      (item) => `
        <article class="card">
          <div class="figure-art" aria-hidden="true">${getInitials(item.name)}</div>
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p class="meta">${escapeHtml(item.series)} ${item.number ? `#${escapeHtml(item.number)}` : ""}</p>
          </div>
          <div class="card-bottom">
            <span class="pill ${item.status}">${item.status}</span>
            <span class="value">$${Number(item.value || 0)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function render() {
  renderSummary();
  renderGrid();
}

function getInitials(name) {
  return name.split(/s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

searchInput.addEventListener("input", renderGrid);
statusFilter.addEventListener("change", renderGrid);
sortSelect.addEventListener("change", renderGrid);

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(addForm);
  const name = String(formData.get("name")).trim();
  const series = String(formData.get("series")).trim();
  const number = String(formData.get("number")).trim();
  const value = Number(formData.get("value") || 0);
  const status = String(formData.get("status"));

  items = [{ id: `${slugify(name)}-${Date.now()}`, name, series, number, value, status }, ...items];
  saveItems();
  addForm.reset();
  render();
});

resetButton.addEventListener("click", () => {
  items = [...seedItems];
  saveItems();
  searchInput.value = "";
  statusFilter.value = "all";
  sortSelect.value = "name";
  render();
});

saveItems();
render();
