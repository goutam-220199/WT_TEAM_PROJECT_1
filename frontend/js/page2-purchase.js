// Page 2 Purchase Invoice
const Purchase = {
    suppliers: [],
    products: [],

    async loadApprovedSuppliers() {
        const token = localStorage.getItem('token');

        const res = await fetch("http://localhost:5000/api/supplier-request/approved", {
            headers: { Authorization: "Bearer " + token }
        });

        const data = await res.json();
        this.suppliers = data.map(r => ({ id: r.supplier._id, name: r.supplier.name }));

        const select = document.getElementById('supplierSelect');
        const options = this.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        select.innerHTML = '<option value="">Choose a supplier</option>' + options;
    },

    async loadSupplierProducts(supplierId) {
        if (!supplierId) return;
        const token = localStorage.getItem('token');

        const res = await fetch(`http://localhost:5000/api/products/by-supplier/${supplierId}`, {
            headers: { Authorization: "Bearer " + token }
        });

        this.products = await res.json();
        updateAllProductSelects(this.products);
    }
};

function updateAllProductSelects(products) {
    const selects = document.querySelectorAll('.product-select');

    const options = products.map(p =>
        `<option value="${p._id}" data-price="${p.price}" data-gst="${p.gst}">${p.name} - ₹${p.price}</option>`
    ).join('');

    selects.forEach(select => {
        const previous = select.value;
        select.innerHTML = '<option value="">Select Product</option>' + options;
        if (previous) select.value = previous;
    });
}

function addPurchaseProductRow() {
    const container = document.getElementById('purchaseProductsList');
    const newRow = document.createElement('div');
    newRow.className = 'product-row';
    newRow.innerHTML = `
        <select class="product-select" onchange="updateProductPrice(this)">
            <option value="">Select Product</option>
        </select>
        <input type="number" class="product-qty" placeholder="Qty" min="1" onchange="calculatePurchaseTotal()">
        <input type="number" class="product-price" placeholder="Price" readonly>
        <input type="number" class="product-gst" placeholder="GST %" readonly>
        <button type="button" class="btn btn-delete" onclick="removeProductRow(this)">Remove</button>
    `;
    
    container.appendChild(newRow);
    updateAllProductSelects(Purchase.products);
}

function removeProductRow(button) {
    button.parentElement.remove();
    calculatePurchaseTotal();
}

function updateProductPrice(select) {
    const option = select.options[select.selectedIndex];
    const price = option.getAttribute('data-price') || 0;
    const gst = option.getAttribute('data-gst') || 0;
    
    const row = select.closest('.product-row');
    row.querySelector('.product-price').value = price;
    row.querySelector('.product-gst').value = gst;
    
    calculatePurchaseTotal();
}

function calculatePurchaseTotal() {
    const rows = document.querySelectorAll('.product-row');
    let subtotal = 0;
    let totalGst = 0;

    rows.forEach(row => {
        const qty = parseInt(row.querySelector('.product-qty').value) || 0;
        const price = parseFloat(row.querySelector('.product-price').value) || 0;
        const gst = parseFloat(row.querySelector('.product-gst').value) || 0;

        const lineTotal = qty * price;
        const lineGst = (lineTotal * gst) / 100;

        subtotal += lineTotal;
        totalGst += lineGst;
    });

    const total = subtotal + totalGst;

    document.getElementById('purchaseSubtotal').textContent = '₹' + subtotal.toFixed(2);
    document.getElementById('purchaseGST').textContent = '₹' + totalGst.toFixed(2);
    document.getElementById('purchaseTotalAmount').textContent = '₹' + total.toFixed(2);
}

async function createPurchaseInvoice() {
    const date = document.getElementById('purchaseDate').value;
    const supplierId = document.getElementById('supplierSelect').value;
    const rows = document.querySelectorAll('.product-row');

    if (!date || !supplierId) {
        showToast('Please select a date and supplier', 'error');
        return;
    }

    const items = [];

    rows.forEach(row => {
        const select = row.querySelector('.product-select');
        const qty = parseInt(row.querySelector('.product-qty').value) || 0;
        const price = parseFloat(row.querySelector('.product-price').value) || 0;
        const gst = parseFloat(row.querySelector('.product-gst').value) || 0;

        if (qty > 0 && select.value) {
            const product = Purchase.products.find(p => p._id === select.value);
            const lineTotal = qty * price;
            const lineGst = (lineTotal * gst) / 100;

            items.push({
                productId: select.value,
                name: product?.name || "",
                quantity: qty,
                price: price,
                gst: gst,
                total: lineTotal + lineGst
            });
        }
    });

    if (items.length === 0) {
        showToast('Please add at least one product', 'error');
        return;
    }

    const token = localStorage.getItem('token');

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
        showToast(data.message || 'Failed to create invoice', 'error');
        return;
    }

    showToast('Purchase invoice created successfully! Supplier will receive the order.', 'success');
    window.location.href = 'page2-invoices.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('purchaseDate').value = today;
    Purchase.loadApprovedSuppliers();
});
