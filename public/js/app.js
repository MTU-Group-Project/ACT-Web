import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCWQkEmFkxDqsWi_ilIbEdOLpPcGu9kWrg",
    authDomain: "mtu-group-project-act.firebaseapp.com",
    databaseURL: "https://mtu-group-project-act-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mtu-group-project-act",
    storageBucket: "mtu-group-project-act.appspot.com",
    messagingSenderId: "677743889534",
    appId: "1:677743889534:web:0829f8e93b5960b407dc2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to sign in user
async function signInUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in:", user);
        alert(`Welcome, ${user.email}`);
    } catch (error) {
        console.error("Error signing in:", error.message);
        alert("Sign-in failed: " + error.message);
    }
}

signInUser();