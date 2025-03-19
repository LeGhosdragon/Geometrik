function validerMotDePasse(mdp) {
    const erreurs = [];

    // Au moins une majuscule
    if (!/[A-Z]/.test(mdp)) {
        erreurs.push("Mettez une lettre majuscule pour votre mot de passe.");
    }

    // Au moins une minuscule
    if (!/[a-z]/.test(mdp)) {
        erreurs.push("Mettez une lettre minuscule pour votre mot de passe.");
    }

    // Au moins un chiffre
    if (!/[0-9]/.test(mdp)) {
        erreurs.push("Il manque un nombre dans votre mot de passe.");
    }

    // Entre 8 et 32 caractères
    if (mdp.length < 8 || mdp.length > 32) {
        erreurs.push("Mettez un mot de passe entre 8 et 32 caractères inclusivement.");
    }

    return erreurs;
}


document.addEventListener("DOMContentLoaded", function(){
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");

    showPassword(passwordToggle, passwordInput);
});
function showPassword(passwordToggle, passwordInput){
    passwordToggle.addEventListener('click', function(){
        if(passwordInput.type === 'password'){
            passwordInput.type = 'text';
            this.textContent = '👁️‍🗨️';
        } else {
            passwordInput.type = 'password';
            this.textContent = '👁️';
        }
    });
}