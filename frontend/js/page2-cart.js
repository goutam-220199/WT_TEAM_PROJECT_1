// Page 2 Cart

function ensureRetailerPage() {
  const role = localStorage.getItem('role');
  if (!role) {
    window.location.href = 'index.html';
    return false;
  }
  if (role === 'wholesaler' || role === 'manufacturer' || role === 'distributor') {
    window.location.href = 'page1-dashboard.html';
    return false;
  }
  return true;
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function formatCurrency(value) {
  return '₹' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cartContainer');

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-state">Your cart is empty.</p>';
    updateTotals();
    return;
  }

  // Group by category
  const categories = {};
  cart.forEach((item, index) => {
    const cat = item.category || "General";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push({ ...item, index });
  });

  container.innerHTML = "";
  for (const [cat, items] of Object.entries(categories)) {
    const section = document.createElement("div");
    section.className = "cart-section";
    section.innerHTML = `<h3>${cat}</h3>`;

    const grid = document.createElement("div");
    grid.className = "cart-grid";

    items.forEach(({ index, ...item }) => {
      const card = document.createElement("div");
      card.className = "cart-card";
      const itemTotal = (item.price * item.quantity) + ((item.price * item.gst / 100) * item.quantity);
      card.innerHTML = `
        <h4>${item.name}</h4>
        <p>Price: ${formatCurrency(item.price)}</p>
        <p>GST: ${item.gst}%</p>
        <p>Quantity: <input type="number" min="1" max="${item.stock}" value="${item.quantity}" class="quantity-input" onchange="updateCartQuantity(${index}, this.value)"></p>
        <p>Total: ${formatCurrency(itemTotal)}</p>
        <button class="order-btn" onclick="orderProduct(${index})">Order Product</button>
        <button class="btn btn-danger" onclick="removeCartItem(${index})" style="margin-left: 10px;">Remove</button>
      `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  }

  updateTotals();
}

function updateTotals() {
  const cart = getCart();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstTotal = cart.reduce((sum, item) => sum + ((item.price * item.gst / 100) * item.quantity), 0);
  const total = subtotal + gstTotal;

  document.getElementById('cartSubtotal').textContent = formatCurrency(subtotal);
  document.getElementById('cartGst').textContent = formatCurrency(gstTotal);
  document.getElementById('cartTotal').textContent = formatCurrency(total);
}

function updateCartQuantity(index, quantity) {
  const cart = getCart();
  const qty = Number(quantity);
  if (qty < 1) return;
  if (qty > cart[index].stock) {
    alert('Cannot exceed available stock');
    return;
  }
  cart[index].quantity = qty;
  saveCart(cart);
  renderCart();
}

function removeCartItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

async function orderProduct(index) {
  const cart = getCart();
  const item = cart[index];

  const supplierId = item.supplierId;
  const items = [{
    product: item.productId,
    quantity: item.quantity,
    price: item.price,
    gst: item.gst,
    total: (item.price * item.quantity) + ((item.price * item.gst / 100) * item.quantity)
  }];

  const token = localStorage.getItem('token');

  try {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ supplierId, items })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to place order');
      return;
    }

    if (data.order && data.order.status === 'low_stock') {
      showToast('Stock is low for this product. Order not placed.', 'error');
      return;
    }

    cart.splice(index, 1);
    saveCart(cart);
    renderCart();

    showToast('Order placed successfully.', 'success');
  } catch (err) {
    console.error(err);
    window.alert('Failed to place order. Please try again later.');
    }
}

async function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Add items to cart before placing an order');
    return;
  }

  const groupedBySupplier = cart.reduce((groups, item) => {
    if (!groups[item.supplierId]) groups[item.supplierId] = [];
    groups[item.supplierId].push(item);
    return groups;
  }, {});

  const token = localStorage.getItem('token');
  const results = [];

  for (const supplierId in groupedBySupplier) {
    const items = groupedBySupplier[supplierId].map(item => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
      gst: item.gst,
      total: (item.price * item.quantity) + ((item.price * item.gst / 100) * item.quantity)
    }));

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ supplierId, items })
      });
      const data = await res.json();

      if (!res.ok || (data.order && data.order.status === 'low_stock')) {
        results.push({ supplierId, success: false, message: data.message || 'Stock low or order failed' });
        continue;
      }

      results.push({ supplierId, success: true, orderId: data.order._id });
    } catch (err) {
      console.error(err);
      results.push({ supplierId, success: false, message: 'Network error' });
    }
  }

  // Remove successfully ordered items from cart
  const failedSuppliers = results.filter(r => !r.success).map(r => r.supplierId);
  const updatedCart = cart.filter(item => failedSuppliers.includes(item.supplierId));
  saveCart(updatedCart);
  renderCart();

  if (results.some(r => r.success)) {
    alert('Order(s) placed successfully.');
  }

  const failed = results.filter(r => !r.success);
  if (failed.length) {
    alert('Some orders failed due to low stock or errors.');
  }
}

async function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Add items to cart before placing an order', 'error');
    return;
  }

  const groupedBySupplier = cart.reduce((groups, item) => {
    if (!groups[item.supplierId]) groups[item.supplierId] = [];
    groups[item.supplierId].push(item);
    return groups;
  }, {});

  const token = localStorage.getItem('token');
  const results = [];

  for (const supplierId in groupedBySupplier) {
    const items = groupedBySupplier[supplierId].map(item => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
      gst: item.gst,
      total: (item.price * item.quantity) + ((item.price * item.gst / 100) * item.quantity)
    }));

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ supplierId, items })
      });
      const data = await res.json();

      if (!res.ok || (data.order && data.order.status === 'low_stock')) {
        results.push({ supplierId, success: false, message: data.message || 'Stock low or order failed' });
        continue;
      }

      results.push({ supplierId, success: true, orderId: data.order._id });
    } catch (err) {
      console.error(err);
      results.push({ supplierId, success: false, message: 'Network error' });
    }
  }

  // Remove successfully ordered items from cart
  const failedSuppliers = results.filter(r => !r.success).map(r => r.supplierId);
  const updatedCart = cart.filter(item => failedSuppliers.includes(item.supplierId));
  saveCart(updatedCart);
  renderCart();

  if (results.some(r => r.success)) {
    showToast('Order(s) placed successfully.', 'success');
  }

  const failed = results.filter(r => !r.success);
  if (failed.length) {
    showToast('Some orders failed due to low stock or errors.', 'error');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  renderCart();

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', placeOrder);
  }
});
