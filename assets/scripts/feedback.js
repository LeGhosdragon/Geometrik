import baseUrl from './config.js';

document.addEventListener("DOMContentLoaded", function() {
    const feedbackForm = document.getElementById("feedback-form");
    const feedbackInput = document.getElementById("feedback");
    const feedbackHeader = document.getElementById("feedback-header");
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const categoryBadges = document.querySelectorAll('.category-badge');
    const adminPanel = document.getElementById("admin-panel");
    const adminCategories = document.querySelectorAll('.admin-category');
    let selectedCategory = "";
    let isAdmin = false;
    
    // Récupérer le jeton depuis localStorage
    const jeton = localStorage.getItem('jeton');
    
    // Vérification si l'utilisateur est connecté
    if (!jeton) {
        // Option 1: Désactiver le formulaire
        feedbackForm.querySelectorAll('input, textarea, button').forEach(element => {
            element.disabled = true;
        });
        
        // Afficher un message indiquant qu'il faut se connecter
        const messageElement = document.createElement('div');
        messageElement.classList.add('feedback-login-required');
        messageElement.innerHTML = '<p>Veuillez <a href="login.html"><u>vous connecter</u></a> pour laisser un feedback.</p>';
        feedbackForm.prepend(messageElement);
    } else {
        checkAdminStatus();
    }

    function checkAdminStatus(){
        const formData = new FormData();
        formData.append('jeton', jeton);

        fetch(`${baseUrl}/utilisateur/estAdmin?jeton=${encodeURIComponent(jeton)}`)
        .then(response => response.json())
        .then(data => {
            if(data.reussite && data.estAdmin){
                isAdmin = true;
                showAdminPanel();
            }
        })
        .catch(error =>{
            console.error('Erreur:', error);
        })
    }

    function showAdminPanel(){
        adminPanel.style.display = 'block';
        feedbackHeader.style.display = 'none';
        feedbackForm.style.display = 'none';

        loadFeedbacks();

        adminCategories.forEach(category =>{
            category.addEventListener('click', function(){
                adminCategories.forEach(c => c.classList.remove('active'));
                this.classList.add('active');

                const selectedAdminCategory = this.dataset.category;
                loadFeedbacks(selectedAdminCategory === 'all' ? null : selectedAdminCategory);
            });
        });
    }

    function loadFeedbacks(category = null){
        const feedbackContainer = document.getElementById('feedback-container');
        feedbackContainer.innerHTML = '<div class="loading">Chargement des feedbacks...</div>';

        let url = `${baseUrl}/feedback/liste?jeton=${encodeURIComponent(jeton)}`;
        if (category) {
            url += `&categorie=${encodeURIComponent(category)}`;
        }
        console.log('→ fetch URL:', url);   // <–– A coller dans le navigateur ou Postman
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.reussite && data.feedbacks) {
                    displayFeedbacks(data.feedbacks);
                } else {
                    feedbackContainer.innerHTML = '<div class="no-feedback">Aucun feedback trouvé.</div>';
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                feedbackContainer.innerHTML = '<div class="no-feedback">Erreur lors du chargement des feedbacks.</div>';
            });
    }

    function displayFeedbacks(feedbacks) {
        const feedbackContainer = document.getElementById('feedback-container');
        
        if (feedbacks.length === 0) {
            feedbackContainer.innerHTML = '<div class="no-feedback">Aucun feedback trouvé pour cette catégorie.</div>';
            updateStats(0, 0);
            return;
        }
        
        // Calculer les statistiques
        let totalRating = 0;
        feedbacks.forEach(feedback => {
            totalRating += parseInt(feedback.note);
        });
        const avgRating = (totalRating / feedbacks.length).toFixed(1);
        
        // Mettre à jour les statistiques
        updateStats(avgRating, feedbacks.length);
        
        // Vider le conteneur
        feedbackContainer.innerHTML = '';
        
        // Ajouter chaque feedback
        feedbacks.forEach(feedback => {
            const feedbackCard = document.createElement('div');
            feedbackCard.classList.add('feedback-card');
            
            // Formater la date
            const feedbackDate = new Date(feedback.date_creation);
            const formattedDate = feedbackDate.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Créer les étoiles pour la note
            const starsHtml = createStarsHtml(feedback.note);
            
            feedbackCard.innerHTML = `
                <div class="feedback-header">
                    <div class="feedback-user">${feedback.nom_utilisateur}</div>
                    <div class="feedback-date">${formattedDate}</div>
                </div>
                <div class="feedback-rating">
                    ${starsHtml} <span>(${feedback.note}/5)</span>
                </div>
                <div class="feedback-category">${feedback.categorie}</div>
                <div class="feedback-content">${feedback.contenu}</div>
            `;
            
            feedbackContainer.appendChild(feedbackCard);
        });
    }

    // Fonction pour mettre à jour les statistiques
    function updateStats(avgRating, totalCount) {
        document.querySelector('.avg-rating').textContent = avgRating;
        document.querySelector('.total-count').textContent = totalCount;
    }
    
    // Fonction pour créer l'HTML des étoiles
    function createStarsHtml(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          const src = i <= rating
            ? '..//images/star-on.png'
            : '..//images/star-off.png';
          starsHtml += `<img src="${src}" class="star-icon" alt="${i <= rating ? '★' : '☆'}">`;
        }
        return starsHtml;
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
            fetch(`${baseUrl}/feedback/soumettre`, {
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