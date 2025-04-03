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

async function login(username, password) {
        try {
            const formData = new FormData();
            formData.append('identifiant', username);
            formData.append('passe', password);
            
            // AJUSTER LE FETCH URL AU BESOIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            let response = await fetch('http://localhost/H2025_TCH099_02_S1/api/api.php/connexion', {
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
                localStorage.setItem('showSuccessLoginNotification', 'true');   
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
                
                // Gestion des différents types d'erreurs
                if (data.erreurs === "L'identifiant est invalide") {
                    Toast.fire({
                        icon: "error",
                        title: "Nom d'utilisateur introuvable"
                    });
                } else if (data.erreurs === "Le mot de passe est incorect") {
                    Toast.fire({
                        icon: "error",
                        title: "Mot de passe incorrect"
                    });
                } else if (data.erreurs === "Aucun identifiant n'a été trouvé" || data.erreurs === "Aucun identifiant n'a ete envoye") {
                    Toast.fire({
                        icon: "error",
                        title: "Veuillez saisir un nom d'utilisateur"
                    });
                } else if (data.erreurs === "Aucun mot de passe n'a ete envoye") {
                    Toast.fire({
                        icon: "error",
                        title: "Veuillez saisir un mot de passe"
                    });
                } else {
                    Toast.fire({
                        icon: "error",
                        title: data.erreurs || "Erreur de connexion"
                    });
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
                title: "Une erreur est survenue lors de la connexion: " + error.message
            });
        }
}

function showPassword(passwordToggle, passwordInput){
    passwordToggle.addEventListener('click', function(){
        if(passwordInput.type === 'password'){
            passwordInput.type = 'text';
            showImage('../images/show.png', 20, 20, 'show password');
            console.log('show password');
            //this.textContent = '../images/hide.png';
        } else {
            passwordInput.type = 'password';
            showImage('../images/hide.png', 20, 20, 'hide password');
            console.log('hide password');
            //this.textContent = '../images/show.png';
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
    passwordToggle.innerHTML = ''; // Clear previous content
    passwordToggle.appendChild(image);
}