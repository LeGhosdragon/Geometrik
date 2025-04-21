import Auth from './auth.js';

document.addEventListener('DOMContentLoaded', async function() {
    // const jeton = localStorage.getItem('jeton');
    // const username = localStorage.getItem('username');

    // Vérification de l'authentification
    if (!Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const avatarElement = document.getElementById('user-avatar');
    const usernameElement = document.getElementById('username');
    const memberSinceElement = document.getElementById('member-since');
    const rankingElement = document.getElementById('ranking');
    const rankingBadgeElement = document.getElementById('ranking-badge');
    const scoreElement = document.getElementById('user-score');
    const playTimeElement = document.getElementById('play-time');
    const userXpElement = document.getElementById('user-xp');
    const enemiesKilledElement = document.getElementById('enemies-killed');
    const historyTableBody = document.getElementById('history-table-body');
    const historyLoader = document.getElementById('history-loader');
    const errorMessage = document.getElementById('error-message');
    const navUsername = document.getElementById('nav-username');
    const playBtn = document.getElementById('play-btn');
    const btnDeconnexion = document.getElementById('btn-deconnexion-action');
    const logoutLink = document.getElementById('logout-link');
    const avatarUpload = document.getElementById('avatar-upload');

    //Initialisation de la page
    loadProfilePicture();
    const username = Auth.getUsername();
    if (username && navUsername) {
        navUsername.textContent = username;
    }

    // Événements
    avatarUpload.addEventListener('change', handleAvatarUpload);

    playBtn.addEventListener('click', function() {
        window.location.href = '../../Jeu/assets/pages/index.html';
    });

    btnDeconnexion.addEventListener('click', handleLogout);

    async function handleAvatarUpload(e){
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.match('image.*')) {
                Swal.fire({
                    title: 'Erreur',
                    text: 'Veuillez sélectionner une image valide',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
        
            // Vérifier la taille (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire({
                    title: 'Erreur',
                    text: 'L\'image ne doit pas dépasser 2MB',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
        
            // Envoyer l'image au serveur
            await uploadProfilePicture(file);
        }
    }

    function handleLogout(e){
        e.preventDefault();
        showAlert('Déconnexion', 'Vous êtes maintenant déconnecté', 'success')
            .then((result) => {
                if (result.isConfirmed) {
                    Auth.logout();
                    window.location.href = '../pages/index.html';
                }
            });
    }

    async function uploadProfilePicture(file) {
        if (!Auth.isAuthenticated()) return;
        
        const formData = new FormData();
        formData.append('jeton', Auth.getAccessToken());
        formData.append('image', file);
        
        // Afficher un indicateur de chargement
        Swal.fire({
            title: 'Chargement...',
            text: 'Envoi de votre photo de profil en cours',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try{
            const response = await Auth.authenticatedRequest('/utilisateur/profile-picture/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.reussite) {
                // Afficher la nouvelle image
                loadProfilePicture();
                showAlert('Succès', 'Votre photo de profil a été mise à jour', 'success');
            } else {
                throw new Error(data.erreurs || 'Erreur lors du téléchargement de la photo');
            }
        } catch (error){
            console.error('Erreur:', error);
            showAlert('Erreur', 'Une erreur est survenue lors de la mise à jour de votre photo de profil', 'error');
        }
    }

    // Fonction pour charger la photo de profil
    async function loadProfilePicture() {
        if (!Auth.isAuthenticated()) return;
        
        try{
            const response = await Auth.authenticatedRequest('/utilisateur/profile-picture');
            const data = await response.json();
            if (data.reussite) {
                if (data.photo_data) {
                    // Utiliser directement l'URI data pour afficher l'image
                    avatarElement.style.backgroundImage = `url(${data.photo_data})`;
                    avatarElement.textContent = '';
                } else {
                    // Aucune photo de profil
                    const username = Auth.getUsername();
                    if (username) {
                        avatarElement.textContent = username.charAt(0).toUpperCase();
                        avatarElement.style.backgroundImage = 'none';
                    } else {
                        avatarElement.textContent = '?';
                        avatarElement.style.backgroundImage = 'none';
                    }
                }
            }
        } catch (error){
            console.error('Erreur lors du chargement de la photo de profil:', error);
            // En cas d'erreur, afficher l'initiale par défaut
            const username = Auth.getUsername();
            if (username) {
                avatarElement.textContent = username.charAt(0).toUpperCase();
            } else {
                avatarElement.textContent = '?';
            }
            avatarElement.style.backgroundImage = 'none';
        }
    }

    async function loadUserData() {
        if (historyLoader) {
            historyLoader.style.display = 'block';
        }
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        try{
            const response = await Auth.authenticatedRequest('/utilisateur/profil');
            const data = await response.json();
            if (data.reussite) {
                // Afficher le nom d'utilisateur
                const username = data.utilisateur.nom_utilisateur;
                if(usernameElement) usernameElement.textContent = username;
                if(navUsername) navUsername.textContent = username;
                Auth.username = username;
                localStorage.setItem('username', username);
                
                // Initialiser l'avatar avec la première lettre
                if(avatarElement){ avatarElement.textContent = ''; }
                
                // Afficher la date d'inscription
                if(memberSinceElement) {
                    const joinDate = new Date(data.utilisateur.date_inscription);
                    memberSinceElement.textContent = formatDate(joinDate);
                }

                // Afficher le classement
                if (rankingElement && rankingBadgeElement) {
                    displayRanking(data.classement);
                }

                // Afficher les statistiques
                if (data.score) {
                    displayUserStats(data.score);
                    
                    // Afficher l'historique
                    if (historyTableBody) {
                        displayGameHistory(data.score);
                    }
                } else {
                    // Valeurs par défaut si aucun score n'est trouvé
                    resetUserStats();
                }

                
            } else {
                throw new Error(data.erreurs || 'Erreur lors du chargement des données');
            }
        } catch(error){
            console.error('Erreur:', error);
            if(errorMessage) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = error.message || 'Une erreur est survenue lors du chargement des données';
            }

            // Si l'erreur est liée à l'authentification, rediriger vers la page de connexion
            if (error.message === 'Utilisateur non authentifié' || error.message === 'JETON_INVALIDE') {
                Auth.logout();
                showAlert('Session expirée', 'Votre session a expiré. Veuillez vous reconnecter.', 'info')
                    .then(() => {
                        window.location.href = 'login.html';
                    });
            }
        } finally {
            if (historyLoader) {
                historyLoader.style.display = 'none';
            }
        }
           
    }

    function displayRanking(rank) {
        if (rank) {
            rankingElement.textContent = rank;
            
            // Ajouter un badge selon le classement
            if (rank === 1) {
                rankingBadgeElement.innerHTML = '<span class="badge top-badge">Champion 🏆</span>';
            } else if (rank <= 3) {
                rankingBadgeElement.innerHTML = '<span class="badge top-badge">Top 3 🥇</span>';
            } else if (rank <= 10) {
                rankingBadgeElement.innerHTML = '<span class="badge">Top 10 🏅</span>';
            } else {
                rankingBadgeElement.innerHTML = '<span class="badge">Classé #' + rank + '</span>';
            }
        } else {
            rankingElement.textContent = '-';
            rankingBadgeElement.innerHTML = '<span class="badge">Non classé</span>';
        }
    }

    function displayUserStats(score) {
        if (scoreElement) scoreElement.textContent = score.score;
        if (playTimeElement) playTimeElement.textContent = formatTime(score.temps_partie);
        if (userXpElement) userXpElement.textContent = score.experience;
        if (enemiesKilledElement) enemiesKilledElement.textContent = score.ennemis_enleve;
    }

    function resetUserStats() {
        if (scoreElement) scoreElement.textContent = '0';
        if (playTimeElement) playTimeElement.textContent = '0';
        if (userXpElement) userXpElement.textContent = '0';
        if (enemiesKilledElement) enemiesKilledElement.textContent = '0';
        
        if (historyTableBody) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">Aucune partie enregistrée</td>
                </tr>
            `;
        }
    }

    function displayGameHistory(latestScore) {
        const latestDate = new Date(latestScore.date_soumission);
        
        historyTableBody.innerHTML = `
            <tr>
                <td>${formatDate(latestDate)}</td>
                <td>${latestScore.score}</td>
                <td>${formatTime(latestScore.temps_partie)}</td>
                <td>${latestScore.experience}</td>
                <td>${latestScore.ennemis_enleve}</td>
            </tr>
        `;
    }


    /** Fonction qui formate un nombre de secondes en "Xh Ymin Zs" ou "Ymin Zs"
    * @param {number} totalSeconds 
    * @returns {string}
    */
    function formatTime(totalSeconds) {
        // Convertit en entier
        const secs = Math.floor(totalSeconds);
        const heures   = Math.floor(secs / 3600);
        const minutes  = Math.floor((secs % 3600) / 60);
        const secondes = secs % 60;
    
        if (heures > 0) {
        return `${heures}h ${minutes}m ${secondes}s`;
        }
        return `${minutes}m ${secondes}s`;
    }

    function formatDate(date) {
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        });
    }

    function showAlert(title, text, icon) {
        return Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonText: 'OK'
        });
    }
    
    // Modifier la fonction loadUserData pour inclure la gestion des photos
    const originalLoadUserData = loadUserData;
    
    // Réassigner la fonction avec notre propre implémentation
    loadUserData = function() {
        // Appeler la fonction originale
        originalLoadUserData();
        
        // Charger la photo de profil
        loadProfilePicture();
    }

    

    // Charger les données au chargement de la page
    if (historyLoader) {
        historyLoader.style.display = 'block';
    }
    await loadUserData();
});