import baseUrl from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    //Vérifier si l'utilisateur est connecté
    const jeton = localStorage.getItem('jeton');
    const username = localStorage.getItem('username');
    if (!jeton) {
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
    loadProfilePicture();

    // Événements
    avatarUpload.addEventListener('change', function(e) {
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
            uploadProfilePicture(file);
        }
    });
    


    playBtn.addEventListener('click', function() {
        window.location.href = '../../Jeu/assets/pages/index.html';
    });

    btnDeconnexion.addEventListener('click', function(e) {
        console.log('Déconnexion');
        e.preventDefault();
        // Ajout de SweetAlert2 pour confirmer la déconnexion
        Swal.fire({
        title: 'Déconnexion',
        text: 'Vous êtes maintenant déconnecté',
        icon: 'success',
        confirmButtonText: 'OK'
        }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('jeton');
            window.location.href = '../pages/index.html';
        }
        });
    });

    function uploadProfilePicture(file) {
        const jeton = localStorage.getItem('jeton');
        if (!jeton) {
            return;
        }
        
        const formData = new FormData();
        formData.append('jeton', jeton);
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
        
        fetch(`${baseUrl}/utilisateur/profile-picture/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.reussite) {
                // Afficher la nouvelle image
                loadProfilePicture();
                Swal.fire({
                    title: 'Succès',
                    text: 'Votre photo de profil a été mise à jour',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                throw new Error(data.erreurs || 'Erreur lors du téléchargement de la photo');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            Swal.fire({
                title: 'Erreur',
                text: 'Une erreur est survenue lors de la mise à jour de votre photo de profil',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    }

    // Fonction pour charger la photo de profil
    function loadProfilePicture() {
        const jeton = localStorage.getItem('jeton');
        if (!jeton) {
            return;
        }
        
        fetch(`${baseUrl}/utilisateur/profile-picture?jeton=${jeton}`)
            .then(response => response.json())
            .then(data => {
                if (data.reussite) {
                    if (data.photo_data) {
                        // Utiliser directement l'URI data pour afficher l'image
                        avatarElement.style.backgroundImage = `url(${data.photo_data})`;
                        avatarElement.textContent = '';
                    } else {
                        // Aucune photo de profil
                        const username = localStorage.getItem('username');
                        if (username) {
                            avatarElement.textContent = username.charAt(0).toUpperCase();
                            avatarElement.style.backgroundImage = 'none';
                        } else {
                            avatarElement.textContent = '?';
                            avatarElement.style.backgroundImage = 'none';
                        }
                    }
                } else if (data.erreurs === 'JETON_INVALIDE') {
                    // Jeton expiré, rediriger vers la page de connexion
                    localStorage.removeItem('jeton');
                    localStorage.removeItem('username');
                    Swal.fire({
                        title: 'Session expirée',
                        text: 'Votre session a expiré. Veuillez vous reconnecter.',
                        icon: 'info',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        window.location.href = 'login.html';
                    });
                    return;
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                // En cas d'erreur, afficher l'initiale par défaut
                const username = localStorage.getItem('username');
                if (username) {
                    avatarElement.textContent = '';
                } else {
                    avatarElement.textContent = '?';
                }
                avatarElement.style.backgroundImage = 'none';
            });
    }

    /**
    * Formate un nombre de secondes en "Xh Ymin Zs" ou "Ymin Zs"
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
    
    // Modifier la fonction loadUserData pour inclure la gestion des photos
    const originalLoadUserData = loadUserData;
    
    // Réassigner la fonction avec notre propre implémentation
    loadUserData = function() {
        // Appeler la fonction originale
        originalLoadUserData();
        
        // Charger la photo de profil
        loadProfilePicture();
    }

    function loadUserData() {
        historyLoader.style.display = 'block';
        errorMessage.style.display = 'none';
        
        // Récupérer le jeton de l'utilisateur
        const jeton = localStorage.getItem('jeton');
        
        // Récupérer les données de l'utilisateur depuis l'API
        fetch(`${baseUrl}/utilisateur/profil?jeton=${jeton}`)
            .then(response => response.json())
            .then(data => {
                if (data.reussite) {
                    // Afficher le nom d'utilisateur
                    const username = data.utilisateur.nom_utilisateur;
                    usernameElement.textContent = username;
                    navUsername.textContent = username;
                    localStorage.setItem('username', username);
                    
                    // Initialiser l'avatar avec la première lettre
                    avatarElement.textContent = '';
                    
                    // Afficher la date d'inscription
                    const joinDate = new Date(data.utilisateur.date_inscription);
                    memberSinceElement.textContent = formatDate(joinDate);

                    console.log(data);

                    // Afficher le classement
                    if (data.classement) {
                        rankingElement.textContent = data.classement;
                        
                        // Ajouter un badge selon le classement
                        if (data.classement === 1) {
                            rankingBadgeElement.innerHTML = '<span class="badge top-badge">Champion 🏆</span>';
                        } else if (data.classement <= 3) {
                            rankingBadgeElement.innerHTML = '<span class="badge top-badge">Top 3 🥇</span>';
                        } else if (data.classement <= 10) {
                            rankingBadgeElement.innerHTML = '<span class="badge">Top 10 🏅</span>';
                        }
                    } else {
                        rankingElement.textContent = '-';
                        rankingBadgeElement.innerHTML = '<span class="badge">Non classé</span>';
                    }
                    
                    // Afficher les statistiques
                    if (data.score) {
                        scoreElement.textContent = data.score.score;
                        playTimeElement.textContent = formatTime(data.score.temps_partie);
                        userXpElement.textContent = data.score.experience;
                        enemiesKilledElement.textContent = data.score.ennemis_enleve;
                        
                        // Afficher l'historique
                        displayGameHistory(data.score);
                    } else {
                        // Valeurs par défaut si aucun score n'est trouvé
                        scoreElement.textContent = '0';
                        playTimeElement.textContent = '0';
                        userXpElement.textContent = '0';
                        enemiesKilledElement.textContent = '0';
                        
                        historyTableBody.innerHTML = `
                            <tr>
                                <td colspan="5" style="text-align: center;">Aucune partie enregistrée</td>
                            </tr>
                        `;
                    }
                } else {
                    throw new Error(data.erreurs || 'Erreur lors du chargement des données');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                errorMessage.style.display = 'block';
                errorMessage.textContent = error.message || 'Une erreur est survenue lors du chargement des données';
            })
            .finally(() => {
                historyLoader.style.display = 'none';
            });
    }

    function processRankingData(palmares, username) {
        let userRank = 0;
        
        for (let i = 0; i < palmares.length; i++) {
            if (palmares[i].nom_utilisateur === username) {
                userRank = i + 1;
                break;
            }
        }

        // Afficher le classement
        if (userRank > 0) {
            rankingElement.textContent = userRank;
            
            // Ajouter un badge selon le classement
            if (userRank === 1) {
                rankingBadgeElement.innerHTML = '<span class="badge top-badge">Champion 🏆</span>';
            } else if (userRank <= 3) {
                rankingBadgeElement.innerHTML = '<span class="badge top-badge">Top 3 🥇</span>';
            } else if (userRank <= 10) {
                rankingBadgeElement.innerHTML = '<span class="badge">Top 10 🏅</span>';
            }
        } else {
            rankingElement.textContent = '-';
            rankingBadgeElement.innerHTML = '<span class="badge">Non classé</span>';
        }
    }

    function findAndDisplayUserScore(palmares, username) {
        let userScore = null;
        
        for (const score of palmares) {
            if (score.nom_utilisateur === username) {
                userScore = score;
                break;
            }
        }

        if (userScore) {
            // Afficher les statistiques de l'utilisateur
            scoreElement.textContent = userScore.score;
            playTimeElement.textContent = (userScore.temps_partie).toFixed(1);
            userXpElement.textContent = userScore.experience;
            enemiesKilledElement.textContent = userScore.ennemis_enleve;

            // Simuler un historique des parties
            displayGameHistory(userScore);
        } else {

            scoreElement.textContent = '0';
            playTimeElement.textContent = '0';
            userXpElement.textContent = '0';
            enemiesKilledElement.textContent = '0';
            
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

    function formatDate(date) {
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        });
    }

    // Charger les données au chargement de la page
    historyLoader.style.display = 'block';
    loadUserData();
});