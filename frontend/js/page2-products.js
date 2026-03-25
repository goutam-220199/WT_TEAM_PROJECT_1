// Page 2 Products Directory (Retailer View)
const Page2Products = {
    products: [],

    async loadAllProducts() {
        const token = localStorage.getItem("token");
        
        // We need an API to get ALL products from all approved suppliers
        // For now, let's assume we can fetch them or we might need a new endpoint.
        // If there's no "all products" endpoint, we might have to fetch them per supplier.
        // Let's check if there's a general products endpoint.
        
        try {
            const res = await fetch("http://localhost:5000/api/products/all", {
                headers: { "Authorization": "Bearer " + token }
            });

            if (!res.ok) {
                // If /all doesn't exist, we might need to handle it or use a different endpoint
                const data = await res.json();
                console.error("Failed to fetch all products:", data.message);
                document.getElementById('categorizedProducts').innerHTML = '<p class="empty-state">Failed to load products. Endpoint /api/products/all not found.</p>';
                return;
            }

            this.products = await res.json();
            this.renderCategorizedProducts();
        } catch (error) {
            console.error("Error loading products:", error);
            document.getElementById('categorizedProducts').innerHTML = '<p class="empty-state">Error loading products.</p>';
        }
    },

    renderCategorizedProducts() {
        const container = document.getElementById('categorizedProducts');
        
        if (this.products.length === 0) {
            container.innerHTML = '<p class="empty-state">No products available at the moment.</p>';
            return;
        }

        // Group products by category
        const categories = {};
        this.products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(p);
        });

        let html = '';
        for (const [catName, products] of Object.entries(categories)) {
            html += `
                <div class="category-section">
                    <h3 class="category-title">${catName}</h3>
                    <div class="products-grid">
                        ${products.map(p => this.renderProductCard(p)).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    },

    renderProductCard(product) {
        return `
            <div class="product-card">
                <div class="product-header">
                    <div class="product-name">${product.name}</div>
                    <div class="product-details">
                        <span>₹${product.price}</span>
                        <span>GST: ${product.gst}%</span>
                    </div>
                </div>
                <div class="product-info" style="margin: 10px 0;">
                    <small>Supplier: ${product.owner?.name || 'Unknown'}</small>
                </div>
                <p style="font-size: 13px; color: #666; margin-bottom: 15px;">${product.description || 'No description available.'}</p>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, ${product.gst}, '${product.owner?._id}', ${product.stock || 0})">Add to Cart</button>
                </div>
            </div>
        `;
    }
};

// Global function for Add to Cart (placeholder, needs to integrate with existing cart system)
function addToCart(productId, name, price, gst, supplierId, stock = 999) {
    // Assuming there's a cart logic in auth.js or elsewhere
    // In many of these templates, cart is stored in localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.productId === productId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId, name, price, gst, supplierId, quantity: 1, stock });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast(`${name} added to cart!`, 'success');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    Page2Products.loadAllProducts();
});
