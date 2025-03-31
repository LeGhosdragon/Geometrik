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
    passwordToggle.innerHTML = ''; // Clear previous content
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
            localStorage.setItem('jeton', data.jeton);
            window.location.href = '../pages/index.html';
        } else {
            alert('Erreur de connexion: ' + (data.erreurs || "Erreur inconnue"));
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la connexion: ' + error.message);
    }
}