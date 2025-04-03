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
            showImage('../images/show.png', 20, 20, 'show password');
        } else {
            passwordInput.type = 'password';
            showImage('../images/hide.png', 20, 20, 'hide password');
        }
    });
}

function showImage(src, width, height, alt){
    let image = document.createElement('img');
    const passwordToggle = document.getElementById('password-toggle');
    image.src = src;
    image.width = width;
    image.height = height;
    image.alt = alt;
    passwordToggle.innerHTML = '';
    passwordToggle.appendChild(image);
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
            // Stocke le jeton
            localStorage.setItem('jeton', data.jeton);
            
            // Stocke une variable pour afficher la notification sur la page suivante
            localStorage.setItem('showSuccessSignupNotification', 'true');
            
            // Redirige vers la page principale
            window.location.href = '../pages/index.html';
        } else {
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
                    Toast.fire({
                        icon: "error",
                        title: "Le mot de passe doit contenir au moins une majuscule"
                    });
                } else if (data.erreurs.some(err => err.includes("ne contiens pas de minuscule"))) {
                    Toast.fire({
                        icon: "error",
                        title: "Le mot de passe doit contenir au moins une minuscule"
                    });
                } else if (data.erreurs.some(err => err.includes("ne contiens pas de chiffres"))) {
                    Toast.fire({
                        icon: "error",
                        title: "Le mot de passe doit contenir au moins un chiffre"
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: data.erreurs[0] || "Erreur d'inscription"
                    });
                }
            } else {
                // Si erreurs est une chaîne de caractères pour le nom d'utilisateur
                if (data.erreurs === "L'identifiant existe deja") {
                    Toast.fire({
                        icon: "error",
                        title: "Nom d'utilisateur déjà utilisé"
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: data.erreurs || "Erreur d'inscription"
                    });
                }
            }
        }
    } catch (error) {
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
        Toast.fire({
            icon: "error",
            title: "Une erreur est survenue lors de l'inscription: " + error.message
        });
    }
}