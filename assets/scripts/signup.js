import Auth from './auth.js';

document.addEventListener("DOMContentLoaded", function(){
    // Constante pour les éléments du formulaire
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");
    const signupForm = document.getElementById("signupForm");

    // Affiche le mot de passe
    showPassword(passwordToggle, passwordInput);

    // Ajoute un écouteur de soumission sur le formulaire
    signupForm.addEventListener("submit", async function(event){  
        // Empêche le formulaire de se soumettre
        event.preventDefault();

        // Récupère les valeurs des champs du formulaire
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;

        try {
            // Utilise la méthode signup de Auth pour créer un compte
            await Auth.signup(username, password);
            localStorage.setItem('showSuccessSignupNotification', 'true');
            window.location.href = '../pages/index.html';
        } catch (error) {
            handleSignupError(error);
        }
    });
});

/** Gère les erreurs d'inscription et affiche les notifications appropriées
 * 
 * @param {Error} error - L'erreur capturée
 */
function handleSignupError(error){
    console.error('Erreur:', error);

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
    
    // Gestion des différents types d'erreurs
    const errorMessage = error.message || "";

    if(errorMessage.includes("Longueur du mot de passe invalide")){
        Toast.fire({
            icon: "error",
            title: "Le mot de passe doit contenir entre 8 et 32 caractères"
        });
    } else if(errorMessage.includes("ne contiens pas de majuscule")){
        Toast.fire({
            icon: "error",
            title: "Le mot de passe doit contenir au moins une majuscule"
        });
    } else if(errorMessage.includes("ne contiens pas de minuscule")){
        Toast.fire({
            icon: "error",
            title: "Le mot de passe doit contenir au moins une minuscule"
        });
    } else if(errorMessage.includes("ne contiens pas de chiffres")){
        Toast.fire({
            icon: "error",
            title: "Le mot de passe doit contenir au moins un chiffre"
        });
    } else if(errorMessage.includes("L'identifiant existe deja")){
        Toast.fire({
            icon: "error",
            title: "Nom d'utilisateur déjà utilisé"
        });
    } else {
        Toast.fire({
            icon: "error",
            title: "Erreur d'inscription"
        });
    }
}

/** Cette fonction permet de montrer ou cacher le mot de passe
 * 
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

/** Cette fonction permet d'afficher l'image de l'icône de mot de passe
 * 
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