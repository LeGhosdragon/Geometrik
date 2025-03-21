document.addEventListener("DOMContentLoaded", function() {
    // Fetch leaderboard data from API
    fetch('http://localhost/H2025_TCH099_02_S1/api/api.php/palmares/obtenir')
        .then(response => response.json())
        .then(data => {
            if (data.reussite) {
                displayPalmares(data.palmares);
            } else {
                displayError("Erreur lors de la récupération des données.");
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            displayError("Erreur de connexion au serveur.");
        });
});

function displayPalmares(palmares) {
    const container = document.getElementById('palmares-container');
    
    // Clear any existing content
    container.innerHTML = '';
    
    if (!palmares || palmares.length === 0) {
        // Display message when no scores are available
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = "Aucun score n'a encore été enregistré. Soyez le premier à jouer !";
        container.appendChild(emptyMessage);
        return;
    }
    
    // Create table
    const table = document.createElement('table');
    table.className = 'palmares-table';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
        "Rang", "Joueur", "Score", "Temps (ms)", "Expérience", "Ennemis éliminés", "Date"
    ];
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    palmares.forEach((score, index) => {
        const row = document.createElement('tr');
        
        // Add rank
        const rankCell = document.createElement('td');
        rankCell.textContent = (index + 1);
        row.appendChild(rankCell);
        
        // Add player name
        const nameCell = document.createElement('td');
        nameCell.textContent = score.nom_utilisateur;
        row.appendChild(nameCell);
        
        // Add score
        const scoreCell = document.createElement('td');
        scoreCell.textContent = score.score;
        row.appendChild(scoreCell);
        
        // Add time
        const timeCell = document.createElement('td');
        timeCell.textContent = score.temps_partie;
        row.appendChild(timeCell);
        
        // Add experience
        const expCell = document.createElement('td');
        expCell.textContent = score.experience;
        row.appendChild(expCell);
        
        // Add enemies defeated
        const enemiesCell = document.createElement('td');
        enemiesCell.textContent = score.ennemis_enleve;
        row.appendChild(enemiesCell);
        
        // Add submission date
        const dateCell = document.createElement('td');
        const submissionDate = new Date(score.date_soumission);
        dateCell.textContent = submissionDate.toLocaleString();
        row.appendChild(dateCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}

function displayError(message) {
    const container = document.getElementById('palmares-container');
    container.innerHTML = `<div class="error-message">${message}</div>`;
}