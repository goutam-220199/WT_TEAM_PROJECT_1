// Page 2 Dashboard (Retailer, Small Scale Business Owner)
const Dashboard2 = {
    data: JSON.parse(localStorage.getItem('page2Data')) || {
        suppliers: [],
        purchases: [],
        invoices: []
    },

    saveData() {
        localStorage.setItem('page2Data', JSON.stringify(this.data));
    },

    loadDashboardStats() {
        const totalSuppliers = this.data.suppliers.length;
        const totalProductsPurchased = this.data.purchases.reduce((sum, p) => sum + p.quantity, 0);
        const totalSpending = this.data.invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalInvoices = this.data.invoices.length;

        document.getElementById('totalSuppliers').textContent = totalSuppliers;
        document.getElementById('totalProductsPurchased').textContent = totalProductsPurchased;
        document.getElementById('totalSpending').textContent = '₹' + totalSpending.toLocaleString();
        document.getElementById('totalInvoices').textContent = totalInvoices;

        // Quick stats
        document.getElementById('activeSuppliers').textContent = totalSuppliers;
        
        // Monthly spending
        const currentMonth = new Date().getMonth();
        const monthlyInvoices = this.data.invoices.filter(inv => {
            const invMonth = new Date(inv.date).getMonth();
            return invMonth === currentMonth;
        });
        const monthlySpending = monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0);
        document.getElementById('monthlySpending').textContent = '₹' + monthlySpending.toLocaleString();

        // Average order value
        const avgOrderValue = totalInvoices > 0 ? Math.round(totalSpending / totalInvoices) : 0;
        document.getElementById('avgOrderValue').textContent = '₹' + avgOrderValue.toLocaleString();

        this.loadRecentPurchases();
    },

    loadRecentPurchases() {
        const tbody = document.getElementById('recentPurchasesBody');
        const recentPurchases = this.data.invoices.slice(-5).reverse();

        if (recentPurchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No purchases yet</td></tr>';
            return;
        }

        tbody.innerHTML = recentPurchases.map(invoice => {
            const products = invoice.items.map(i => i.name).join(', ');
            const totalQty = invoice.items.reduce((sum, i) => sum + i.quantity, 0);
            
            return `
                <tr>
                    <td>${products}</td>
                    <td>${invoice.supplierName}</td>
                    <td>${totalQty}</td>
                    <td>${new Date(invoice.date).toLocaleDateString()}</td>
                    <td>₹${invoice.total.toFixed(2)}</td>
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
