import Auth from './auth.js';

document.addEventListener("DOMContentLoaded", function(){
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");
    const loginForm = document.getElementById("loginForm");

    showPassword(passwordToggle, passwordInput);

    loginForm.addEventListener('submit', async function(event){
        event.preventDefault();

        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;

        try{
            await Auth.login(username, password);
            // Stocke la notification de succès de connexion
            localStorage.setItem('showSuccessLoginNotification', 'true');   
            // Redirige vers la page d'accueil
            window.location.href = '../pages/index.html';
        } catch (error) {
            handleLoginError(error);
        }
    });
});

/** Gère les erreurs de connexion et affiche les notifications appropriées
 * 
 * @param {Error} error - L'erreur capturée
 */
function handleLoginError(error) {
    console.error('Erreur:', error);
    
    // Crée une instance de Toast
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
    
    if (errorMessage.includes("L'identifiant est invalide")) {
        Toast.fire({
            icon: "error",
            title: "Nom d'utilisateur introuvable"
        });
    } else if (errorMessage.includes("Le mot de passe est incorect")) {
        Toast.fire({
            icon: "error",
            title: "Mot de passe incorrect"
        });
    } else if (errorMessage.includes("Aucun identifiant n'a été trouvé") || errorMessage.includes("Aucun identifiant n'a ete envoye")) {
        Toast.fire({
            icon: "error",
            title: "Veuillez saisir un nom d'utilisateur"
        });
    } else if (errorMessage.includes("Aucun mot de passe n'a ete envoye")) {
        Toast.fire({
            icon: "error",
            title: "Veuillez saisir un mot de passe"
        });
    } else {
        Toast.fire({
            icon: "error",
            title: errorMessage || "Erreur de connexion"
        });
    }
}

/** Cette fonction permet d'afficher le mot de passe
 * 
 * @param {*} passwordToggle le bouton pour afficher le mot de passe
 * @param {*} passwordInput le champ de mot de passe
 */
function showPassword(passwordToggle, passwordInput){
    // Ajoute un événement click sur le bouton pour afficher le mot de passe
    passwordToggle.addEventListener('click', function(){
        // Si le mot de passe est affiché
        if(passwordInput.type === 'password'){
            // Change le type du mot de passe en texte
            passwordInput.type = 'text';
            // Affiche l'image pour montrer le mot de passe
            showImage('../images/show.png', 20, 20, 'show password');
            console.log('show password');
        } else {
            passwordInput.type = 'password';
            // Affiche l'image pour masquer le mot de passe
            showImage('../images/hide.png', 20, 20, 'hide password');
            console.log('hide password');
        }
    });
}

/** Cette fonction permet d'afficher l'image
 * 
 * @param {*} src l'url de l'image
 * @param {*} width la largeur de l'image
 * @param {*} height la hauteur de l'image
 * @param {*} alt l'alt de l'image
 */
function showImage(src, width, height, alt){
    // Crée une image
    let image = document.createElement('img');
    // Récupère le bouton pour afficher le mot de passe
    const passwordToggle = document.getElementById('password-toggle');
    // Change la source de l'image
    image.src = src;
    // Change la largeur de l'image
    image.width = width;
    // Change la hauteur de l'image
    image.height = height;
    // Change l'alt de l'image
    image.alt = alt;
    // Vide le contenu du bouton
    passwordToggle.innerHTML = '';
    // Ajoute l'image au bouton
    passwordToggle.appendChild(image);
}