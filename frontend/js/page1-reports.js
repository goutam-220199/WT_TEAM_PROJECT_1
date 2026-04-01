// Page 1 Reports

const Reports = {
    last: {
        daily: null,
        monthly: null,
        topProducts: null,
        comparison: null,
        dailyChart: null,
        monthlyChart: null,
        comparisonChartInstance: null
    },

    async fetchData(endpoint) {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/reports/${endpoint}`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        return await res.json();
    },

    // -------- DAILY SALES PER DAY --------
    loadDailySalesReport(invoices) {
        const tbody = document.getElementById('dailySalesBody');

        if (!Array.isArray(invoices) || invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No data available</td></tr>';
            return;
        }

        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push({
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString(),
                count: 0,
                totalSales: 0
            });
        }

        invoices.forEach(item => {
            const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
            const day = last7Days.find(d => d.date === itemDate);
            if (day) {
                day.count += 1;
                day.totalSales += (item.total || 0);
            }
        });

        const html = last7Days.reverse().map(day => `
            <tr>
                <td>${day.label}</td>
                <td>All Products</td>
                <td>${day.count}</td>
                <td>₹${day.totalSales.toFixed(2)}</td>
            </tr>
        `).join(""); 
        
        tbody.innerHTML = html;
        this.last.daily = last7Days;
    },

    // -------- MONTHLY SALES --------
    loadMonthlySalesReport(invoices) {
        const tbody = document.getElementById('monthlySalesBody');

        if (!Array.isArray(invoices) || invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No data available</td></tr>';
            return;
        }

        const last12Months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            last12Months.push({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                label: `${date.getMonth() + 1}/${date.getFullYear()}`,
                totalSales: 0,
                orderCount: 0
            });
        }

        invoices.forEach(item => {
            const d = new Date(item.createdAt);
            const month = last12Months.find(m => m.year === d.getFullYear() && m.month === (d.getMonth() + 1));
            if (month) {
                month.totalSales += (item.total || 0);
                month.orderCount += 1;
            }
        });

        tbody.innerHTML = last12Months.reverse().map(row => `
            <tr>
                <td>${row.label}</td>
                <td>₹${row.totalSales.toFixed(2)}</td>
                <td>${row.orderCount}</td>
            </tr>
        `).join("");
        
        this.last.monthly = last12Months;
    },

    // -------- TOP PRODUCTS --------
    loadTopProductsReport(invoices) {
        const tbody = document.getElementById('topProductsBody');

        if (!Array.isArray(invoices) || invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No data available</td></tr>';
            return;
        }

        const productMap = invoices.reduce((acc, item) => {
            const pName = (item.product && item.product.name) ? item.product.name : 'Unknown Product';
            if (!acc[pName]) {
                acc[pName] = { name: pName, totalSold: 0, totalRevenue: 0 };
            }
            acc[pName].totalSold += (item.quantity || 0);
            acc[pName].totalRevenue += (item.total || 0);
            return acc;
        }, {});

        // Filter products where total quantity > 5
        const topProducts = Object.values(productMap)
            .filter(product => product.totalSold > 5)
            .sort((a, b) => b.totalSold - a.totalSold);

        if (topProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No products sold > 5</td></tr>';
            return;
        }

        tbody.innerHTML = topProducts.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.totalSold}</td>
                <td>₹${product.totalRevenue.toFixed(2)}</td>
            </tr>
        `).join("");
        
        this.last.topProducts = topProducts;
    },

    // -------- SALES COMPARISON GRAPH --------
    async loadComparisonChart() {
        const reportCard = document.querySelector('.report-card:has(#salesChart)');
        const chartContainer = document.querySelector('.chart-container');

        // Add control buttons
        if (!document.getElementById('chartControls')) {
            const controls = document.createElement('div');
            controls.id = 'chartControls';
            controls.style.cssText = 'margin-bottom: 10px; text-align: center;';
            controls.innerHTML = `
                <button id="dailyBtn" class="btn btn-secondary" style="margin-right: 10px;">Daily Sales (Line)</button>
                <button id="monthlyBtn" class="btn btn-secondary">Monthly Sales (Bar)</button>
            `;
            chartContainer.parentNode.insertBefore(controls, chartContainer);
        }

        // Fetch ALL data and use reduce() as requested
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/invoices/my-invoices`, {
                headers: { "Authorization": "Bearer " + token }
            });
            const allInvoices = await res.json();
            
            // Fix Sales Comparison (Daily & Monthly)
            this.last.dailyChart = this.processDailyData(allInvoices);
            this.last.monthlyChart = this.processMonthlyData(allInvoices);

            // Set initial active button and render
            this.setActiveButton('daily');
            this.renderChart('daily');

            // Add event listeners (if not already added)
            const dailyBtn = document.getElementById('dailyBtn');
            const monthlyBtn = document.getElementById('monthlyBtn');
            const newDailyBtn = dailyBtn.cloneNode(true);
            const newMonthlyBtn = monthlyBtn.cloneNode(true);
            dailyBtn.parentNode.replaceChild(newDailyBtn, dailyBtn);
            monthlyBtn.parentNode.replaceChild(newMonthlyBtn, monthlyBtn);

            newDailyBtn.addEventListener('click', () => {
                this.setActiveButton('daily');
                this.renderChart('daily');
            });
            newMonthlyBtn.addEventListener('click', () => {
                this.setActiveButton('monthly');
                this.renderChart('monthly');
            });

            // RENDER NEW CHARTS
            this.loadProductWiseChart(allInvoices);
            this.loadRetailerWiseChart(allInvoices);

            // RENDER TABLES
            this.loadDailySalesReport(allInvoices);
            this.loadMonthlySalesReport(allInvoices);
            this.loadTopProductsReport(allInvoices);

        } catch (error) {
            console.error("Error loading comparison charts:", error);
            const parent = chartContainer.parentNode;
            if (parent) parent.innerHTML = '<p class="empty-state">Error loading sales data</p>';
        }
    },

    setActiveButton(type) {
        const dailyBtn = document.getElementById('dailyBtn');
        const monthlyBtn = document.getElementById('monthlyBtn');

        // Reset styles
        dailyBtn.style.backgroundColor = '';
        dailyBtn.style.color = '';
        monthlyBtn.style.backgroundColor = '';
        monthlyBtn.style.color = '';

        if (type === 'daily') {
            dailyBtn.style.backgroundColor = '#28527a';
            dailyBtn.style.color = '#ffffff';
        } else {
            monthlyBtn.style.backgroundColor = '#28527a';
            monthlyBtn.style.color = '#ffffff';
        }
        
        dailyBtn.classList.add('active-chart-btn');
        monthlyBtn.classList.remove('active-chart-btn');
        if (type === 'monthly') {
             monthlyBtn.classList.add('active-chart-btn');
             dailyBtn.classList.remove('active-chart-btn');
        }
    },

    processDailyData(invoices) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push({
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                totalSales: 0
            });
        }

        if (Array.isArray(invoices)) {
            const dailyTotals = invoices.reduce((acc, item) => {
                const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
                acc[itemDate] = (acc[itemDate] || 0) + (item.total || 0);
                return acc;
            }, {});

            last7Days.forEach(day => {
                day.totalSales = dailyTotals[day.date] || 0;
            });
        }
        return last7Days;
    },

    processMonthlyData(invoices) {
        const last12Months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            last12Months.push({
                key: `${date.getFullYear()}-${date.getMonth() + 1}`,
                label: date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
                totalSales: 0
            });
        }

        if (Array.isArray(invoices)) {
            const monthlyTotals = invoices.reduce((acc, item) => {
                const d = new Date(item.createdAt);
                const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
                acc[key] = (acc[key] || 0) + (item.total || 0);
                return acc;
            }, {});

            last12Months.forEach(month => {
                month.totalSales = monthlyTotals[month.key] || 0;
            });
        }
        return last12Months;
    },

    renderChart(type){
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        // Destroy old chart
        if (this.last.comparisonChartInstance) {
            this.last.comparisonChartInstance.destroy();
            this.last.comparisonChartInstance = null;
        }

        const data = type === 'daily' ? this.last.dailyChart : this.last.monthlyChart;
        
        // Check if there is ANY sales data
        const hasData = data && data.some(d => d.totalSales > 0);
        
        if (!hasData) {
            let msg = chartContainer.querySelector('.empty-state-msg');
            if (!msg) {
                msg = document.createElement('div');
                msg.className = 'empty-state-msg';
                msg.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; width: 100%;';
                msg.innerHTML = '<p style="color: #666; font-size: 1.1rem;">No sales data available for this period</p>';
                chartContainer.style.position = 'relative';
                chartContainer.appendChild(msg);
            }
        } else {
            const msg = chartContainer.querySelector('.empty-state-msg');
            if (msg) msg.remove();
        }

        let canvas = document.getElementById("salesChart");
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = "salesChart";
            chartContainer.appendChild(canvas);
        }

        const labels = data.map(d => d.label);
        const values = data.map(d => d.totalSales);
        
        const chartType = type === 'daily' ? 'line' : 'bar';
        const title = 'Sales Comparison(view of money)';
        const label = type === 'daily' ? 'Daily Sales' : 'Monthly Sales';
        
        this.last.comparisonChartInstance = new Chart(canvas, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: values,
                    borderColor: '#28527a',
                    backgroundColor: type === 'daily' ? 'rgba(40, 82, 122, 0.1)' : 'rgba(40, 82, 122, 0.8)',
                    borderWidth: 2,
                    fill: type === 'daily',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: { display: true, text: type === 'daily' ? 'Date' : 'Month', color: '#666' },
                        grid: { display: true, color: 'rgba(0,0,0,0.05)' }
                    },
                    y: {
                        display: true,
                        title: { display: true, text: 'Sales Amount (₹)', color: '#666' },
                        beginAtZero: true,
                        grid: { display: true, color: 'rgba(0,0,0,0.05)' }
                    }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: {
                        display: true,
                        text: title,
                        font: { size: 18, weight: 'bold' },
                        padding: { bottom: 20 }
                    },
                    tooltip: { 
                        enabled: true,
                        intersect: false,
                        mode: 'index',
                        callbacks: {
                            label: function(context) {
                                return `Sales: ₹${context.parsed.y.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                }
            }
        });
    },

    loadProductWiseChart(invoices) {
        const canvas = document.getElementById("productChart");
        if (!canvas) return;
        const chartContainer = canvas.parentElement;

        if (this.last.productChartInstance) {
            this.last.productChartInstance.destroy();
        }

        if (!Array.isArray(invoices) || invoices.length === 0) {
            chartContainer.innerHTML = '<p class="empty-state">No data available</p>';
            return;
        }

        const productTotals = invoices.reduce((acc, item) => {
            const pName = (item.product && item.product.name) ? item.product.name : 'Unknown Product';
            acc[pName] = (acc[pName] || 0) + (item.quantity || 0);
            return acc;
        }, {});

        const labels = Object.keys(productTotals);
        const values = Object.values(productTotals);

        if (labels.length === 0) {
            chartContainer.innerHTML = '<p class="empty-state">No data available</p>';
            return;
        }

        this.last.productChartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Product-wise Quantity',
                    data: values,
                    backgroundColor: 'rgba(40, 82, 122, 0.8)',
                    borderColor: '#1e3a5f',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Product Name', color: '#666' }, grid: { display: true, color: 'rgba(0,0,0,0.05)' } },
                    y: { title: { display: true, text: 'Total Quantity Sold', color: '#666' }, beginAtZero: true, grid: { display: true, color: 'rgba(0,0,0,0.05)' } }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: { display: true, text: 'Product-wise Sales', font: { size: 18, weight: 'bold' }, padding: { bottom: 20 } },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) { return `Quantity: ${context.parsed.y}`; }
                        }
                    }
                }
            }
        });
    },

    loadRetailerWiseChart(invoices) {
        const canvas = document.getElementById("retailerChart");
        if (!canvas) return;
        const chartContainer = canvas.parentElement;

        if (this.last.retailerChartInstance) {
            this.last.retailerChartInstance.destroy();
        }

        if (!Array.isArray(invoices) || invoices.length === 0) {
            chartContainer.innerHTML = '<p class="empty-state">No data available</p>';
            return;
        }

        const retailerTotals = invoices.reduce((acc, item) => {
            const rName = (item.retailer && item.retailer.name) ? item.retailer.name : 'Unknown Retailer';
            acc[rName] = (acc[rName] || 0) + (item.total || 0);
            return acc;
        }, {});

        const labels = Object.keys(retailerTotals);
        const values = Object.values(retailerTotals);

        if (labels.length === 0) {
            chartContainer.innerHTML = '<p class="empty-state">No data available</p>';
            return;
        }

        this.last.retailerChartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Retailer Sales Amt',
                    data: values,
                    backgroundColor: 'rgba(39, 174, 96, 0.8)',
                    borderColor: '#1e8449',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Retailer Name', color: '#666' }, grid: { display: true, color: 'rgba(0,0,0,0.05)' } },
                    y: { title: { display: true, text: 'Total Amount (₹)', color: '#666' }, beginAtZero: true, grid: { display: true, color: 'rgba(0,0,0,0.05)' } }
                },
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: { display: true, text: 'Retailer-wise Sales', font: { size: 18, weight: 'bold' }, padding: { bottom: 20 } },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) { return `Sales: ₹${context.parsed.y.toLocaleString('en-IN')}`; }
                        }
                    }
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
        this.last.daily.forEach(d => {
            rows.push([d.label || d.date, "All Products", d.count, d.totalSales]);
        });
        rows.push([""]);
    }

    if (this.last.monthly) {
        rows.push(["Monthly Sales"]);
        rows.push(["Month", "Total Sales", "Orders"]);
        this.last.monthly.forEach(m => {
            rows.push([m.label || m.key, m.totalSales, m.orderCount || 0]);
        });
        rows.push([""]);
    }

    if (this.last.topProducts) {
        rows.push(["Top Products"]);
        rows.push(["Product", "Units Sold", "Revenue"]);
        this.last.topProducts.forEach(p => {
            rows.push([p.name || p.productName || p._id, p.totalSold, p.totalRevenue]);
        });
        rows.push([""]);
    }

    if (this.last.dailyChart) {
        rows.push(["Daily Sales Chart"]);
        rows.push(["Date", "Sales"]);
        this.last.dailyChart.forEach(d => {
            rows.push([d.label || d.date, d.totalSales]);
        });
        rows.push([""]);
    }

    if (this.last.monthlyChart) {
        rows.push(["Monthly Sales Chart"]);
        rows.push(["Month", "Sales"]);
        this.last.monthlyChart.forEach(m => {
            rows.push([m.label || m.key, m.totalSales]);
        });
        rows.push([""]);
    }

    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
};


// -------- GENERATE REPORT --------

window.generateReport = async function () {
    await Reports.loadComparisonChart();
    await Reports.downloadReport();
    alert("Report generated successfully");
};


// -------- PAGE INIT --------
document.addEventListener("DOMContentLoaded", function () {
    // Only load reports, do not download
    Reports.loadComparisonChart();
});

// Add event listener for Generate Report button
const generateBtn = document.getElementById('generateReportBtn');
if (generateBtn) {
    generateBtn.addEventListener('click', async function () {
        await Reports.loadComparisonChart();
        await Reports.downloadReport();
        alert("Report generated successfully");
    });
}