import baseUrl from './config.js';

document.addEventListener("DOMContentLoaded", function(){
    // Constante pour les éléments du formulaire
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");
    const signupForm = document.getElementById("signupForm");

    // Affiche le mot de passe
    showPassword(passwordToggle, passwordInput);

    // Ajoute un écouteur de soumission sur le formulaire
    signupForm.addEventListener("submit", function(event){  
        // Empêche le formulaire de se soumettre
        event.preventDefault();

        // Récupère les valeurs des champs du formulaire
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;

        // Crée un compte
        createAccount(username, password);
    });
});

/**
 * Cette fonction permet de montrer ou cacher le mot de passe
 * @param {*} passwordToggle le bouton pour montrer ou cacher le mot de passe
 * @param {*} passwordInput le champ de mot de passe
 */
function showPassword(passwordToggle, passwordInput){
    // Ajoute un écouteur de clic sur le bouton pour montrer ou cacher le mot de passe
    passwordToggle.addEventListener('click', function(){
        // Si le mot de passe est actuellement caché, on le montre et on affiche l'image de l'icône de mot de passe
        if(passwordInput.type === 'password'){
            passwordInput.type = 'text';
            showImage('../images/show.png', 20, 20, 'show password');
        } else {
            // Si le mot de passe est actuellement visible, on le cache et on affiche l'image de l'icône de mot de passe
            passwordInput.type = 'password';
            showImage('../images/hide.png', 20, 20, 'hide password');
        }
    });
}

/**
 * Cette fonction permet d'afficher l'image de l'icône de mot de passe
 * @param {*} src le chemin de l'image
 * @param {*} width la largeur de l'image
 * @param {*} height la hauteur de l'image
 * @param {*} alt l'altitude de l'image
 */
function showImage(src, width, height, alt){
    // Crée un élément img
    let image = document.createElement('img');
    // Récupère l'élément passwordToggle
    const passwordToggle = document.getElementById('password-toggle');
    // Définit les attributs de l'image
    image.src = src;
    image.width = width;
    image.height = height;
    image.alt = alt;
    // Remplace le contenu de l'élément passwordToggle par l'image
    passwordToggle.innerHTML = '';
    // Ajoute l'image à l'élément passwordToggle
    passwordToggle.appendChild(image);
}

/**
 * Cette fonction permet de créer un compte
 * @param {*} username le nom d'utilisateur
 * @param {*} password le mot de passe
 */
async function createAccount(username, password) {  
    try {
        // Crée un objet FormData pour envoyer les données du formulaire
        const formData = new FormData();
        // Ajoute les données du formulaire à l'objet FormData
        formData.append('identifiant', username);
        formData.append('passe', password);
        
        // AJUSTER LE FETCH URL AU BESOIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        let response = await fetch(`${baseUrl}/inscription`, {
            method: 'POST',
            body: formData
        });

        // Vérifie si la réponse est ok
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();
        
        // Analyse la réponse en JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            throw new Error("Invalid JSON response");
        }
        
        // Si la réponse est une réussite
        if (data.reussite) {
            // Stocke le jeton
            localStorage.setItem('jeton', data.jeton);
            localStorage.setItem('username', username);
            // Stocke une variable pour afficher la notification sur la page suivante
            localStorage.setItem('showSuccessSignupNotification', 'true');
            
            // Redirige vers la page principale
            window.location.href = '../pages/index.html';
        } else {
            // Crée une notification
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showCancelButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            
            // Vérifie les différents types d'erreurs
            if (Array.isArray(data.erreurs)) {
                // Si erreurs est pour les mots de passe
                if (data.erreurs.some(err => err.includes("Longueur du mot de passe invalide"))) {
                    Toast.fire({
                        icon: "error",
                        title: "Le mot de passe doit contenir entre 8 et 32 caractères"
                    });
                } else if (data.erreurs.some(err => err.includes("ne contiens pas de majuscule"))) {
                    // Si le mot de passe ne contient pas de majuscule
                    Toast.fire({
                        icon: "error",
                        title: "Le mot de passe doit contenir au moins une majuscule"
                    });
                } else if (data.erreurs.some(err => err.includes("ne contiens pas de minuscule"))) {
                    // Si le mot de passe ne contient pas de minuscule
                    Toast.fire({
                        icon: "error",
                        title: "Le mot de passe doit contenir au moins une minuscule"
                    });
                } else if (data.erreurs.some(err => err.includes("ne contiens pas de chiffres"))) {
                    // Si le mot de passe ne contient pas de chiffre
                    Toast.fire({
                        icon: "error",
                        title: "Le mot de passe doit contenir au moins un chiffre"
                    });
                } else {
                    // Si le mot de passe ne contient pas de majuscule, de minuscule et de chiffre
                    Toast.fire({
                        icon: "error",
                        title: data.erreurs[0] || "Erreur d'inscription"
                    });
                }
            } else {
                // Si erreurs est une chaîne de caractères pour le nom d'utilisateur
                if (data.erreurs === "L'identifiant existe deja") {
                    // Affiche une notification
                    Toast.fire({
                        icon: "error",
                        title: "Nom d'utilisateur déjà utilisé"
                    });
                } else {
                    // Affiche une notification
                    Toast.fire({
                        icon: "error",
                        title: data.erreurs || "Erreur d'inscription"
                    });
                }
            }
        }   
    } catch (error) {
        // Affiche une notification
        console.error('Erreur:', error);
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showCancelButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        // Affiche une notification
        Toast.fire({
            icon: "error",
            title: "Une erreur est survenue lors de l'inscription: " + error.message
        });
    }
}