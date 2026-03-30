// Page 1 Products Management
const Products = {

    products: [],
    editingProductId: null,

    async loadProducts() {

        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/products/my-products", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const products = await res.json();
        this.products = products;

        const grid = document.getElementById('productsGrid');

        if (products.length === 0) {
            grid.innerHTML = '<p class="empty-state">No products added yet. Click "Add Product" to get started.</p>';
            return;
        }

        // ✅ SIMPLE + STRICT GROUPING
        const grouped = {};

        products.forEach(p => {

            // Clean category (same everywhere)
            let cat = p.category ? p.category.trim().toLowerCase() : "general";
            if (!cat) cat = "general";

            if (!grouped[cat]) {
                grouped[cat] = [];
            }

            grouped[cat].push(p);

        });

        const sortedCats = Object.keys(grouped).sort();

        grid.innerHTML = sortedCats.map(cat => {

            const group = grouped[cat];
            const displayName = cat.charAt(0).toUpperCase() + cat.slice(1);

            return `
                <div class="category-group" style="grid-column: 1 / -1; margin-bottom: 40px; width: 100%;">

                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <h2 style="font-size: 22px; color: var(--primary-color); margin-right: 20px;">
                            ${displayName}
                        </h2>
                        <div style="height: 2px; background: #eee; width: 100%;"></div>
                    </div>

                    <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; width: 100%;">

                        ${group.map(product => `
                            <div class="product-card ${product.stock < 10 ? 'low-stock' : ''}">

                                <div class="product-header">
                                    <div class="product-name">${product.name}</div>

                                    <div style="font-size: 11px; color: #7f8c8d; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">
                                        Category: ${product.category}
                                    </div>

                                    <div class="product-details">
                                        <span>₹${product.price}</span>
                                        <span>GST: ${product.gst}%</span>
                                    </div>
                                </div>

                                <div class="product-details" style="margin-bottom: 15px;">
                                    <span>Stock: ${product.stock} units</span>
                                    <span>${product.stock < 10 ? '⚠️ Low Stock' : '✓ In Stock'}</span>
                                </div>

                                <p style="font-size: 13px; color: #666; margin-bottom: 15px; min-height: 40px;">
                                    ${product.description || 'No description available.'}
                                </p>

                                <div class="product-actions">
                                    <button class="btn btn-secondary" onclick="editProduct('${product._id}')">Edit</button>
                                    <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                                </div>

                            </div>
                        `).join('')}

                    </div>
                </div>
            `;
        }).join('');
    },


    async addProduct(name, price, gst, quantity, description, category) {

        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/products/add", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify({
                name,
                price,
                gst,
                quantity,
                description,
                category: category.trim().toLowerCase() // ✅ FIX
            })

        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Failed to add product");
            return false;
        }

        alert("Product added successfully!");

        await this.loadProducts();

        return true;
    },


    async updateProduct(id, name, price, gst, quantity, description, category) {

        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/products/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify({
                name,
                price,
                gst,
                stock: Number(quantity),
                description,
                category: category.trim().toLowerCase() // ✅ FIX
            })

        });

        if (!res.ok) {
            alert("Update failed");
            return false;
        }

        alert("Product updated successfully!");

        await this.loadProducts();

        return true;
    },


    async deleteProduct(id) {

        if (!confirm("Are you sure you want to delete this product?")) return;

        const token = localStorage.getItem("token");

        await fetch(`http://localhost:5000/api/products/${id}`, {

            method: "DELETE",

            headers: {
                "Authorization": "Bearer " + token
            }

        });

        alert("Product deleted successfully!");

        this.loadProducts();
    },


    getProduct(id) {
        return this.products.find(p => p._id === id);
    }

};


// Modal functions
function openProductModal() {
    Products.editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    openModal('productModal');
}

function closeProductModal() {
    closeModal('productModal');
    Products.editingProductId = null;
}

function editProduct(productId) {

    const product = Products.getProduct(productId);
    if (!product) return;

    Products.editingProductId = productId;

    document.getElementById('modalTitle').textContent = 'Edit Product';

    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productGST').value = product.gst;
    document.getElementById('productQuantity').value = product.stock;
    document.getElementById('productDescription').value = product.description || '';

    openModal('productModal');
}

function deleteProduct(productId) {
    Products.deleteProduct(productId);
}


// Form submission
document.addEventListener('DOMContentLoaded', function () {

    const productForm = document.getElementById('productForm');

    if (productForm) {

        productForm.addEventListener('submit', async function (e) {

            e.preventDefault();

            const name = document.getElementById('productName').value;
            const category = document.getElementById('productCategory').value.trim().toLowerCase();
            const price = document.getElementById('productPrice').value;
            const gst = document.getElementById('productGST').value;
            const quantity = document.getElementById('productQuantity').value;
            const description = document.getElementById('productDescription').value;

            if (Products.editingProductId) {

                const success = await Products.updateProduct(
                    Products.editingProductId,
                    name,
                    price,
                    gst,
                    quantity,
                    description,
                    category
                );

                if (success) closeProductModal();

            } else {

                const success = await Products.addProduct(
                    name,
                    price,
                    gst,
                    quantity,
                    description,
                    category
                );

                if (success) closeProductModal();
            }

        });

    }

    // User info
    const userName = localStorage.getItem('name') || 'User';
    const userRole = localStorage.getItem('role') || 'Unknown';

    document.getElementById('userName').textContent = userName;
    document.getElementById('userRole').textContent = userRole;

    // Retailer restriction
    if (userRole === 'retailer') {

        const btn = document.querySelector('.page-header .btn-primary');
        if (btn) btn.style.display = 'none';

        const msg = document.createElement('p');
        msg.textContent = 'Retailers cannot add products.';
        msg.style.color = 'red';

        document.querySelector('.header-content').appendChild(msg);
    }

    Products.loadProducts();

});
