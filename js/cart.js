const CART_KEY = "ml_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const cart = raw ? JSON.parse(raw) : [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function getCartCount(cart = loadCart()) {
  return cart.reduce((acc, item) => acc + (item.qty || 0), 0);
}

function formatMoneyARS(value) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value}`;
  }
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  badge.textContent = String(getCartCount());
}

function addToCart(product) {
  const cart = loadCart();
  const existing = cart.find((p) => p.id === product.id);

  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });

  saveCart(cart);
}

function incQty(id) {
  const cart = loadCart();
  const item = cart.find((p) => p.id === id);
  if (!item) return;
  item.qty += 1;
  saveCart(cart);
  renderCartPage();
}

function decQty(id) {
  const cart = loadCart();
  const item = cart.find((p) => p.id === id);
  if (!item) return;

  item.qty -= 1;
  const next = cart.filter((p) => p.qty > 0);

  saveCart(next);
  renderCartPage();
}

function removeItem(id) {
  const cart = loadCart();
  const next = cart.filter((p) => p.id !== id);
  saveCart(next);
  renderCartPage();
}

function clearCart() {
  saveCart([]);
  renderCartPage();
}

function getProductFromElement(el) {
  const id = el.getAttribute("data-id");
  const name = el.getAttribute("data-name");
  const price = Number(el.getAttribute("data-price"));
  const img = el.getAttribute("data-img") || "";

  if (!id || !name || Number.isNaN(price)) return null;
  return { id, name, price, img };
}

function goToCart() {
  window.location.href = "/pages/carrito.html";
}

function bindAddButtons() {
  const buttons = document.querySelectorAll("[data-add-to-cart]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const product = getProductFromElement(btn);
      if (!product) return;

      addToCart(product);
    });
  });
}

function bindProductCardsClickToAddAndGo() {
  const cards = document.querySelectorAll(".card-menu");
  cards.forEach((card) => {
    const btn = card.querySelector("[data-add-to-cart]");
    if (!btn) return;

    const product = getProductFromElement(btn);
    if (!product) return;

    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      const isButton = e.target && e.target.closest && e.target.closest("[data-add-to-cart]");
      if (isButton) return;

      e.preventDefault();
      addToCart(product);
      goToCart();
    });
  });
}

function renderCartPage() {
  const container = document.getElementById("cart-items");
  const summary = document.getElementById("cart-summary");
  if (!container || !summary) return;

  const cart = loadCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning mb-0">Tu carrito está vacío.</div>
      </div>
    `;
    summary.innerHTML = "";
    return;
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  container.innerHTML = cart
    .map((item) => {
      const itemTotal = item.price * item.qty;

      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 card-menu border-0">
            <img src="${item.img}" class="card-img-top" alt="${item.name}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-1">${item.name}</h5>
              <h6 class="mb-2">${formatMoneyARS(item.price)}</h6>

              <div class="d-flex align-items-center gap-2 mb-2">
                <button type="button" class="btn btn-sm btn-outline-secondary" data-dec="${item.id}">-</button>
                <span class="fw-bold">${item.qty}</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" data-inc="${item.id}">+</button>
              </div>

              <p class="small text-muted mb-3">Subtotal: ${formatMoneyARS(itemTotal)}</p>

              <div class="mt-auto">
                <button type="button" class="btn btn-sm btn-danger w-100" data-remove="${item.id}">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  summary.innerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h5 class="mb-3">Resumen</h5>
        <p class="mb-2">Productos: <strong>${getCartCount(cart)}</strong></p>
        <p class="mb-3">Total: <strong>${formatMoneyARS(total)}</strong></p>

        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-danger w-100" id="btn-clear-cart">Vaciar carrito</button>
          <button type="button" class="btn btn-success w-100">Finalizar compra</button>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll("[data-inc]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      incQty(b.getAttribute("data-inc"));
    })
  );

  container.querySelectorAll("[data-dec]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      decQty(b.getAttribute("data-dec"));
    })
  );

  container.querySelectorAll("[data-remove]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeItem(b.getAttribute("data-remove"));
    })
  );

  const btnClear = document.getElementById("btn-clear-cart");
  if (btnClear)
    btnClear.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearCart();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  bindAddButtons();
  bindProductCardsClickToAddAndGo();
  renderCartPage();

  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (e) => e.preventDefault());
  });
});