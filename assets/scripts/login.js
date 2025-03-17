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