// ---------- 1. Interface (custom type) ----------
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

// ---------- 2. Basic types & constants ----------
const CATEGORIES: string[] = ['Electronics', 'Clothing', 'Books', 'Food', 'Other'];
const LOW_STOCK_THRESHOLD: number = 5;

// ---------- 3. Module-scoped state ----------
let products: Product[] = [];
let nextId: number = 1;

// ---------- 4. DOM references (type assertions) ----------
const form = document.getElementById('product-form') as HTMLFormElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const categorySelect = document.getElementById('category') as HTMLSelectElement;
const priceInput = document.getElementById('price') as HTMLInputElement;
const quantityInput = document.getElementById('quantity') as HTMLInputElement;
const messageEl = document.getElementById('message') as HTMLParagraphElement;

const statProducts = document.getElementById('stat-products') as HTMLSpanElement;
const statUnits = document.getElementById('stat-units') as HTMLSpanElement;
const statValue = document.getElementById('stat-value') as HTMLSpanElement;
const statLow = document.getElementById('stat-low') as HTMLSpanElement;

const searchInput = document.getElementById('search') as HTMLInputElement;
const filterCategory = document.getElementById('filter-category') as HTMLSelectElement;
const clearAllBtn = document.getElementById('clear-all') as HTMLButtonElement;
const tbody = document.getElementById('product-rows') as HTMLTableSectionElement;

// ---------- 5. Functions ----------

function formatCurrency(value: number): string {
  return '₹' + value.toFixed(2);
}

function saveToLocalStorage(): void {
  localStorage.setItem('inventory', JSON.stringify(products));
  localStorage.setItem('nextId', nextId.toString());
}

function loadFromLocalStorage(): void {
  const stored = localStorage.getItem('inventory');
  if (stored) {
    products = JSON.parse(stored) as Product[];
    nextId = parseInt(localStorage.getItem('nextId') || '1', 10);
  } else {
    seedProducts();
  }
}

function seedProducts(): void {
  products = [
    { id: nextId++, name: 'Wireless Mouse', category: 'Electronics', price: 799, quantity: 12 },
    { id: nextId++, name: 'Cotton T-Shirt', category: 'Clothing', price: 499, quantity: 3 },
    { id: nextId++, name: 'TypeScript Handbook', category: 'Books', price: 350, quantity: 7 },
    { id: nextId++, name: 'Organic Coffee', category: 'Food', price: 250, quantity: 2 },
  ];
  saveToLocalStorage();
}

function updateStats(): void {
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStockCount = products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD).length;

  statProducts.textContent = totalProducts.toString();
  statUnits.textContent = totalUnits.toString();
  statValue.textContent = formatCurrency(totalValue);
  statLow.textContent = lowStockCount.toString();
}

function renderProducts(): void {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const categoryFilter = filterCategory.value;

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" style="text-align:center; color:#94a3b8;">No products found</td>`;
    tbody.appendChild(row);
    return;
  }

  filtered.forEach(p => {
    const row = document.createElement('tr');

    const value = p.price * p.quantity;
    const lowStock = p.quantity <= LOW_STOCK_THRESHOLD;

    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${formatCurrency(p.price)}</td>
      <td style="color:${lowStock ? '#dc2626' : 'inherit'}; font-weight:${lowStock ? 'bold' : 'normal'}">${p.quantity}</td>
      <td>${formatCurrency(value)}</td>
      <td class="actions"></td>
    `;

    const actionsCell = row.querySelector('.actions') as HTMLTableCellElement;

    // Decrease quantity
    const decBtn = document.createElement('button');
    decBtn.textContent = '−';
    decBtn.className = 'btn small';
    decBtn.style.marginRight = '4px';
    decBtn.onclick = () => changeQuantity(p.id, -1);

    // Increase quantity
    const incBtn = document.createElement('button');
    incBtn.textContent = '+';
    incBtn.className = 'btn small';
    incBtn.style.marginRight = '4px';
    incBtn.onclick = () => changeQuantity(p.id, 1);

    // Delete
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.className = 'btn small danger';
    delBtn.onclick = () => deleteProduct(p.id);

    actionsCell.appendChild(decBtn);
    actionsCell.appendChild(incBtn);
    actionsCell.appendChild(delBtn);

    tbody.appendChild(row);
  });
}

function changeQuantity(id: number, delta: number): void {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const newQty = product.quantity + delta;
  if (newQty < 0) return;
  product.quantity = newQty;
  saveToLocalStorage();
  refreshUI();
}

function deleteProduct(id: number): void {
  if (!confirm('Delete this product?')) return;
  products = products.filter(p => p.id !== id);
  saveToLocalStorage();
  refreshUI();
}

function addProduct(event: Event): void {
  event.preventDefault();

  const name = nameInput.value.trim();
  const category = categorySelect.value;
  const price = parseFloat(priceInput.value);
  const quantity = parseInt(quantityInput.value, 10);

  if (!name || !category || isNaN(price) || price < 0 || isNaN(quantity) || quantity < 0) {
    messageEl.textContent = '⚠️ Please fill all fields with valid values.';
    messageEl.style.color = '#dc2626';
    return;
  }

  const newProduct: Product = {
    id: nextId++,
    name,
    category,
    price,
    quantity,
  };

  products.push(newProduct);
  saveToLocalStorage();
  form.reset();

  messageEl.textContent = `✅ "${name}" added successfully!`;
  messageEl.style.color = '#16a34a';

  refreshUI();
}

function clearAll(): void {
  if (products.length === 0) return;
  if (!confirm('Are you sure you want to delete ALL products?')) return;
  products = [];
  nextId = 1;
  saveToLocalStorage();
  refreshUI();
  messageEl.textContent = '🗑️ All products cleared.';
  messageEl.style.color = '#dc2626';
}

function refreshUI(): void {
  renderProducts();
  updateStats();
}

function populateCategories(): void {
  // For the add form
  categorySelect.innerHTML = CATEGORIES.map(
    c => `<option value="${c}">${c}</option>`
  ).join('');

  // For the filter
  filterCategory.innerHTML =
    `<option value="all">All Categories</option>` +
    CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
}

// ---------- 6. Event listeners & initialization ----------
function init(): void {
  populateCategories();
  loadFromLocalStorage();
  refreshUI();

  form.addEventListener('submit', addProduct);
  searchInput.addEventListener('input', renderProducts);
  filterCategory.addEventListener('change', renderProducts);
  clearAllBtn.addEventListener('click', clearAll);
}


document.addEventListener('DOMContentLoaded', init);