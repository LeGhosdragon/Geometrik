document.addEventListener("DOMContentLoaded", function() {
    const jeton = localStorage.getItem('jeton');
    let estAdmin = false;
    let isSortAscending = false;
    let currentPalmares = [];
    let currentSortColumn = null;
    
    const gsapScript = document.createElement('script');
    gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    document.head.appendChild(gsapScript);

    gsapScript.onload = function() {
        initAnimations();
    };

    function initAnimations() {
        // Animate the heading
        gsap.from("h1", {
            duration: 1,
            y: -50,
            opacity: 0,
            ease: "power3.out"
        });

        // Animate the leaderboard container
        gsap.from("#palmares-container", {
            duration: 1.2,
            y: 30,
            opacity: 0,
            delay: 0.3,
            ease: "power2.out"
        });
    }

     // Creer la barre de recherche
     function createSearchBar() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'player-search';
        searchInput.placeholder = 'Rechercher un joueur...';
        searchInput.className = 'player-search-input';
        
        searchInput.addEventListener('input', function() {
            filterPalmares(this.value);
        });
        
        const searchIcon = document.createElement('span');
        searchIcon.className = 'search-icon';
        searchIcon.innerHTML = '🔍';
        
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);
        
        // Insert before the palmares container
        const palmaresContainer = document.querySelector('.palmares-container');
        palmaresContainer.insertBefore(searchContainer, document.getElementById('palmares-container'));
        
        // Animate the search bar appearance
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

    // Filtrer le palmares en fonction de la requete de recherche
    function filterPalmares(query) {
        if (!query) {
            // Si aucune requete, afficher tous les scores
            displayPalmares(currentPalmares, estAdmin);
            return;
        }
        
        const lowerCaseQuery = query.toLowerCase();
        const filteredPalmares = currentPalmares.filter(score => 
            score.nom_utilisateur.toLowerCase().includes(lowerCaseQuery)
        );
        
        displayPalmares(filteredPalmares, estAdmin);
        
        // Souligner les noms des joueurs qui correspondent a la requete
        const playerCells = document.querySelectorAll('.palmares-table tbody td:nth-child(2)');
        playerCells.forEach(cell => {
            const name = cell.textContent;
            if (name.toLowerCase().includes(lowerCaseQuery)) {
                // Sousligne le texte qui correspond a la requete
                const highlightedText = name.replace(
                    new RegExp(`(${query})`, 'gi'),
                    '<span class="highlight">$1</span>'
                );
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

    function chargerPalmares(){
        // Show loading animation with GSAP if available
        const loadingEl = document.querySelector('.loading');
        if (window.gsap && loadingEl) {
            gsap.to(loadingEl, {
                opacity: 0.7,
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }
        
        fetch('http://localhost/H2025_TCH099_02_S1/api/api.php/palmares/obtenir')
        .then(response => response.json())
        .then(data => {
            if (data.reussite) {
                currentPalmares = data.palmares; // Store original data
                displayPalmares(currentPalmares, estAdmin);
                createSearchBar(); // Add search bar after data is loaded
            } else {
                displayError("Erreur lors de la récupération des données.");
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            displayError("Erreur de connexion au serveur.");
        });    
    }

    if (jeton) {
        fetch(`http://localhost/H2025_TCH099_02_S1/api/api.php/utilisateur/estAdmin?jeton=${jeton}`)
            .then(response => response.json())
            .then(data => {
                if (data.reussite) {
                    estAdmin = data.estAdmin;
                }
                chargerPalmares();
            })
            .catch(error => {
                console.error('Erreur vérification admin:', error);
                chargerPalmares();
            });
    } else {
        chargerPalmares();
    }
    
    // Function qui sert a trier le palmares et qui prend la colomne en parametre
    function sortPalmares(column) {
        if (currentSortColumn === column) {
            isSortAscending = !isSortAscending;
        } else {
            currentSortColumn = column;
            isSortAscending = false; // Par default il est descendant
        }

        // Ici on fait la logique du tri le [...currentPalmares] sert a faire une copie du tableau original
        const sortedPalmares = [...currentPalmares].sort((a, b) => {
            let valueA, valueB;

            switch(column) {
                case 'score':
                    valueA = a.score;
                    valueB = b.score;
                    break;
                case 'temps_partie':
                    valueA = a.temps_partie;
                    valueB = b.temps_partie;
                    break;
                case 'experience':
                    valueA = a.experience;
                    valueB = b.experience;
                    break;
                case 'ennemis_enleve':
                    valueA = a.ennemis_enleve;
                    valueB = b.ennemis_enleve;
                    break;
                case 'date_soumission':
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

    // Cette fonction affiche les palmares et prend en parametre le palmares et si l'utilisateur est un admin
    function displayPalmares(palmares, estAdmin) {
        const container = document.getElementById('palmares-container');
        
        container.innerHTML = '';
        
        if (!palmares || palmares.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = "Aucun score n'a encore été enregistré. Soyez le premier à jouer !";
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
        
        const table = document.createElement('table');
        table.className = 'palmares-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        //Les en tetes est un tableau d'objets qui represente un entete
        //Le text represente le texte de l'entete, le sortable represente si l'entete est triable
        //Le key represente la clef de l'objet score qui sera utilise pour le tri
        const headers = [
            {text: "Rang", sortable: false},
            {text: "Joueur", sortable: false},
            {text: "Score", sortable: true, key: 'score'},
            {text: "Temps (ms)", sortable: true, key: 'temps_partie'},
            {text: "Expérience", sortable: true, key: 'experience'},
            {text: "Ennemis éliminés", sortable: true, key: 'ennemis_enleve'},
            {text: "Date", sortable: true, key: 'date_soumission'}
        ];

        if (estAdmin) {
            headers.push({text: "Actions", sortable: false});
        }
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.text;
            
            // On ajoute la fonctionnalite du sort sur les en-tetes
            if (header.sortable) {
                th.style.cursor = 'pointer';
                th.addEventListener('click', () => sortPalmares(header.key));
                
               // Visual indicator for sorting
               const sortIndicator = document.createElement('span');
               sortIndicator.className = `sort-indicator sort-${header.key}`;
               sortIndicator.innerHTML = currentSortColumn === header.key ? 
                (isSortAscending ? ' ▲' : ' ▼') : ' ↕️';
               th.appendChild(sortIndicator);
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        palmares.forEach((score, id) => {
            const row = document.createElement('tr');
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
function supprimerScore(scoreId) {
    const jeton = localStorage.getItem('jeton');
    if (!jeton) {
        displayError("Vous devez être connecté pour effectuer cette action.");
        return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce score ?")) {
        return;
    }

    // Add animation for row removal
    if (window.gsap) {
        const row = document.querySelector(`tr[data-score-id="${scoreId}"]`);
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
            sendDeleteRequest(scoreId, jeton);
        }
    } else {
        sendDeleteRequest(scoreId, jeton);
    }
}

function sendDeleteRequest(scoreId, jeton) {
    fetch(`http://localhost/H2025_TCH099_02_S1/api/api.php/palmares/supprimer/${scoreId}?jeton=${jeton}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.reussite) {
            showNotification("Score supprimé avec succès.", "success");
            setTimeout(() => location.reload(), 1000);
        } else {
            showNotification(`Erreur: ${data.erreurs}`, "error");
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
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

