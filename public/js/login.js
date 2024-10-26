import { API } from "/js/api.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"

const firebaseConfig = {
	apiKey: "AIzaSyCWQkEmFkxDqsWi_ilIbEdOLpPcGu9kWrg",
	authDomain: "mtu-group-project-act.firebaseapp.com",
	projectId: "mtu-group-project-act",
	storageBucket: "mtu-group-project-act.appspot.com"
}

const app = initializeApp(firebaseConfig);
const auth = getAuth();

async function googleLogin() {
	const provider = new GoogleAuthProvider();
	try {
		let loginResult = await signInWithPopup(auth, provider);
	} catch(error) {
		return alert(error);
	}
	alert("Logged in");
}


async function login() {
	let email = document.getElementById("email").value;
	let password = document.getElementById("password").value;
	let credential;
	
	try {
		credential = await signInWithEmailAndPassword(auth, email, password);
	} catch(error) {
		return alert(error);
	}

	const user = credential.user;
	console.log(user);
	alert("Logged in")
}

async function register() {
	let email = document.getElementById("email").value;
	let password = document.getElementById("password").value;
	let credential;
	
	try {
		credential = await createUserWithEmailAndPassword(auth, email, password);
	} catch(error) {
		return alert(error);
	}

	const user = credential.user;
	alert("Account created")
	document.location = "/login"
}

export async function getCurrentUID() {
	const auth = getAuth();
	return auth.currentUser ? auth.currentUser.uid : null;
}

document.login = login
document.register = register
document.googleLogin = googleLogin