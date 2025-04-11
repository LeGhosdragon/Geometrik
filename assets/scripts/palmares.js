import baseUrl from './config.js';

document.addEventListener("DOMContentLoaded", function() {
    // Constante pour le jeton
    const jeton = localStorage.getItem('jeton');

    // Variable pour savoir si l'utilisateur est un admin
    let estAdmin = false;

    // Variable pour savoir si le tri est ascendant
    let isSortAscending = false;

    // Tableau pour stocker le palmares actuel
    let currentPalmares = [];

    // Variable pour stocker la colonne actuelle
    let currentSortColumn = null; 

    // Crée un élément script pour le GSAP
    const gsapScript = document.createElement('script');

    // Définit le chemin du script GSAP
    gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    // Ajoute le script GSAP au head du document
    document.head.appendChild(gsapScript);

    // Charge le script GSAP
    gsapScript.onload = function() {
        initAnimations();
    };

    // Fonction pour initialiser les animations
    function initAnimations() {
        // Animation pour le titre
        gsap.from("h1", {
            duration: 1,
            y: -50,
            opacity: 0,
            ease: "power3.out"
        });

        // Animation pour le conteneur du palmares
        gsap.from("#palmares-container", {
            duration: 1.2,
            y: 30,
            opacity: 0,
            delay: 0.3,
            ease: "power2.out"
        });
    }

     /**
      * Cette fonction permet de créer la barre de recherche
      */
     function createSearchBar() {
        // Crée un élément div pour la barre de recherche
        const searchContainer = document.createElement('div');

        // Ajoute la classe search-container a la barre de recherche
        searchContainer.className = 'search-container';

        // Crée un élément input pour la barre de recherche
        const searchInput = document.createElement('input');

        // Définit le type de l'input
        searchInput.type = 'text';

        // Définit l'id de l'input
        searchInput.id = 'player-search';

        // Définit le placeholder de l'input
        searchInput.placeholder = 'Rechercher un joueur...';

        // Ajoute la classe player-search-input a l'input
        searchInput.className = 'player-search-input';

        // Ajoute un écouteur de changement sur l'input
        searchInput.addEventListener('input', function() {
            // Filtre le palmares en fonction de la requete de recherche
            filterPalmares(this.value);
        });

        // Crée un élément span pour l'icône de recherche
        const searchIcon = document.createElement('span');

        // Ajoute la classe search-icon a l'icône de recherche
        searchIcon.className = 'search-icon';

        // Ajoute l'icône de recherche a l'élément span
        searchIcon.innerHTML = '🔍';

        // Ajoute l'élément span et l'input a la barre de recherche
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);

        // Insère la barre de recherche avant le conteneur du palmares
        const palmaresContainer = document.querySelector('.palmares-container');
        palmaresContainer.insertBefore(searchContainer, document.getElementById('palmares-container'));
        
        // Animation pour la barre de recherche
        if (window.gsap) {
            gsap.from(searchContainer, {
                duration: 0.8,
                y: -20,
                opacity: 0,
                delay: 0.5,
                ease: "power2.out"
            });
        }
    }

    /**
     * Cette fonction permet de filtrer le palmares en fonction de la requete de recherche
     * @param {*} query la requete de recherche
     */
    function filterPalmares(query) {
        // Si aucune requete, afficher tous les scores
        if (!query) {
            displayPalmares(currentPalmares, estAdmin);
            return;
        }
        // Convertir la requete en minuscule
        const lowerCaseQuery = query.toLowerCase();

        // Filtrer le palmares en fonction de la requete
        const filteredPalmares = currentPalmares.filter(score => 
            score.nom_utilisateur.toLowerCase().includes(lowerCaseQuery)
        );

        // Afficher le palmares filtré
        displayPalmares(filteredPalmares, estAdmin);
        
        // Souligner les noms des joueurs qui correspondent a la requete
        const playerCells = document.querySelectorAll('.palmares-table tbody td:nth-child(2)');

        // Parcourir les cellules des joueurs
        playerCells.forEach(cell => {

            // Récupérer le nom du joueur
            const name = cell.textContent;

            // Si le nom du joueur correspond a la requete
            if (name.toLowerCase().includes(lowerCaseQuery)) {

                // Sousligne le texte qui correspond a la requete
                const highlightedText = name.replace(
                    new RegExp(`(${query})`, 'gi'),
                    '<span class="highlight">$1</span>'
                );
                
                // Remplacer le texte de la cellule par le texte souligné
                cell.innerHTML = highlightedText;
                
                // Animation du soulignement
                if (window.gsap) {
                    gsap.fromTo('.highlight', 
                        { backgroundColor: 'var(--accent)' },
                        { backgroundColor: 'rgba(var(--accent-rgb), 0.3)', duration: 1.5, repeat: -1, yoyo: true }
                    );
                }
            }
        });
    }

    /**
     * Cette fonction permet de charger le palmares
     */
    function chargerPalmares(){

        // Affiche l'animation de chargement avec GSAP si disponible
        const loadingEl = document.querySelector('.loading');

        // Si GSAP et l'animation de chargement sont disponibles
        if (window.gsap && loadingEl) {
            // Animation pour l'animation de chargement
            gsap.to(loadingEl, {
                opacity: 0.7,
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }

        // Récupère les scores
        fetch(`${baseUrl}/palmares/obtenir`)
        // Convertir la réponse en JSON

        .then(response => response.json())
        // Si la réponse est une réussite
        .then(data => {
            if (data.reussite) {

                // Stocke les données originales
                currentPalmares = data.palmares;

                // Affiche le palmares
                displayPalmares(currentPalmares, estAdmin);

                // Ajoute la barre de recherche après les données sont chargées
                createSearchBar();
            } else {
                // Affiche une erreur
                displayError("Erreur lors de la récupération des données.");
            }
        })
        // Si une erreur survient
        .catch(error => {
            // Affiche une erreur
            console.error('Erreur:', error);
            // Affiche une erreur
            displayError("Erreur de connexion au serveur.");
        });    
    }

    /**
     * Cette fonction permet de vérifier si l'utilisateur est un admin
     */
    if (jeton) {
        // Récupère les données de l'utilisateur
        fetch(`${baseUrl}/utilisateur/estAdmin?jeton=${jeton}`)
            // Convertir la réponse en JSON
            .then(response => response.json())
            .then(data => {
                // Si la réponse est une réussite
                if (data.reussite) {
                    // Stocke si l'utilisateur est un admin
                    estAdmin = data.estAdmin;
                }
                // Charge le palmares
                chargerPalmares();
            })
            .catch(error => {
                // Affiche une erreur
                console.error('Erreur vérification admin:', error);
                // Charge le palmares
                chargerPalmares();
            });
    } else {
        // Charge le palmares
        chargerPalmares();
    }
    
    /**
     * Cette fonction permet de trier le palmares
     * @param {*} column la colonne a trier
     */
    function sortPalmares(column) {
        // Si la colonne actuelle est la même que la colonne a trier
        if (currentSortColumn === column) {
            // Inverse le sens du tri
            isSortAscending = !isSortAscending;
        } else {
            // Stocke la colonne a trier
            currentSortColumn = column;
            // Par default il est descendant
            isSortAscending = false;
        }

        // Ici on fait la logique du tri le [...currentPalmares] sert a faire une copie du tableau original
        const sortedPalmares = [...currentPalmares].sort((a, b) => {
            // Définit les valeurs a trier
            let valueA, valueB;

            switch(column) {
                case 'score':
                    // Définit les scores
                    valueA = a.score;
                    valueB = b.score;
                    break;
                case 'temps_partie':
                    // Définit les temps de partie
                    valueA = a.temps_partie;
                    valueB = b.temps_partie;
                    break;
                case 'experience':
                    // Définit les experiences
                    valueA = a.experience;
                    valueB = b.experience;
                    break;
                case 'ennemis_enleve':
                    // Définit les ennemis enlevés
                    valueA = a.ennemis_enleve;
                    valueB = b.ennemis_enleve;
                    break;
                case 'date_soumission':
                    // Définit les dates de soumission
                    valueA = new Date(a.date_soumission);
                    valueB = new Date(b.date_soumission);
                    break;
                default:
                    return 0;
            }

            //On compare les valeurs
            if (valueA < valueB) return isSortAscending ? -1 : 1;
            if (valueA > valueB) return isSortAscending ? 1 : -1;
            return 0;
        });

        displayPalmares(sortedPalmares, estAdmin);

        // Animation du tri
        if (window.gsap) {
            gsap.fromTo(`.sort-${column}`,
                { rotation: 0 },
                { rotation: isSortAscending ? 180 : 0, duration: 0.3 }
            );
        }
    }

    /**
     * Cette fonction affiche les palmares
     * @param {*} palmares le palmares
     * @param {*} estAdmin si l'utilisateur est un admin
     */
    function displayPalmares(palmares, estAdmin) {
        // Récupère le conteneur du palmares
        const container = document.getElementById('palmares-container');
        // Vide le conteneur du palmares
        container.innerHTML = '';
        // Si le palmares est vide ou n'a pas de scores
        if (!palmares || palmares.length === 0) {
            // Crée un message vide
            const emptyMessage = document.createElement('div');
            // Ajoute la classe empty-message
            emptyMessage.className = 'empty-message';
            // Ajoute le texte du message
            emptyMessage.textContent = "Aucun score n'a encore été enregistré. Soyez le premier à jouer !";
            // Ajoute le message au conteneur
            container.appendChild(emptyMessage);
            // Animation de l'affichage du message
            if (window.gsap) {
                gsap.from(emptyMessage, {
                    duration: 0.8,
                    y: 20,
                    opacity: 0,
                    ease: "back.out(1.7)"
                });
            }
            return;
        }
        // Crée une table
        const table = document.createElement('table');
        // Ajoute la classe palmares-table
        table.className = 'palmares-table';
        // Crée un élément thead
        const thead = document.createElement('thead');
        // Crée une ligne d'en-tête
        const headerRow = document.createElement('tr');
        
        //Les en tetes est un tableau d'objets qui represente un entete
        //Le text represente le texte de l'entete, le sortable represente si l'entete est triable
        //Le key represente la clef de l'objet score qui sera utilise pour le tri
        const headers = [
            {text: "Rang", sortable: false},
            {text: "Joueur", sortable: false},
            {text: "Score", sortable: true, key: 'score'},
            {text: "Temps (s)", sortable: true, key: 'temps_partie'},
            {text: "Expérience", sortable: true, key: 'experience'},
            {text: "Ennemis éliminés", sortable: true, key: 'ennemis_enleve'},
            {text: "Date", sortable: true, key: 'date_soumission'}
        ];
        // Si l'utilisateur est un admin
        if (estAdmin) {
            headers.push({text: "Actions", sortable: false});
        }
        
        // Parcourt les en-têtes
        headers.forEach(header => {
            // Crée un élément th
            const th = document.createElement('th');
            // Ajoute le texte de l'en-tête
            th.textContent = header.text;
            
            // On ajoute la fonctionnalite du sort sur les en-tetes
            if (header.sortable) {
                // Ajoute le curseur de la souris
                th.style.cursor = 'pointer';
                // Ajoute un écouteur de clic sur l'en-tête
                th.addEventListener('click', () => sortPalmares(header.key));
                
                // Crée un élément span pour l'indicateur de tri
                const sortIndicator = document.createElement('span');
                // Ajoute la classe sort-indicator
                sortIndicator.className = `sort-indicator sort-${header.key}`;
                // Ajoute l'indicateur de tri
                sortIndicator.innerHTML = currentSortColumn === header.key ? 
                    (isSortAscending ? ' ▲' : ' ▼') : ' ↕️';
                // Ajoute l'indicateur de tri
                th.appendChild(sortIndicator);
            }
            // Ajoute l'en-tête à la ligne d'en-tête
            headerRow.appendChild(th);
        });

        // Ajoute la ligne d'en-tête à la table
        thead.appendChild(headerRow);

        // Ajoute la table à la table
        table.appendChild(thead);

        // Crée un élément tbody
        const tbody = document.createElement('tbody');

        // Parcourt les scores
        palmares.forEach((score, id) => {
            // Crée une ligne
            const row = document.createElement('tr');
            // Ajoute l'id du score
            row.dataset.scoreId = score.id;
            
            // Celulle Rang
            const rankCell = document.createElement('td');
            rankCell.textContent = (id + 1);
            row.appendChild(rankCell);
            
            // Cellule joueur
            const nameCell = document.createElement('td');
            nameCell.textContent = score.nom_utilisateur;
            row.appendChild(nameCell);
            
            // Cellule score
            const scoreCell = document.createElement('td');
            scoreCell.textContent = score.score;
            row.appendChild(scoreCell);
            
            // Cellule temps
            const timeCell = document.createElement('td');
            timeCell.textContent = score.temps_partie;
            row.appendChild(timeCell);
            
            // Cellule experience
            const expCell = document.createElement('td');
            expCell.textContent = score.experience;
            row.appendChild(expCell);
            
            // Cellule ennemies enlevés
            const enemiesCell = document.createElement('td');
            enemiesCell.textContent = score.ennemis_enleve;
            row.appendChild(enemiesCell);
            
            // Cellule temps de soumission
            const dateCell = document.createElement('td');
            const submissionDate = new Date(score.date_soumission);
            dateCell.textContent = submissionDate.toLocaleString();
            row.appendChild(dateCell);

            // Cellule pour supprimer si l'utilisateur est un admin
            if(estAdmin){
                const actionsCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Supprimer";
                deleteButton.className = "delete-score-btn";
                deleteButton.addEventListener('click', function(){
                    supprimerScore(score.id || id+1);
                });
                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);
            }
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
                // Animation de la table avec GSAP
                if (window.gsap) {
                    gsap.from('thead', {
                        duration: 0.7,
                        y: -20,
                        opacity: 0,
                        ease: "power2.out"
                    });
                    
                    gsap.from('tbody tr', {
                        duration: 0.5,
                        y: 30,
                        opacity: 0,
                        stagger: 0.05,
                        ease: "power1.out"
                    });
                    
                    // Add hover animations for rows
                    const rows = document.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        row.addEventListener('mouseenter', () => {
                            gsap.to(row, {
                                backgroundColor: 'rgba(0, 153, 255, 0.2)',
                                duration: 0.3
                            });
                        });
                        
                        row.addEventListener('mouseleave', () => {
                            // Restore original background based on row position
                            const index = Array.from(row.parentNode.children).indexOf(row);
                            let color;
                            
                            if (index === 0) {
                                color = '#d4af37'; // Gold
                            } else if (index === 1) {
                                color = '#c0c0c0'; // Silver
                            } else if (index === 2) {
                                color = '#cd7f32'; // Bronze
                            } else if (index % 2 === 0) {
                                color = 'var(--dark-background)';
                            } else {
                                color = '#1a1a1ab3';
                            }
                            
                            gsap.to(row, {
                                backgroundColor: color,
                                duration: 0.3
                            });
                        });
                    });
                }
    }

});

/**
 * Cette fonction permet l'administeur de supprimer un score
 * @param {*} scoreId 
 * @returns 
 */
function supprimerScore(scoreId) {
    // Récupère le jeton
    const jeton = localStorage.getItem('jeton');
    // Si le jeton n'existe pas
    if (!jeton) {
        // Affiche une erreur
        displayError("Vous devez être connecté pour effectuer cette action.");
        return;
    }
    // Si l'utilisateur n'est pas sûr de vouloir supprimer le score
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce score ?")) {
        return;
    }
    // Ajoute une animation pour la suppression de la ligne
    if (window.gsap) {
        // Récupère la ligne
        const row = document.querySelector(`tr[data-score-id="${scoreId}"]`);
        // Si la ligne existe
        if (row) {
            gsap.to(row, {
                opacity: 0,
                height: 0,
                duration: 0.3,
                onComplete: () => {
                    sendDeleteRequest(scoreId, jeton);
                }
            });
        } else {
            // Envoie la requête de suppression
            sendDeleteRequest(scoreId, jeton);
        }
    } else {
        // Envoie la requête de suppression
        sendDeleteRequest(scoreId, jeton);
    }
}

/**
 * Cette fonction envoie la requête de suppression
 * @param {*} scoreId l'id du score
 * @param {*} jeton le jeton
 */
function sendDeleteRequest(scoreId, jeton) {
    // Envoie la requête de suppression
    fetch(`${baseUrl}/palmares/supprimer/${scoreId}?jeton=${jeton}`, {
        method: 'DELETE'
    })
    // Convertir la réponse en JSON
    .then(response => response.json())
    // Si la réponse est une réussite
    .then(data => {
        if (data.reussite) {
            // Affiche une notification
            showNotification("Score supprimé avec succès.", "success");
            // Actualise la page
            setTimeout(() => location.reload(), 1000);
        } else {
            // Affiche une notification
            showNotification(`Erreur: ${data.erreurs}`, "error");
        }
    })
    // Si une erreur survient
    .catch(error => {
        // Affiche une erreur
        console.error('Erreur:', error);
        // Affiche une notification
        showNotification("Une erreur est survenue lors de la suppression du score.", "error");
    });
}

/**
 * Fonction qui affiche un message d'erreur s'il n'y a pas de score
 * @param {*} message 
 */
function displayError(message) {
    const container = document.getElementById('palmares-container');
    container.innerHTML = `<div class="error-message">${message}</div>`;
    // Animate error message
    if (window.gsap) {
        gsap.from('.error-message', {
            duration: 0.5,
            scale: 0.9,
            opacity: 0,
            ease: "power2.out"
        });
    }
}

/**
 * Montre notification
 * @param {string} message message de notification
 * @param {string} type type de notification (success or error)
 */
function showNotification(message, type) {
    // Creer l'element de notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animation de la notification
    if (window.gsap) {
        gsap.fromTo(notification, 
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
        );
        
        // Auto remove apres 3 secondes
        setTimeout(() => {
            gsap.to(notification, {
                x: 100,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    notification.remove();
                }
            });
        }, 3000);
    } else {
        // Fallback pour quand GSAP n'est pas disponible
        setTimeout(() => notification.remove(), 3000);
    }
}

