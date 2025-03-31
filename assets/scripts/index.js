document.addEventListener("DOMContentLoaded", function(){
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