// Supplier Products Page

let allProducts = [];
let currentFilter = 'All';

async function loadSupplier() {
    const urlParams = new URLSearchParams(window.location.search);
    const supplierId = urlParams.get('supplierId');
    if (!supplierId) {
        alert('Supplier ID not found');
        return;
    }

    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });
    const supplier = await res.json();
    document.getElementById('supplierName').textContent = supplier.name;
}

async function loadProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const supplierId = urlParams.get('supplierId');
    if (!supplierId) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/products/by-supplier/${supplierId}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });
    allProducts = await res.json();
    createFilterButtons();
    displayProducts();
}

function createFilterButtons() {
    const categories = new Set(allProducts.map(p => p.category || 'General'));
    const buttons = ['All', ...Array.from(categories)];

    const container = document.getElementById('filterButtons');
    container.innerHTML = buttons.map(cat => `
        <button class="filter-btn ${cat === currentFilter ? 'active' : ''}" onclick="filterProducts('${cat}')">${cat}</button>
    `).join('');
}

function filterProducts(category) {
    currentFilter = category;
    createFilterButtons();
    displayProducts();
}

function displayProducts() {
    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    let productsToShow = allProducts;
    if (currentFilter !== 'All') {
        productsToShow = allProducts.filter(p => (p.category || 'General') === currentFilter);
    }

    // Group by category
    const categories = {};
    productsToShow.forEach(product => {
        const cat = product.category || "General";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(product);
    });

    for (const [cat, products] of Object.entries(categories)) {
        const section = document.createElement("div");
        section.className = "product-section";
        section.innerHTML = `<h3>${cat}</h3>`;

        const grid = document.createElement("div");
        grid.className = "products-grid";

        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <h4>${product.name}</h4>
                <p>Price: ₹${product.price}</p>
                <p>GST: ${product.gst}%</p>
                <p>Stock: ${product.stock}</p>
                <button class="add-to-cart-btn" onclick="addToCart('${product._id}', '${product.owner}', '${product.name}', '${product.price}', '${product.gst}', '${product.stock}')">Add to Cart</button>
            `;
            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }
}

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

function addToCart(productId, supplierId, name, price, gst, stock, category = 'General') {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId,
            quantity: 1,
            supplierId,
            name,
            price: Number(price),
            gst: Number(gst),
            stock: Number(stock),
            category: category || 'General'
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
}

async function init() {
    if (!ensureRetailerPage()) return;
    await loadSupplier();
    await loadProducts();
}

document.addEventListener("DOMContentLoaded", init);