document.addEventListener("DOMContentLoaded", function(){
    const btnJouer = document.getElementById("btn-jouer");
    const btnCompte = document.getElementById("btn-compte");

    btnJouer.addEventListener("click", function(){
        window.location.href = '../pages/play.html';
    })

    btnCompte.addEventListener("click", function(){
        window.location.href = '../pages/signup.html';
    })
})