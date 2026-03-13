// Navbar Module
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const user = Auth.getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Update user greeting
    const greeting = document.getElementById('userGreeting');
    if (greeting) {
        greeting.textContent = `Welcome, ${user.name}! (${capitalizeRole(user.role)})`;
    }

    // Initialize navbar
    initNavbar();
    setupNavbarHamburger();
    setActiveNavLink();
});

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Add navbar shadow on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 0) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        }
    });
}

function setupNavbarHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        const spans = hamburger.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu when link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'page1-dashboard.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'page1-dashboard.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function capitalizeRole(role) {
    const roles = {
        'wholesaler': 'Wholesaler',
        'retailer': 'Retailer',
        'small-scale': 'Small Scale Business Owner',
        'distributor': 'Distributor',
        'manufacturer': 'Manufacturer'
    };
    return roles[role] || role;
}

// Global utilities
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        event.target.style.display = 'none';
    }
});

// Escape key to close modal
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
    }
});
