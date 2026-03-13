// Page 2 Purchase Invoice
const Purchase = {
    data: JSON.parse(localStorage.getItem('page2Data')) || {
        suppliers: [],
        purchases: [],
        invoices: []
    },

    saveData() {
        localStorage.setItem('page2Data', JSON.stringify(this.data));
    },

    loadSuppliers() {
        const select = document.getElementById('supplierSelect');
        const options = this.data.suppliers.map(s => 
            `<option value="${s.id}">${s.name}</option>`
        ).join('');
        
        select.innerHTML = '<option value="">Choose a supplier</option>' + options;
    },

    loadSupplierProducts() {
        const supplierId = document.getElementById('supplierSelect').value;
        if (!supplierId) return;

        // Get products from page1Data
        const page1Data = JSON.parse(localStorage.getItem('page1Data')) || { products: [] };
        const selects = document.querySelectorAll('.product-select');

        const productOptions = page1Data.products.map(p => 
            `<option value="${p.id}" data-price="${p.price}" data-gst="${p.gst}">${p.name} - ₹${p.price}</option>`
        ).join('');

        selects.forEach(select => {
            select.innerHTML = '<option value="">Select Product</option>' + productOptions;
        });
    }
};

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
    
    // Load products in new select
    Purchase.loadSupplierProducts();
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

function createPurchaseInvoice() {
    const date = document.getElementById('purchaseDate').value;
    const supplierId = document.getElementById('supplierSelect').value;
    const rows = document.querySelectorAll('.product-row');

    if (!date || !supplierId) {
        showToast('Please select a date and supplier', 'error');
        return;
    }

    const supplier = Purchase.data.suppliers.find(s => s.id === supplierId);
    const items = [];
    let subtotal = 0;
    let totalGst = 0;

    rows.forEach(row => {
        const select = row.querySelector('.product-select');
        const qty = parseInt(row.querySelector('.product-qty').value) || 0;
        const price = parseFloat(row.querySelector('.product-price').value) || 0;
        const gst = parseFloat(row.querySelector('.product-gst').value) || 0;

        if (qty > 0 && select.value) {
            const page1Data = JSON.parse(localStorage.getItem('page1Data')) || { products: [] };
            const product = page1Data.products.find(p => p.id === select.value);
            
            const lineTotal = qty * price;
            const lineGst = (lineTotal * gst) / 100;

            items.push({
                id: select.value,
                name: product.name,
                quantity: qty,
                price: price,
                gst: gst,
                total: lineTotal + lineGst
            });

            subtotal += lineTotal;
            totalGst += lineGst;
        }
    });

    if (items.length === 0) {
        showToast('Please add at least one product', 'error');
        return;
    }

    const invoice = {
        invoiceId: 'PUR-' + Date.now().toString().slice(-8).toUpperCase(),
        date: date,
        supplierId: supplierId,
        supplierName: supplier.name,
        items: items,
        subtotal: subtotal,
        gstAmount: totalGst,
        total: subtotal + totalGst,
        createdAt: new Date().toISOString()
    };

    Purchase.data.invoices.push(invoice);
    Purchase.data.purchases.push(...items);
    Purchase.saveData();
    
    showToast('Purchase invoice created successfully!', 'success');
    
    // Reset form
    document.getElementById('purchaseDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('supplierSelect').value = '';
    const container = document.getElementById('purchaseProductsList');
    container.innerHTML = `
        <div class="product-row">
            <select class="product-select" onchange="updateProductPrice(this)">
                <option value="">Select Product</option>
            </select>
            <input type="number" class="product-qty" placeholder="Qty" min="1" onchange="calculatePurchaseTotal()">
            <input type="number" class="product-price" placeholder="Price" readonly>
            <input type="number" class="product-gst" placeholder="GST %" readonly>
            <button type="button" class="btn btn-delete" onclick="removeProductRow(this)">Remove</button>
        </div>
    `;
    calculatePurchaseTotal();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('purchaseDate').value = today;
    
    Purchase.loadSuppliers();
});

document.addEventListener("DOMContentLoaded", loadCartItems);

function loadCartItems() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cartItemsList");

    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    cart.forEach((item, index) => {

        let row = document.createElement("div");
        row.className = "product-row";

        row.innerHTML = `
            <input type="text" value="${item.name}" readonly>
            <input type="number" value="${item.qty}" min="1">
            <input type="number" value="${item.price}" readonly>
            <input type="number" value="${item.gst}" readonly>
            <button class="btn btn-primary" onclick="addCartItemToInvoice(${index})">
            Add
            </button>
        `;

        cartContainer.appendChild(row);
    });
}
function addCartItemToInvoice(index){

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart[index];

    let productsList = document.getElementById("purchaseProductsList");

    let row = document.createElement("div");
    row.className = "product-row";

    row.innerHTML = `
        <input type="text" value="${item.name}" readonly>
        <input type="number" class="product-qty" value="${item.qty}" min="1" onchange="calculatePurchaseTotal()">
        <input type="number" class="product-price" value="${item.price}" readonly>
        <input type="number" class="product-gst" value="${item.gst}" readonly>
        <button type="button" class="btn btn-delete" onclick="removeProductRow(this)">Remove</button>
    `;

    productsList.appendChild(row);

    calculatePurchaseTotal();
}