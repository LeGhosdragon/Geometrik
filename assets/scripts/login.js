document.addEventListener("DOMContentLoaded", function(){
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");
    const loginForm = document.getElementById("loginForm");

    showPassword(passwordToggle, passwordInput);

    loginForm.addEventListener('submit', function(event){
        event.preventDefault();

        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;

        login(username, password);
    });
});

/**
 * Cette fonction permet de se connecter au jeu
 * @param {*} username le nom d'utilisateur
 * @param {*} password le mot de passe
 */
async function login(username, password) {
    // Essaie de se connecter
        try {
            // Crée un objet FormData
            const formData = new FormData();
            // Ajoute l'identifiant et le mot de passe au formulaire
            formData.append('identifiant', username);
            // Ajoute le mot de passe au formulaire
            formData.append('passe', password);
            
            // AJUSTER LE FETCH URL AU BESOIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            let response = await fetch('https://nexbit.ca/geometrik/api.php/connexion', {
                method: 'POST',
                body: formData
            });

            // Si la réponse n'est pas ok
            if (!response.ok) {
                // Lève une erreur HTTP
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // Récupère la réponse
            const responseText = await response.text();
            
            // Récupère les données
            let data;
            try {
                // Parse les données
                data = JSON.parse(responseText);
            } catch (e) {
                // Lève une erreur
                console.error("Failed to parse JSON:", e);
                throw new Error("Invalid JSON response");
            }
            // Si la connexion est réussie
            if (data.reussite) {
                // Stocke le jeton
                localStorage.setItem('jeton', data.jeton);
                localStorage.setItem('username', username);
                // Stocke la notification de succès de connexion
                localStorage.setItem('showSuccessLoginNotification', 'true');   
                // Redirige vers la page d'accueil
                window.location.href = '../pages/index.html';
            } else {
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
                if (data.erreurs === "L'identifiant est invalide") {
                    // Affiche l'erreur que le nom d'utilisateur est introuvable
                    Toast.fire({
                        icon: "error",
                        title: "Nom d'utilisateur introuvable"
                    });
                } else if (data.erreurs === "Le mot de passe est incorect") {
                    // Affiche l'erreur que le mot de passe est incorrect
                    Toast.fire({
                        icon: "error",
                        title: "Mot de passe incorrect"
                    });
                } else if (data.erreurs === "Aucun identifiant n'a été trouvé" || data.erreurs === "Aucun identifiant n'a ete envoye") {
                    // Affiche l'erreur que le nom d'utilisateur n'a pas été envoyé
                    Toast.fire({
                        icon: "error",
                        title: "Veuillez saisir un nom d'utilisateur"
                    });
                } else if (data.erreurs === "Aucun mot de passe n'a ete envoye") {
                    // Affiche l'erreur que le mot de passe n'a pas été envoyé
                    Toast.fire({
                        icon: "error",
                        title: "Veuillez saisir un mot de passe"
                    });
                } else {
                    // Affiche l'erreur que l'identifiant ou le mot de passe est incorrect
                    Toast.fire({
                        icon: "error",
                        title: data.erreurs || "Erreur de connexion"
                    });
                }
            }
        } catch (error) {
            // Affiche l'erreur que l'identifiant ou le mot de passe est incorrect
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
            })
            Toast.fire({
                icon: "error",
                title: "Une erreur est survenue lors de la connexion: " + error.message
            });
        }
}

/**
 * Cette fonction permet d'afficher le mot de passe
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

/**
 * Cette fonction permet d'afficher l'image
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