import Auth from './auth.js';
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

    // Si pas de jeton d'accès, désactiver le formulaire et inviter à se connecter
    if(!Auth.getAccessToken()){
        feedbackForm.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
        const msg = document.createElement('div');
        msg.classList.add('feedback-login-required');
        msg.innerHTML = '<p>Veuillez <a href="login.html"><u>vous connecter</u></a> pour laisser un feedback.</p>';
        feedbackForm.prepend(msg);
    } else {
        // Sinon, vérifier si l'utilisateur est admin
        checkAdminStatus();
    }

    /**  Vérifie si l'utilisateur est admin et affiche le panneau admin si c'est le cas
     * 
     */ 
    async function checkAdminStatus() {
        try {
            // Appel GET avec jeton pour vérifier le rôle
            const response = await fetch(`${baseUrl}/utilisateur/estAdmin?jeton=${encodeURIComponent(Auth.getAccessToken())}`);
            const data = await response.json();

            // Si l'utilisateur est admin, afficher le panneau admin
            if(data.reussite && data.estAdmin){
                isAdmin = true;
                showAdminPanel();
            }
        } catch (err) {
            console.error('Erreur vérification admin:', err);
        }
    }
    
    /** Affiche le panneau d'administration et configure le filtrage
     * 
     */
    function showAdminPanel(){
        adminPanel.style.display = 'block';
        feedbackHeader.style.display = 'none';
        feedbackForm.style.display = 'none';

        // Charger tous les feedbacks par défaut
        loadFeedbacks();

        // Boutons de filtrage par catégorie
        adminCategories.forEach(category =>{
            category.addEventListener('click', function(){
                adminCategories.forEach(c => c.classList.remove('active'));
                this.classList.add('active');

                const selectedAdminCategory = this.dataset.category;
                loadFeedbacks(selectedAdminCategory === 'all' ? null : selectedAdminCategory);
            });
        });
    }

    /** Charge et affiche les feedbacks du serveur, options de filtre
     * 
     * @param {string|null} category - nom de la catégorie à filtrer, ou null pour toutes
     */
    function loadFeedbacks(category = null){
        const feedbackContainer = document.getElementById('feedback-container');
        feedbackContainer.innerHTML = '<div class="loading">Chargement des feedbacks...</div>';

        // Construction de l'URL avec jeton et catégorie optionnelle
        let url = `${baseUrl}/feedback/liste?jeton=${encodeURIComponent(Auth.getAccessToken())}`;
        if (category) {
            url += `&categorie=${encodeURIComponent(category)}`;
        }
        
        // Appel pour récupérer les données
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

    /** Génère et insère les cartes de feedback dans le DOM
     * 
     * @param {Array} feedbacks - liste d'objets feedback à afficher
     */
    function displayFeedbacks(feedbacks) {
        const feedbackContainer = document.getElementById('feedback-container');
        
        // Si aucune donnée, afficher message et stats à zéro
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

    /** Met à jour la note moyenne affichée et le nombre total de feedbacks
     * 
     */
    function updateStats(avgRating, totalCount) {
        document.querySelector('.avg-rating').textContent = avgRating;
        document.querySelector('.total-count').textContent = totalCount;
    }
    
    /** Transforme une note numérique en HTML d'étoiles pleines et vides
     * 
     * @param {number} rating - note de 1 à 5
     * @returns {string} HTML contenant les balises <img> pour les étoiles
     */
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
    
    /** Gestion de la sélection de catégorie par l'utilisateur
     * 
    */
    categoryBadges.forEach(badge => {
        badge.addEventListener('click', function() {
            categoryBadges.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedCategory = this.dataset.category;
        });
    });
    
    /**  Compteur de caractères pour le textarea
    * 
    */ 
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
    
    /** Gère la soumission du formulaire de feedback via l'API
     * 
     */
    feedbackForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        // Vérification si l'utilisateur est connecté
        if (!Auth.getAccessToken()) {
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
            try{
                // Envoi du feedback au serveur
                const formData = new FormData();
                formData.append('jeton', Auth.getAccessToken());
                formData.append('contenu', feedback);
                formData.append('note', rating);
                formData.append('categorie', selectedCategory);

                const response = await fetch(`${baseUrl}/feedback/soumettre`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

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
                    if (charCount) { charCount.textContent = "0"; }
                } else {
                    handleFeedbackError(data.erreurs);
                }
            } catch (error){
                console.error('Erreur:', error);
                Swal.fire({
                    icon: "error",
                    title: "Erreur de connexion",
                    text: "Impossible de contacter le serveur",
                });
            }
        }
    });

    /** Affiche un message d'erreur adapté selon le code renvoyé par l'API
     * 
     * @param {string} errorCode - code d'erreur retourné
     */
    function handleFeedbackError(errorCode) {
        let errorMessage = "Une erreur est survenue";
        
        switch(errorCode) {
            case 'JETON_INVALIDE':
                errorMessage = "Votre session a expiré, veuillez vous reconnecter";
                Auth.logout(); // Déconnexion si le jeton est invalide
                break;
            case 'CONTENU_VIDE':
                errorMessage = "Le contenu ne peut pas être vide";
                break;
            case 'NOTE_INVALIDE':
                errorMessage = "La note doit être entre 1 et 5";
                break;
            case 'CATEGORIE_INVALIDE':
                errorMessage = "Catégorie invalide";
                break;
            case 'ADMIN_FEEDBACK_ERREUR':
                errorMessage = "Les administrateurs ne peuvent pas soumettre de feedback";
                break;
            default:
                errorMessage = errorCode || "Une erreur inconnue est survenue";
        }
        
        Swal.fire({
            icon: "error",
            title: "Erreur",
            text: errorMessage,
        });
    }
});



