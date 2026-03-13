// Page 1 Products Management
const Products = {

    products: [],
    editingProductId: null,

    // STEP 9: Load products from backend
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

        grid.innerHTML = products.map(product => `
            <div class="product-card ${product.quantity < 10 ? 'low-stock' : ''}">
                <div class="product-header">
                    <div class="product-name">${product.name}</div>
                    <div class="product-details">
                        <span>₹${product.price}</span>
                        <span>GST: ${product.gst}%</span>
                    </div>
                </div>

                <div class="product-details" style="margin-bottom: 15px;">
                    <span>Stock: ${product.quantity} units</span>
                    <span>${product.quantity < 10 ? '⚠️ Low Stock' : '✓ In Stock'}</span>
                </div>

                ${product.description ? `<p style="font-size: 13px; color: #666; margin-bottom: 15px;">${product.description}</p>` : ''}

                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="editProduct('${product._id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    },


    // STEP 8: Add product using backend API
    async addProduct(name, price, gst, quantity, description) {

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
                description
            })

        });

        const data = await res.json();

        if (!res.ok) {
            showToast("Failed to add product", "error");
            return false;
        }

        showToast("Product added successfully!", "success");

        await this.loadProducts();

        return true;
    },


    // Update product
    async updateProduct(id, name, price, gst, quantity, description) {

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
                description
            })

        });

        if (!res.ok) {
            showToast("Update failed", "error");
            return false;
        }

        showToast("Product updated successfully!", "success");

        await this.loadProducts();

        return true;
    },


    // Delete product
    async deleteProduct(id) {

        if (!confirm("Are you sure you want to delete this product?")) return;

        const token = localStorage.getItem("token");

        await fetch(`http://localhost:5000/api/products/${id}`, {

            method: "DELETE",

            headers: {
                "Authorization": "Bearer " + token
            }

        });

        showToast("Product deleted successfully!", "success");

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
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productGST').value = product.gst;
    document.getElementById('productQuantity').value = product.quantity;
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
                    description
                );

                if (success) closeProductModal();

            } else {

                const success = await Products.addProduct(
                    name,
                    price,
                    gst,
                    quantity,
                    description
                );

                if (success) closeProductModal();
            }

        });

    }

    Products.loadProducts();

});