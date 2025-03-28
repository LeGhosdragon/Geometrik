document.addEventListener("DOMContentLoaded", function() {
    const jeton = localStorage.getItem('jeton');
    let estAdmin = false;
    let isSortAscending = false;
    let currentPalmares = [];
    let currentSortColumn = null;
    

    function chargerPalmares(){
        fetch('http://localhost/H2025_TCH099_02_S1/api/api.php/palmares/obtenir')
        .then(response => response.json())
        .then(data => {
            if (data.reussite) {
                currentPalmares = data.palmares; // Ici on garde les donnees originaux du palmares
                displayPalmares(currentPalmares, estAdmin);
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
                
                // Element visuel pour indiquer le tri
                const sortIndicator = document.createElement('span');
                sortIndicator.innerHTML = ' ↕️'; // A changer plus tard
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
    }

});
function supprimerScore(scoreId){
    const jeton = localStorage.getItem('jeton');
    if(!jeton){
        displayError("Vous devez être connecté pour effectuer cette action.")
        return
    }

    if(!confirm("Êtes-vous sûr de vouloir supprimer ce score ?")){
        return;
    }

    fetch(`http://localhost/H2025_TCH099_02_S1/api/api.php/palmares/supprimer/${scoreId}?jeton=${jeton}`,{
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data =>{
        if(data.reussite){
            alert("Score supprimer avec succes.");
            location.reload();
        } else{
            alert(`Erreur: ${data.erreurs}`);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert("Une erreur est survenue lors de la suppression du score.");
    });
}
/**
 * Fonction qui affiche un message d'erreur s'il n'y a pas de score
 * @param {*} message 
 */
function displayError(message) {
    const container = document.getElementById('palmares-container');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}

