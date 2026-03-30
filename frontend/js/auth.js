// Token Ingestion from URL for Google Logins directly to Dashboards
const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get("token");
const roleFromUrl = urlParams.get("role");

if (tokenFromUrl) {
    localStorage.setItem("token", tokenFromUrl);
    if (roleFromUrl && roleFromUrl !== "null") {
        localStorage.setItem("role", roleFromUrl);
    }
    // Clean URL so token isn't visible
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Authentication Module
const Auth = {

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    validatePassword(password) {
        return password.length >= 6;
    },

    async register(name, email, role, password, productTypes) {

        document.getElementById('registerNameError').textContent = '';
        document.getElementById('registerEmailError').textContent = '';
        document.getElementById('registerRoleError').textContent = '';
        document.getElementById('registerPasswordError').textContent = '';

        let hasError = false;

        if (!name.trim()) {
            document.getElementById('registerNameError').textContent = 'Name is required';
            hasError = true;
        }

        if (!this.validateEmail(email)) {
            document.getElementById('registerEmailError').textContent = 'Invalid email format';
            hasError = true;
        }

        if (!role) {
            document.getElementById('registerRoleError').textContent = 'Role is required';
            hasError = true;
        }

        if ((role === 'retailer' || role === 'small-scale') && !productTypes.trim()) {
            document.getElementById('registerProductTypesError').textContent = 'Product types are required';
            hasError = true;
        }

        if (!this.validatePassword(password)) {
            document.getElementById('registerPasswordError').textContent = 'Password must be at least 6 characters';
            hasError = true;
        }

        if (hasError) return false;

        try {

            const res = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, role, password, productTypes })
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "Registration failed", "error");
                return false;
            }

            alert("Registered successfully!");

// Reset register form
document.getElementById("registerForm").reset();

// Close register modal
closeModal('registerModal');

// Redirect to login page with email parameter
window.location.href = "index.html?showLogin=true&email=" + encodeURIComponent(email);

return true;

        } catch (err) {
            showToast("Server error", "error");
            return false;
        }
    },

    async login(email, password) {

        document.getElementById('loginEmailError').textContent = '';
        document.getElementById('loginPasswordError').textContent = '';

        let hasError = false;

        if (!this.validateEmail(email)) {
            document.getElementById('loginEmailError').textContent = 'Invalid email format';
            hasError = true;
        }

        if (!password) {
            document.getElementById('loginPasswordError').textContent = 'Password is required';
            hasError = true;
        }

        if (hasError) return false;

        try {

            const res = await fetch("http://localhost:5000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                document.getElementById('loginEmailError').textContent =
                    data.message || "Invalid email or password";
                return false;
            }

// store token and user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name || "");

            return true;

        } catch (err) {
            showToast("Server error", "error");
            return false;
        }
    },

    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
    },

    redirectToCorrectPage() {
        const role = localStorage.getItem("role");
        if (role === "wholesaler" || role === "manufacturer" || role === "distributor") {
            window.location.href = "page1-dashboard.html";
        } else {
            window.location.href = "page2-products.html";
        }
    },

    getToken() {
        return localStorage.getItem("token");
    },

    getCurrentUser() {
        const name = localStorage.getItem("name");
        const role = localStorage.getItem("role");
        if (!name && !role) return null;
        return { name, role };
    },

    isAuthenticated() {
        return !!localStorage.getItem("token");
    },

    redirectToCorrectPage() {

        const role = localStorage.getItem("role");

        if (!role) {
            window.location.href = "index.html";
            return;
        }

        if (
            role === "wholesaler" ||
            role === "manufacturer" ||
            role === "distributor"
        ) {
            window.location.href = "page1-dashboard.html";
        } else {
            window.location.href = "page2-products.html";
        }
    }
};


// Handle Forms
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // LOGIN
    if (loginForm) {

        loginForm.addEventListener("submit", async function (e) {

            e.preventDefault();

            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            const success = await Auth.login(email, password);

            if (success) {
                Auth.redirectToCorrectPage();
            }
        });

    }

    // REGISTER
    if (registerForm) {

        registerForm.addEventListener("submit", async function (e) {

            e.preventDefault();

            const name = document.getElementById("registerName").value;
            const email = document.getElementById("registerEmail").value;
            const role = document.getElementById("registerRole").value;
            const password = document.getElementById("registerPassword").value;
            const productTypes = document.getElementById("registerProductTypes").value;

            const success = await Auth.register(name, email, role, password, productTypes);

            if (success) {
                registerForm.reset();
            }

        });

        // Role change listener
        const roleSelect = document.getElementById('registerRole');
        if (roleSelect) {
            roleSelect.addEventListener('change', function() {
                const role = this.value;
                const div = document.getElementById('productTypesDiv');
                if (role === 'retailer' || role === 'small-scale') {
                    div.style.display = 'block';
                } else {
                    div.style.display = 'none';
                }
            });
        }

    }

});

// Global logout function for onclick handlers
function logout(event) {
    if (event) event.preventDefault();
    Auth.logout();
    window.location.href = "index.html";
}