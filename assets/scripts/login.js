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
    async function login(username, password) {
        try {
            const formData = new FormData();
            formData.append('identifiant', username);
            formData.append('passe', password);
            
            // AJUSTER LE FETCH URL AU BESOIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            let response = await fetch('/Geometrik/Geometrik/api/api.php/connexion', {
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