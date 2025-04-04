document.addEventListener("DOMContentLoaded", function() {
    const feedbackForm = document.getElementById("feedback-form");
    const feedbackInput = document.getElementById("feedback");
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const categoryBadges = document.querySelectorAll('.category-badge');
    let selectedCategory = "";
    
    // Récupérer le jeton depuis localStorage ou sessionStorage
    const jeton = localStorage.getItem('jeton') || sessionStorage.getItem('jeton');
    
    // Vérification si l'utilisateur est connecté
    if (!jeton) {
        // Option 1: Désactiver le formulaire
        feedbackForm.querySelectorAll('input, textarea, button').forEach(element => {
            element.disabled = true;
        });
        
        // Afficher un message indiquant qu'il faut se connecter
        const messageElement = document.createElement('div');
        messageElement.classList.add('feedback-login-required');
        messageElement.innerHTML = '<p>Veuillez <a href="login.html">vous connecter</a> pour laisser un feedback.</p>';
        feedbackForm.prepend(messageElement);
    }
    
    // Gestion des catégories
    categoryBadges.forEach(badge => {
        badge.addEventListener('click', function() {
            categoryBadges.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedCategory = this.dataset.category;
        });
    });
    
    // Compteur de caractères
    feedbackInput.addEventListener("input", function() {
        const currentLength = this.value.length;
        const charCount = document.getElementById("char-count");
        if (charCount) {
            charCount.textContent = currentLength;
            
            if (currentLength > 400) {
                charCount.style.color = "#ff9e0b";
            } else {
                charCount.style.color = "";
            }
        }
    });
    
    // Soumission du formulaire
    feedbackForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Vérification si l'utilisateur est connecté
        if (!jeton) {
            Swal.fire({
                icon: "error",
                title: "Vous devez être connecté",
                text: "Veuillez vous connecter pour soumettre un feedback",
                footer: '<a href="login.html">Se connecter</a>'
            });
            return;
        }
        
        const feedback = feedbackInput.value;
        let rating = 0;
        
        // Récupérer la note
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        if (selectedRating) {
            rating = parseInt(selectedRating.value);
        }
        
        // Validation du formulaire
        if (feedback.trim() === "") {
            Swal.fire({
                icon: "error",
                title: "Veuillez entrer un feedback!",
            });
        }
        else if (rating === 0) {
            Swal.fire({
                icon: "error",
                title: "Veuillez sélectionner une note!",
            });
        }
        else if (selectedCategory === "") {
            Swal.fire({
                icon: "error",
                title: "Veuillez sélectionner une catégorie!",
            });
        }
        else {
            // Envoi du feedback au serveur
            const formData = new FormData();
            formData.append('jeton', jeton);
            formData.append('contenu', feedback);
            formData.append('note', rating);
            formData.append('categorie', selectedCategory);
            // http://localhost/H2025_TCH099_02_S1/api/api.php/connexion
            fetch('http://localhost/H2025_TCH099_02_S1/api/api.php/feedback/soumettre', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.reussite) {
                    Swal.fire({
                        icon: "success",
                        title: "Feedback envoyé!",
                        text: `Votre note: ${rating} étoiles | Catégorie: ${selectedCategory}`,
                    });
                    
                    // Réinitialiser le formulaire
                    feedbackForm.reset();
                    categoryBadges.forEach(b => b.classList.remove('active'));
                    selectedCategory = "";
                    
                    const charCount = document.getElementById("char-count");
                    if (charCount) {
                        charCount.textContent = "0";
                    }
                } else {
                    let errorMessage = "Une erreur est survenue";
                    if (data.erreurs) {
                        errorMessage = 
                            data.erreurs === 'JETON_INVALIDE' ? "Votre session a expiré, veuillez vous reconnecter" :
                            data.erreurs === 'CONTENU_VIDE' ? "Le contenu ne peut pas être vide" :
                            data.erreurs === 'NOTE_INVALIDE' ? "La note doit être entre 1 et 5" :
                            data.erreurs === 'CATEGORIE_INVALIDE' ? "Catégorie invalide" :
                            data.erreurs;
                    }
                    
                    Swal.fire({
                        icon: "error",
                        title: "Erreur",
                        text: errorMessage,
                    });
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur de connexion",
                    text: "Impossible de contacter le serveur",
                });
            });
        }
    });
});