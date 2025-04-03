document.addEventListener("DOMContentLoaded", function(){
    // Vérifier si une notification de succès doit être affichée
    const showSuccessSignupNotification = localStorage.getItem('showSuccessSignupNotification');
    const showSuccessLoginNotification = localStorage.getItem('showSuccessLoginNotification');
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

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

    //Variables pour les boutons
    const btnJouer = document.getElementById("btn-jouer");
    const btnCompte = document.getElementById("btn-compte");

    //Fonction pour le bouton jouer
    btnJouer.addEventListener("click", function(){
        //Redirige vers la page de jeu
        window.location.href = '../../Jeu/assets/pages/index.html';
    })

    //Fonction pour le bouton compte
    btnCompte.addEventListener("click", function(){
        //Redirige vers la page de création de compte
        window.location.href = '../pages/signup.html';
    })
})