// Page 2 Previous Invoices
const Invoices = {
    data: JSON.parse(localStorage.getItem('page2Data')) || {
        suppliers: [],
        purchases: [],
        invoices: []
    },

    loadInvoices(filter = '') {
        const tbody = document.getElementById('invoicesBody');
        
        let invoices = this.data.invoices;
        if (filter) {
            invoices = invoices.filter(inv => 
                inv.supplierName.toLowerCase().includes(filter.toLowerCase()) ||
                inv.invoiceId.toLowerCase().includes(filter.toLowerCase())
            );
        }

        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No invoices found</td></tr>';
            return;
        }

        tbody.innerHTML = invoices.map(invoice => `
            <tr>
                <td>${invoice.invoiceId}</td>
                <td>${invoice.supplierName}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>${invoice.items.length}</td>
                <td>₹${invoice.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewInvoiceDetails('${invoice.invoiceId}')" style="padding: 6px 10px; font-size: 12px;">View</button>
                </td>
            </tr>
        `).join('');
    }
};

function searchInvoices() {
    const searchText = document.getElementById('searchInvoice').value;
    Invoices.loadInvoices(searchText);
}

function filterInvoices() {
    const filter = document.getElementById('invoiceFilter').value;
    // Implement sorting if needed
    Invoices.loadInvoices();
}

function viewInvoiceDetails(invoiceId) {
    const invoice = Invoices.data.invoices.find(inv => inv.invoiceId === invoiceId);
    if (!invoice) return;

    const content = document.getElementById('invoiceDetailsContent');
    
    let itemsHtml = '<table class="data-table"><thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>GST %</th><th>Total</th></tr></thead><tbody>';
    
    invoice.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>${item.gst}%</td>
                <td>₹${item.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    itemsHtml += '</tbody></table>';

    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
                    <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p><strong>Supplier:</strong> ${invoice.supplierName}</p>
                    <p><strong>Created:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <h4 style="margin: 20px 0 15px;">Order Items</h4>
            ${itemsHtml}

            <div style="background: #f5f5f5; padding: 20px; margin-top: 20px; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                    <span>Subtotal:</span>
                    <strong>₹${invoice.subtotal.toFixed(2)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                    <span>GST Amount:</span>
                    <strong>₹${invoice.gstAmount.toFixed(2)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px;">
                    <span><strong>Total Amount:</strong></span>
                    <strong>₹${invoice.total.toFixed(2)}</strong>
                </div>
            </div>
        </div>
    `;

    openModal('invoiceDetailsModal');
}

function closeInvoiceDetails() {
    closeModal('invoiceDetailsModal');
}

function printInvoice() {
    window.print();
}

function downloadInvoice() {
    showToast('Invoice downloaded as PDF!', 'success');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    Invoices.loadInvoices();
});
