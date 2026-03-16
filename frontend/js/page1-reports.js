// Page 1 Reports

const Reports = {
    last: {
        daily: null,
        monthly: null,
        topProducts: null,
        comparison: null
    },

    async fetchData(endpoint){
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/reports/${endpoint}`,{
            headers:{
                "Authorization":"Bearer "+token
            }
        });

        return await res.json();
    },

    // -------- DAILY SALES --------
    async loadDailySalesReport(){
        const tbody = document.getElementById('dailySalesBody');
        const data = await this.fetchData("daily");
        this.last.daily = data;

        if(!data || data.count === 0){
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No data available</td></tr>';
            return;
        }

        tbody.innerHTML = `
            <tr>
                <td>${new Date().toLocaleDateString()}</td>
                <td>All Products</td>
                <td>${data.count}</td>
                <td>₹${data.totalSales}</td>
            </tr>
        `;
    },

    // -------- MONTHLY SALES --------
    async loadMonthlySalesReport(){
        const tbody = document.getElementById('monthlySalesBody');
        const data = await this.fetchData("monthly");
        this.last.monthly = data;

        if(!data || data.length === 0){
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No data available</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(row=>`
            <tr>
                <td>${row._id.month}/${row._id.year}</td>
                <td>₹${row.totalSales}</td>
                <td>${row.orderCount || 0}</td>
            </tr>
        `).join("");
    },

    // -------- TOP PRODUCTS --------
    async loadTopProductsReport(){
        const tbody = document.getElementById('topProductsBody');
        const data = await this.fetchData("top-products");
        this.last.topProducts = data;

        if(!data || data.length === 0){
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No data available</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(product=>`
            <tr>
                <td>${product.productName || product._id}</td>
                <td>${product.totalSold}</td>
                <td>₹${product.totalRevenue}</td>
            </tr>
        `).join("");
    },

    // -------- SALES COMPARISON GRAPH --------
    async loadComparisonChart(){
        const container = document.getElementById('comparisonChart');
        const data = await this.fetchData("sales-comparison");
        this.last.comparison = data;

        if(!data || data.length === 0){
            container.innerHTML = '<p class="empty-state">No data for comparison</p>';
            return;
        }

        const ctx = document.getElementById("salesChart");
        if (!ctx) {
            container.innerHTML = '<p class="empty-state">Chart container not found</p>';
            return;
        }

        const labels = data.map(d => d.productName || `Product ${d.productId}`);
        const values = data.map(d => d.totalSales);

        const colors = labels.map((_, i) => {
            const hue = (i * 40) % 360;
            return `hsl(${hue}, 70%, 45%)`;
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Sales',
                    data: values,
                    backgroundColor: colors
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    async downloadReport(){
        // Build CSV for download
        const rows = [];
        rows.push(["Daily Sales"]);
        if (this.last.daily) {
            rows.push(["Date", "Products", "Count", "Amount"]);
            rows.push([new Date().toLocaleDateString(), "All Products", this.last.daily.count, this.last.daily.totalSales]);
            rows.push([""]);
        }

        if (this.last.monthly) {
            rows.push(["Monthly Sales"]);
            rows.push(["Month", "Total Sales", "Orders"]);
            this.last.monthly.forEach(r => {
                rows.push([`${r._id.month}/${r._id.year}`, r.totalSales, r.orderCount || 0]);
            });
            rows.push([""]);
        }

        if (this.last.topProducts) {
            rows.push(["Top Products"]);
            rows.push(["Product", "Units Sold", "Revenue"]);
            this.last.topProducts.forEach(p => {
                rows.push([p.productName || p._id, p.totalSold, p.totalRevenue]);
            });
            rows.push([""]);
        }

        if (this.last.comparison) {
            rows.push(["Sales Comparison"]);
            rows.push(["Product", "Sales"]);
            this.last.comparison.forEach(c => {
                rows.push([c.productName || c.productId, c.totalSales]);
            });
            rows.push([""]);
        }

        const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
};


// -------- GENERATE REPORT --------

window.generateReport = async function() {
    await Reports.loadDailySalesReport();
    await Reports.loadMonthlySalesReport();
    await Reports.loadTopProductsReport();
    await Reports.loadComparisonChart();
    await Reports.downloadReport();
    showToast("Report generated successfully","success");
};


// -------- PAGE INIT --------
document.addEventListener("DOMContentLoaded",function(){
    // Only load reports, do not download
    Reports.loadDailySalesReport();
    Reports.loadMonthlySalesReport();
    Reports.loadTopProductsReport();
    Reports.loadComparisonChart();
});

// Add event listener for Generate Report button
const generateBtn = document.getElementById('generateReportBtn');
if (generateBtn) {
    generateBtn.addEventListener('click', async function() {
        await Reports.loadDailySalesReport();
        await Reports.loadMonthlySalesReport();
        await Reports.loadTopProductsReport();
        await Reports.loadComparisonChart();
        await Reports.downloadReport();
        showToast("Report generated successfully","success");
    });
}