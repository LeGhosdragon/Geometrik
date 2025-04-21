import Auth from './auth.js';

document.addEventListener("DOMContentLoaded", function(){
    // Récupérer la notification de succès d'inscription
    const showSuccessSignupNotification = localStorage.getItem('showSuccessSignupNotification');
    // Récupérer la notification de succès de connexion
    const showSuccessLoginNotification = localStorage.getItem('showSuccessLoginNotification');
    // Récupérer le conteneur de la page d'accueil
    const heroContainer = document.querySelector('.hero-container');
    // Constante pour le bouton jouer
    const btnJouer = document.getElementById("btn-jouer");
    // Constante pour le bouton creer un compte
    const btnCompte = document.getElementById("btn-compte");
    // Créer une instance de Toast
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: true,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    // Si la notification de succès d'inscription est active
    if (showSuccessSignupNotification === 'true') {
        // Supprimer le flag pour éviter que la notification s'affiche à chaque rechargement
        localStorage.removeItem('showSuccessSignupNotification');
        
        // Afficher la notification de succès d'inscription
        Toast.fire({
            icon: "success",
            title: "Compte créé avec succès"
        });
    } else if (showSuccessLoginNotification === 'true') {
        // Supprimer le flag pour éviter que la notification s'affiche à chaque rechargement
        localStorage.removeItem('showSuccessLoginNotification');
        
        // Afficher la notification de succès de connexion
        Toast.fire({
            icon: "success",
            title: "Connecté avec succès"
        });
    }

    //Enlever le bouton compte lorsqu'on est connecté
    if(Auth.getAccessToken()){
        heroContainer.innerHTML = `<div class="hero-container">
        <div class="hero-content">
            <h1 class="hero-title">Geometrik</h1>
            <p class="hero-description">Personnalisez votre héros, élaborez une stratégie, et conquérez des vagues infinies d'ennemis!</p>
            <div class="hero-buttons">
              <button id="btn-jouer" class="btn btn-primary"> JOUER</button>
            </div>
        </div>
      </div>`;
    }

    //Fonction pour le bouton jouer
    btnJouer.addEventListener("click", function(){
        //Redirige vers la page de jeu
        window.location.href = '../../Jeu/assets/pages/index.html';
    });

    //Fonction pour le bouton compte
    btnCompte.addEventListener("click", function(){
        //Redirige vers la page de création de compte
        window.location.href = '../pages/signup.html';
    });
})