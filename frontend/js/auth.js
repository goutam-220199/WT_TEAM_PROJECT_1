// Authentication Module
const Auth = {

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    validatePassword(password) {
        return password.length >= 6;
    },

    async register(name, email, role, password) {

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

        if (!this.validatePassword(password)) {
            document.getElementById('registerPasswordError').textContent = 'Password must be at least 6 characters';
            hasError = true;
        }

        if (hasError) return false;

        try {

            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, role, password })
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || "Registration failed", "error");
                return false;
            }

            showToast("Account created successfully! Please login.", "success");
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

            const res = await fetch("http://localhost:5000/api/auth/login", {
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
            window.location.href = "page2-dashboard.html";
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

            const success = await Auth.register(name, email, role, password);

            if (success) {
                registerForm.reset();
            }

        });

    }

});

// Global logout function for onclick handlers
function logout(event) {
    if (event) event.preventDefault();
    Auth.logout();
    window.location.href = "index.html";
}