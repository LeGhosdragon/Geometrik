document.addEventListener("DOMContentLoaded", function(){
    const passwordToggle = document.getElementById("password-toggle");
    const passwordInput = document.getElementById("password");
    const signupForm = document.getElementById("signupForm");
    showPassword(passwordToggle, passwordInput);
    signupForm.addEventListener("submit", function(event){
        event.preventDefault();
        
        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;

        createAccount(username, password);
    });
    
    
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

async function createAccount(username, password) {
    try {
        const formData = new FormData();
        formData.append('identifiant', username);
        formData.append('passe', password);
        
        // AJUSTER LE FETCH URL AU BESOIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        let response = await fetch('http://localhost/H2025_TCH099_02_S1/api/api.php/inscription', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            throw new Error("Invalid JSON response");
        }
        
        if (data.reussite) {
            localStorage.setItem('jeton', data.jeton);
            window.location.href = '../pages/play.html';
        } else {
            alert('Erreur de connexion: ' + (data.erreurs || "Erreur inconnue"));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la connexion: ' + error.message);
    }
}
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