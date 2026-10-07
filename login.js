/* =========================================================
   VCAJ OFFICIAL LOGIN
   Firebase Authentication + Firestore Role Check
   ========================================================= */

import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =========================================================
// ELEMENTS
// =========================================================

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const passwordToggle = document.getElementById("passwordToggle");
const rememberMe = document.getElementById("rememberMe");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const forgotPassword = document.getElementById("forgotPassword");


// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

passwordToggle.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        passwordToggle.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        passwordToggle.textContent = "Show";

    }

});


// =========================================================
// MESSAGE
// =========================================================

function showMessage(message, type) {

    loginMessage.textContent = message;
    loginMessage.className = "login-message " + type;

}


// =========================================================
// LOGIN
// =========================================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {

        showMessage(
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    try {

        loginButton.disabled = true;
        loginButton.textContent = "Signing In...";


        // Remember login
        await setPersistence(
            auth,
            rememberMe.checked
                ? browserLocalPersistence
                : browserSessionPersistence
        );


        // Firebase Authentication
        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // =================================================
        // FIRESTORE ROLE CHECK
        // =================================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            showMessage(
                "Your account is not registered as a VCAJ official user.",
                "error"
            );

            return;
        }


        const userData =
            userSnapshot.data();

        const role =
            userData.role;


        // =================================================
        // ADMIN
        // =================================================

        if (role === "admin") {

            showMessage(
                "Login successful. Opening dashboard...",
                "success"
            );

            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 700);

            return;
        }


        // =================================================
        // OTHER OFFICIAL ROLES
        // =================================================

        if (
            role === "cashier" ||
            role === "scorer" ||
            role === "editor" ||
            role === "committee"
        ) {

            showMessage(
                "Login successful. Opening dashboard...",
                "success"
            );

            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 700);

            return;
        }


        // =================================================
        // UNKNOWN ROLE
        // =================================================

        showMessage(
            "Your VCAJ role is not authorised.",
            "error"
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            showMessage(
                "Incorrect email or password.",
                "error"
            );

        } else if (
            error.code ===
            "auth/too-many-requests"
        ) {

            showMessage(
                "Too many attempts. Please try again later.",
                "error"
            );

        } else {

            showMessage(
                "Login failed. Please try again.",
                "error"
            );

        }

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Sign In";

    }

});


// =========================================================
// FORGOT PASSWORD
// =========================================================

forgotPassword.addEventListener("click", async function (event) {

    event.preventDefault();

    const email =
        usernameInput.value.trim();


    if (!email) {

        showMessage(
            "Enter your email address first.",
            "error"
        );

        usernameInput.focus();

        return;
    }


    try {

        await sendPasswordResetEmail(
            auth,
            email
        );

        showMessage(
            "Password reset email sent. Please check your inbox.",
            "success"
        );

    } catch (error) {

        console.error(
            "Password reset error:",
            error
        );

        showMessage(
            "Unable to send password reset email.",
            "error"
        );

    }

});