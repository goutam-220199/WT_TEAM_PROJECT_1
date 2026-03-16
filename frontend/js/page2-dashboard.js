// Page 2 Dashboard (Retailer, Small Scale Business Owner)

const Dashboard2 = {
    suppliers: [],
    invoices: [],

    async loadDashboardStats() {
        const token = localStorage.getItem('token');

        // Approved suppliers
        const supRes = await fetch('http://localhost:5000/api/supplier-request/approved', {
            headers: { Authorization: 'Bearer ' + token }
        });
        const approvedSuppliers = await supRes.json();
        this.suppliers = approvedSuppliers;

        // Invoices
        const invRes = await fetch('http://localhost:5000/api/invoices/my-invoices', {
            headers: { Authorization: 'Bearer ' + token }
        });
        this.invoices = await invRes.json();

        const totalSuppliers = this.suppliers.length;
        const totalInvoices = this.invoices.length;
        const totalSpending = this.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalProductsPurchased = this.invoices.reduce((sum, inv) => sum + (inv.quantity || 0), 0);

        document.getElementById('totalSuppliers').textContent = totalSuppliers;
        document.getElementById('totalProductsPurchased').textContent = totalProductsPurchased;
        document.getElementById('totalSpending').textContent = '₹' + totalSpending.toLocaleString();
        document.getElementById('totalInvoices').textContent = totalInvoices;

        // Quick stats
        document.getElementById('activeSuppliers').textContent = totalSuppliers;

        // Monthly spending
        const currentMonth = new Date().getMonth();
        const monthlyInvoices = this.invoices.filter(inv => {
            const invMonth = new Date(inv.createdAt).getMonth();
            return invMonth === currentMonth;
        });
        const monthlySpending = monthlyInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        document.getElementById('monthlySpending').textContent = '₹' + monthlySpending.toLocaleString();

        // Average order value
        const avgOrderValue = totalInvoices > 0 ? Math.round(totalSpending / totalInvoices) : 0;
        document.getElementById('avgOrderValue').textContent = '₹' + avgOrderValue.toLocaleString();

        this.loadRecentPurchases();
    },

    loadRecentPurchases() {
        const tbody = document.getElementById('recentPurchasesBody');
        const recentPurchases = this.invoices.slice(-5).reverse();

        if (recentPurchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No purchases yet</td></tr>';
            return;
        }

        tbody.innerHTML = recentPurchases.map(invoice => {
            const productName = invoice.product?.name || '';

            return `
                <tr>
                    <td>${productName}</td>
                    <td>${invoice.supplier || ''}</td>
                    <td>${invoice.quantity || 0}</td>
                    <td>${new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td>₹${(invoice.total || 0).toFixed(2)}</td>
                </tr>
            `;
        }).join('');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    Dashboard2.loadDashboardStats();
    
    // Refresh stats every 30 seconds
    setInterval(() => Dashboard2.loadDashboardStats(), 30000);
});
