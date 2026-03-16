// Page 2 Cart

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
  const tbody = document.getElementById('cartBody');

  if (cart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Your cart is empty.</td></tr>';
    updateTotals();
    return;
  }

  tbody.innerHTML = cart.map((item, index) => {
    const itemTotal = (item.price * item.quantity) + ((item.price * item.gst / 100) * item.quantity);
    return `
      <tr>
        <td>${item.name}</td>
        <td><input type="number" min="1" max="${item.stock}" value="${item.quantity}" onchange="updateCartQuantity(${index}, this.value)"></td>
        <td>${formatCurrency(item.price)}</td>
        <td>${item.gst}%</td>
        <td>${formatCurrency(itemTotal)}</td>
        <td><button class="btn btn-danger" onclick="removeCartItem(${index})">Remove</button></td>
      </tr>
    `;
  }).join('');

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
    showToast('Cannot exceed available stock', 'error');
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

async function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Add items to cart before placing an order', 'error');
    return;
  }

  const supplierId = cart[0].supplierId;
  const items = cart.map(item => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    gst: item.gst,
    total: (item.price * item.quantity) + ((item.price * item.gst / 100) * item.quantity)
  }));

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
      showToast(data.message || 'Failed to place order', 'error');
      return;
    }

    // Clear cart once order is placed
    localStorage.removeItem('cart');
    renderCart();

    showToast('Order placed successfully. Supplier will receive a notification.', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to place order', 'error');
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
