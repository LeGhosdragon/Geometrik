import baseUrl from './config.js';
import Auth from './auth.js';

class Palmares {
    constructor() {
        this.jeton = Auth.getAccessToken();
        this.estAdmin = false;
        this.isSortAscending = false;
        this.currentPalmares = [];
        this.currentSortColumn = null;
        this.loadGSAP();
    }

    /** Charge la bibliothèque GSAP
     * 
     */
    loadGSAP() {
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        document.head.appendChild(gsapScript);
        gsapScript.onload = () => this.initAnimations();
    }

    /** Initialise les animations GSAP
     * 
     */
    initAnimations() {
        gsap.from("h1", {
            duration: 1,
            y: -50,
            opacity: 0,
            ease: "power3.out"
        });

        gsap.from("#palmares-container", {
            duration: 1.2,
            y: 30,
            opacity: 0,
            delay: 0.3,
            ease: "power2.out"
        });
    }

    /** Initialise le palmarès
     * 
     */
    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.checkAdminStatus()
                .then(() => this.chargerPalmares());
        });
    }

    /** Vérifie si l'utilisateur est un administrateur
     * 
     */
    async checkAdminStatus() {
        if (this.jeton) {
            try {
                const response = await fetch(`${baseUrl}/utilisateur/estAdmin?jeton=${this.jeton}`);
                const data = await response.json();
                if (data.reussite) {
                    this.estAdmin = data.estAdmin;
                }
            } catch (error) {
                console.error('Erreur vérification admin:', error);
            }
        }
    }

    /** Crée la barre de recherche
     * 
     */
    createSearchBar() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'player-search';
        searchInput.placeholder = 'Rechercher un joueur...';
        searchInput.className = 'player-search-input';
        searchInput.addEventListener('input', () => {
            this.filterPalmares(searchInput.value);
        });

        const searchIcon = document.createElement('span');
        searchIcon.className = 'search-icon';
        searchIcon.innerHTML = '🔍';

        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);

        const palmaresContainer = document.querySelector('.palmares-container');
        palmaresContainer.insertBefore(searchContainer, document.getElementById('palmares-container'));
        
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

    /** Filtre le palmarès en fonction de la requête de recherche
     * 
     * @param {string} query - La requête de recherche
     */
    filterPalmares(query) {
        if (!query) {
            this.displayPalmares(this.currentPalmares);
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const filteredPalmares = this.currentPalmares.filter(score => 
            score.nom_utilisateur.toLowerCase().includes(lowerCaseQuery)
        );

        this.displayPalmares(filteredPalmares);
        
        const playerCells = document.querySelectorAll('.palmares-table tbody td:nth-child(2)');
        playerCells.forEach(cell => {
            const name = cell.textContent;
            if (name.toLowerCase().includes(lowerCaseQuery)) {
                const highlightedText = name.replace(
                    new RegExp(`(${query})`, 'gi'),
                    '<span class="highlight">$1</span>'
                );
                
                cell.innerHTML = highlightedText;
                
                if (window.gsap) {
                    gsap.fromTo('.highlight', 
                        { backgroundColor: 'var(--accent)' },
                        { backgroundColor: 'rgba(var(--accent-rgb), 0.3)', duration: 1.5, repeat: -1, yoyo: true }
                    );
                }
            }
        });
    }

    /** Charge les données du palmarès depuis l'API
     * 
     */
    async chargerPalmares() {
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

        try {
            const response = await fetch(`${baseUrl}/palmares/obtenir`);
            const data = await response.json();
            
            if (data.reussite) {
                this.currentPalmares = data.palmares;
                this.displayPalmares(this.currentPalmares);
                this.createSearchBar();
            } else {
                this.displayError("Erreur lors de la récupération des données.");
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.displayError("Erreur de connexion au serveur.");
        }    
    }

    /** Trie le palmarès selon une colonne spécifique
     * 
     * @param {string} column - La colonne à trier
     */
    sortPalmares(column) {
        if (this.currentSortColumn === column) {
            this.isSortAscending = !this.isSortAscending;
        } else {
            this.currentSortColumn = column;
            this.isSortAscending = false;
        }

        const sortedPalmares = [...this.currentPalmares].sort((a, b) => {
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

            if (valueA < valueB) return this.isSortAscending ? -1 : 1;
            if (valueA > valueB) return this.isSortAscending ? 1 : -1;
            return 0;
        });

        this.displayPalmares(sortedPalmares);

        if (window.gsap) {
            gsap.fromTo(`.sort-${column}`,
                { rotation: 0 },
                { rotation: this.isSortAscending ? 180 : 0, duration: 0.3 }
            );
        }
    }

    /** Formate un nombre de secondes en "Xh Ymin Zs" ou "Ymin Zs"
     * 
     * @param {number} totalSeconds - Le nombre de secondes à formater
     * @returns {string} - Le temps formaté
     */
    formatTime(totalSeconds) {
        const secs = Math.floor(totalSeconds);
        const heures = Math.floor(secs / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const secondes = secs % 60;
    
        if (heures > 0) {
            return `${heures}h ${minutes}min ${secondes}s`;
        }
        return `${minutes}min ${secondes}s`;
    }

    /** Affiche le palmarès dans le DOM
     * 
     * @param {Array} palmares - Les données du palmarès à afficher
     */
    displayPalmares(palmares) {
        const container = document.getElementById('palmares-container');
        container.innerHTML = '';
        
        if (!palmares || palmares.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = "Aucun score n'a encore été enregistré. Soyez le premier à jouer !";
            container.appendChild(emptyMessage);
            
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
        
        const headers = [
            {text: "Rang", sortable: false},
            {text: "Joueur", sortable: false},
            {text: "Score", sortable: true, key: 'score'},
            {text: "Temps", sortable: true, key: 'temps_partie'},
            {text: "Expérience", sortable: true, key: 'experience'},
            {text: "Ennemis éliminés", sortable: true, key: 'ennemis_enleve'},
            {text: "Date", sortable: true, key: 'date_soumission'}
        ];
        
        if (this.estAdmin) {
            headers.push({text: "Actions", sortable: false});
        }
        
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.text;
            
            if (header.sortable) {
                th.style.cursor = 'pointer';
                th.addEventListener('click', () => this.sortPalmares(header.key));
                
                const sortIndicator = document.createElement('span');
                sortIndicator.className = `sort-indicator sort-${header.key}`;
                sortIndicator.innerHTML = this.currentSortColumn === header.key ? 
                    (this.isSortAscending ? ' ▲' : ' ▼') : ' ↕️';
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
            
            const rankCell = document.createElement('td');
            rankCell.textContent = (id + 1);
            row.appendChild(rankCell);
            
            const nameCell = document.createElement('td');
            nameCell.textContent = score.nom_utilisateur;
            row.appendChild(nameCell);
            
            const scoreCell = document.createElement('td');
            scoreCell.textContent = score.score;
            row.appendChild(scoreCell);
            
            const timeCell = document.createElement('td');
            timeCell.textContent = this.formatTime(score.temps_partie);
            row.appendChild(timeCell);
            
            const expCell = document.createElement('td');
            expCell.textContent = score.experience;
            row.appendChild(expCell);
            
            const enemiesCell = document.createElement('td');
            enemiesCell.textContent = score.ennemis_enleve;
            row.appendChild(enemiesCell);
            
            const dateCell = document.createElement('td');
            const submissionDate = new Date(score.date_soumission);
            dateCell.textContent = submissionDate.toLocaleString();
            row.appendChild(dateCell);

            if (this.estAdmin) {
                const actionsCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Supprimer";
                deleteButton.className = "delete-score-btn";
                deleteButton.addEventListener('click', () => {
                    this.supprimerScore(score.id || id+1);
                });
                actionsCell.appendChild(deleteButton);
                row.appendChild(actionsCell);
            }
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
                
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

    /** Supprime un score du palmarès
     * 
     * @param {number} scoreId - L'ID du score à supprimer
     */
    supprimerScore(scoreId) {
        if (!this.jeton) {
            this.displayError("Vous devez être connecté pour effectuer cette action.");
            return;
        }
        
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce score ?")) {
            return;
        }
        
        if (window.gsap) {
            const row = document.querySelector(`tr[data-score-id="${scoreId}"]`);
            if (row) {
                gsap.to(row, {
                    opacity: 0,
                    height: 0,
                    duration: 0.3,
                    onComplete: () => {
                        this.sendDeleteRequest(scoreId);
                    }
                });
            } else {
                this.sendDeleteRequest(scoreId);
            }
        } else {
            this.sendDeleteRequest(scoreId);
        }
    }

    /** Envoie une requête pour supprimer un score
     * 
     * @param {number} scoreId - L'ID du score à supprimer
     */
    async sendDeleteRequest(scoreId) {
        try {
            const response = await fetch(`${baseUrl}/palmares/supprimer/${scoreId}?jeton=${this.jeton}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.reussite) {
                this.showNotification("Score supprimé avec succès.", "success");
                setTimeout(() => location.reload(), 1000);
            } else {
                this.showNotification(`Erreur: ${data.erreurs}`, "error");
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification("Une erreur est survenue lors de la suppression du score.", "error");
        }
    }

    /** Affiche un message d'erreur
     * 
     * @param {string} message - Le message d'erreur à afficher
     */
    displayError(message) {
        const container = document.getElementById('palmares-container');
        container.innerHTML = `<div class="error-message">${message}</div>`;
        
        if (window.gsap) {
            gsap.from('.error-message', {
                duration: 0.5,
                scale: 0.9,
                opacity: 0,
                ease: "power2.out"
            });
        }
    }

    /** Affiche une notification
     * 
     * @param {string} message - Le message de la notification
     * @param {string} type - Le type de notification (success ou error)
     */
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        if (window.gsap) {
            gsap.fromTo(notification, 
                { x: 100, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
            );
            
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
            setTimeout(() => notification.remove(), 3000);
        }
    }
}

// Initialiser et exporter le palmarès
const palmares = new Palmares();
palmares.init();