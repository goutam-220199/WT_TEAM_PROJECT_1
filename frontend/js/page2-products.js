// Page 2 Products

let approvedSuppliers = [];
let allProducts = [];

async function loadApprovedSuppliers() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/supplier-request/approved", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });
    const data = await res.json();
    approvedSuppliers = data.map(req => req.supplier._id);
}

async function loadProducts() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/products/all", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });
    allProducts = await res.json();
    displayProducts();
}
function displayProducts() {
    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    if (!Array.isArray(allProducts) || allProducts.length === 0) {
        container.innerHTML = '<p class="empty-state">No products found.</p>';
        return;
    }

    // Group by category
    const categories = {};
    allProducts.forEach(product => {
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
            const supplierName = product.owner?.name || 'Unknown Supplier';
            const supplierId = product.owner?._id || product.owner || '';

            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <h4>${product.name}</h4>
                <p>Stock: ${product.stock}</p>
                <p>Supplier: ${supplierName}</p>
                <p>Price: ₹${product.price}</p>
                <p>GST: ${product.gst}%</p> 
            `;

            if (approvedSuppliers.includes(supplierId)) {
                const btn = document.createElement("button");
                btn.className = "add-to-cart-btn";
                btn.textContent = "Add to Cart";
                btn.onclick = () => addToCart(product);
                card.appendChild(btn);
            }

            grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
    }
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId: product._id,
            quantity: 1,
            supplierId: product.owner._id,
            name: product.name,
            price: product.price,
            gst: product.gst,
            category: product.category
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
    window.location.href='page2-cart.html';
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

async function init() {
    if (!ensureRetailerPage()) return;
    await loadApprovedSuppliers();
    await loadProducts();
}

document.addEventListener("DOMContentLoaded", init);