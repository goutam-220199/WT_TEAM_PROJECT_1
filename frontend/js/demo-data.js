// Demo Data Initialization
// Run this once to populate the system with sample data for testing

function initializeDemoData() {
    // Demo Users
    const demoUsers = [
        {
            id: '1',
            name: 'Raj Kumar',
            email: 'raj@wholesaler.com',
            role: 'wholesaler',
            password: btoa('password123') // Simple encoding for demo
        },
        {
            id: '2',
            name: 'Priya Sharma',
            email: 'priya@retailer.com',
            role: 'retailer',
            password: btoa('password123')
        },
        {
            id: '3',
            name: 'Amit Patel',
            email: 'amit@smallbiz.com',
            role: 'small-scale',
            password: btoa('password123')
        }
    ];

    // Demo Products (Page 1)
    const demoProducts = [
        {
            id: '101',
            name: 'Electronic Gadget A',
            price: 1500,
            gst: 18,
            quantity: 50,
            description: 'High-quality electronic gadget',
            createdAt: new Date().toISOString()
        },
        {
            id: '102',
            name: 'Electronic Gadget B',
            price: 2500,
            gst: 18,
            quantity: 8,
            description: 'Premium electronic gadget with warranty',
            createdAt: new Date().toISOString()
        },
        {
            id: '103',
            name: 'Widget C',
            price: 800,
            gst: 12,
            quantity: 120,
            description: 'Durable widget for industrial use',
            createdAt: new Date().toISOString()
        },
        {
            id: '104',
            name: 'Component D',
            price: 500,
            gst: 5,
            quantity: 9,
            description: 'Electronic component',
            createdAt: new Date().toISOString()
        }
    ];

    // Demo Orders (Page 1)
    const demoOrders = [
        {
            id: '201',
            buyerName: 'Priya Sharma',
            buyerEmail: 'priya@retailer.com',
            items: [
                { productId: '101', quantity: 5, price: 1500 },
                { productId: '103', quantity: 10, price: 800 }
            ],
            total: 15500,
            status: 'pending',
            date: new Date().toISOString()
        }
    ];

    // Demo Sales Invoices (Page 1)
    const demoSales = [
        {
            invoiceId: 'INV-20240101',
            customerName: 'ABC Retail Store',
            items: [
                { id: '101', name: 'Electronic Gadget A', quantity: 2, price: 1500, gst: 18, total: 3540 },
                { id: '103', name: 'Widget C', quantity: 5, price: 800, gst: 12, total: 4480 }
            ],
            subtotal: 7300,
            gstAmount: 1314,
            total: 8614,
            date: '2024-01-01',
            createdAt: new Date().toISOString()
        },
        {
            invoiceId: 'INV-20240105',
            customerName: 'XYZ Distributors',
            items: [
                { id: '102', name: 'Electronic Gadget B', quantity: 1, price: 2500, gst: 18, total: 2950 }
            ],
            subtotal: 2500,
            gstAmount: 450,
            total: 2950,
            date: '2024-01-05',
            createdAt: new Date().toISOString()
        }
    ];

    // Demo Suppliers (Page 2)
    const demoSuppliers = [
        {
            id: '301',
            name: 'Raj Kumar Wholesaler',
            email: 'raj@wholesaler.com',
            phone: '+91-9876543210',
            address: 'Factory Road, Industrial Area',
            city: 'Mumbai',
            products: ['101', '102', '103'],
            createdAt: new Date().toISOString()
        },
        {
            id: '302',
            name: 'Tech Components Ltd',
            email: 'contact@techcomp.com',
            phone: '+91-8765432109',
            address: 'Tech Park, Business District',
            city: 'Bangalore',
            products: ['104'],
            createdAt: new Date().toISOString()
        }
    ];

    // Demo Purchase Invoices (Page 2)
    const demoPurchaseInvoices = [
        {
            invoiceId: 'PUR-20240103',
            supplierId: '301',
            supplierName: 'Raj Kumar Wholesaler',
            items: [
                { id: '101', name: 'Electronic Gadget A', quantity: 10, price: 1500, gst: 18, total: 17700 },
                { id: '103', name: 'Widget C', quantity: 20, price: 800, gst: 12, total: 17920 }
            ],
            subtotal: 31000,
            gstAmount: 3620,
            total: 34620,
            date: '2024-01-03',
            createdAt: new Date().toISOString()
        }
    ];

    // Page 1 Data
    const page1Data = {
        products: demoProducts,
        orders: demoOrders,
        sales: demoSales,
        invoices: []
    };

    // Page 2 Data
    const page2Data = {
        suppliers: demoSuppliers,
        purchases: [
            { id: '101', name: 'Electronic Gadget A', quantity: 10, price: 1500 },
            { id: '103', name: 'Widget C', quantity: 20, price: 800 }
        ],
        invoices: demoPurchaseInvoices
    };

    // Notifications
    const demoNotifications = [
        {
            id: '401',
            type: 'request',
            title: 'Priya Sharma - Retailer',
            message: 'Requesting to purchase products from your inventory. Click to review and approve.',
            read: false,
            createdAt: new Date().toISOString()
        },
        {
            id: '402',
            type: 'warning',
            title: 'Low Stock Alert',
            message: 'Product "Electronic Gadget B" has only 8 units left. Consider reordering.',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: '403',
            type: 'warning',
            title: 'Low Stock Alert',
            message: 'Product "Component D" has only 9 units left.',
            read: true,
            createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
            id: '404',
            type: 'info',
            title: 'Order Confirmation',
            message: 'New order received from ABC Retail Store - INV-20240101',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    // Save to localStorage
    localStorage.setItem('inventoryUsers', JSON.stringify(demoUsers));
    localStorage.setItem('page1Data', JSON.stringify(page1Data));
    localStorage.setItem('page2Data', JSON.stringify(page2Data));
    localStorage.setItem('page1Notifications', JSON.stringify(demoNotifications));

    console.log('Demo data initialized successfully!');
    alert('Demo data has been loaded. You can now login with:\n\nWholesaler:\nEmail: raj@wholesaler.com\nPassword: password123\n\nRetailer:\nEmail: priya@retailer.com\nPassword: password123\n\nSmall Scale Business:\nEmail: amit@smallbiz.com\nPassword: password123');
}

// Initialize demo data on demand
function initDemoOnLoad() {
    const initialized = localStorage.getItem('demoDataInitialized');
    if (!initialized) {
        // Only initialize once
        initializeDemoData();
        localStorage.setItem('demoDataInitialized', 'true');
    }
}

// Run on page load (uncomment to auto-initialize)
// document.addEventListener('DOMContentLoaded', initDemoOnLoad);
