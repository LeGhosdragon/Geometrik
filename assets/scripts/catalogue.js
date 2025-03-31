document.addEventListener('DOMContentLoaded', function() {
    const charactersBtn = document.getElementById('catalogue-characters-btn');
    const enemiesBtn = document.getElementById('catalogue-enemies-btn');
    const upgradesBtn = document.getElementById('catalogue-upgrades-btn');
    const prevBtn = document.getElementById('catalogue-prev-btn');
    const nextBtn = document.getElementById('catalogue-next-btn');
    const sections = document.querySelectorAll('.catalogue-section');

    const characters = [
        {
            name: "Guerrier",
            description: "Un guerrier avec une épée",
            image: "../images/logo.png",
            health: 20,
            attack: 1
        },
        {
            name: "Tireur d'elite",
            description: "Un tireur avec une précision incroyable",
            image: "../images/logo.png",
            health: 20,
            attack: 1
        }
    ];

    const enemies = [
        {
            name: "Normal",
            description: "Ceci est l'ennemi de base",
            image: "../images/logo.png",
            health: 25,
            attack: 1
        },
        {
            name: "Gunner",
            description: "Cet ennemi utilise une arme à feu",
            image: "../images/logo.png",
            health: 15,
            attack: 1
        },
        {
            name: "Runner",
            description: "Cet ennemi est rapide",
            image: "../images/logo.png",
            health: 15,
            attack: 1
        },
        {
            name: "Tank",
            description: "Cet ennemi a une grande défense",
            image: "../images/logo.png",
            health: 50,
            attack: 1
        },
        {
            name: "Exp",
            description: "Cet ennemi contient le cumul des points d'expériences non ramassés",
            image: "../images/logo.png",
            health: 250,
            attack: 0
        },
        {
            name: "Boss",
            description: "Cet ennemi est le boss du jeu",
            image: "../images/logo.png",
            health: 200,
            attack: 10
        }
    ];

    const upgrades = [
        {
            name: "Point de vie",
            description: "Joueur",
            image: "../../Jeu/assets/images/Health.gif",
            effect: "Augmente les points de vies du joueur"
           
        },
        {
            name: "Vitesse",
            description: "Joueur",
            image: "../../Jeu/assets/images/MovementSpeed.gif",
            effect: "Augmente la vitesse du joueur"
            
        },
        {
            name: "Zone de Collection",
            description: "Joueur",
            image: "../../Jeu/assets/images/Magnet.gif",
            effect: "Augmente la zone de collection d'expérience du joueur"
            
        },
        {
            name: "Explosion de joueur",
            description: "Joueur",
            image: "../../Jeu/assets/images/PlayerBoom.gif",
            effect: "Le joueur cause une explosion autour de lui lorsqu'un ennemie le touche"
            
        },
        {
            name: "Zone d'explosion",
            description: "Joueur",
            image: "../../Jeu/assets/images/PlayerBoom.gif",
            effect: "Augmente la zone d'explosion du joueur"
            
        },
        {
            name: "Chance de coup critique",
            description: "Joueur",
            image: "../../Jeu/assets/images/CritChance.gif",
            effect: "Augmente les chances de coup critique du joueur"
            
        },
        {
            name: "Augmentation de dégâts critiques",
            description: "Joueur",
            image: "../../Jeu/assets/images/CritDMG.gif",
            effect: "Augmente les dégâts critiques du joueur"
            
        },
        {
            name: "Temps de recharge",
            description: "Guerrier et Tireur d'élite",
            image: "../../Jeu/assets/images/Cooldown.gif",
            effect: "Diminue le temps de recharge des attaques du joueur"
            
        },
        {
            name: "Dégâts",
            description: "Guerrier et Tireur d'élite",
            image: "../../Jeu/assets/images/Dmg.gif",
            effect: "Augmente les dégâts du joueur"
            
        },
        {
            name: "Recul",
            description: "Guerrier et Tireur d'élite",
            image: "../../Jeu/assets/images/Knockback.gif",
            effect: "Augmente le recul des ennemis touchés par l'arme du joueur"
            
        },
        {
            name: "Piercing",
            description: "Tireur d'élite",
            image: "../../Jeu/assets/images/Pierce.gif",
            effect: "Augmente le nombre d'ennemis touchés par les balles du joueur"
            
        },
        {
            name: "Grandeur de la balle",
            description: "Tireur d'élite",
            image: "../../Jeu/assets/images/BulletSize.gif",
            effect: "Augmente la taille des balles du Tireur d'élite"
            
        },
        {
            name: "Largeur de l'epée",
            description: "Guerrier",
            image: "../../Jeu/assets/images/SwordWidth.gif",
            effect: "Augmente la largeur de l'épée du Guerrier"
            
        },
        {
            name: "Longueur de l'epée",
            description: "Guerrier",
            image: "../../Jeu/assets/images/BulletSize.gif",
            effect: "Augmente la longueur de l'épée du Guerrier"
            
        }
    ];

    let currentSection = 'characters';
    let currentIndex = 0;

    charactersBtn.addEventListener('click', function() {
        showSection('catalogue-characters');
        currentSection = 'characters';
        currentIndex = 0;
        updateDetailView();
    });

    enemiesBtn.addEventListener('click', function() {
        showSection('catalogue-enemies');
        currentSection = 'enemies';
        currentIndex = 0;
        updateDetailView();
    });

    upgradesBtn.addEventListener('click', function() {
        showSection('catalogue-upgrades');
        currentSection = 'upgrades';
        currentIndex = 0;
        updateDetailView();
    });

    prevBtn.addEventListener('click', function() {
        navigateCatalogue(-1);
    });

    nextBtn.addEventListener('click', function() {
        navigateCatalogue(1);
    });

    function showSection(sectionId) {
        sections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
    }

    function navigateCatalogue(direction) {
        let currentData;
        switch(currentSection) {
            case 'characters':
                currentData = characters;
                break;
            case 'enemies':
                currentData = enemies;
                break;
            case 'upgrades':
                currentData = upgrades;
                break;
        }

        currentIndex += direction;
        
        if (currentIndex < 0) {
            currentIndex = currentData.length - 1;
        } else if (currentIndex >= currentData.length) {
            currentIndex = 0;
        }

        updateDetailView();
    }

    function updateDetailView() {
        let currentData, nameEl, descEl, imageEl, statsContainer;
        switch(currentSection) {
            case 'characters':
                currentData = characters[currentIndex];
                nameEl = document.getElementById('character-name');
                descEl = document.getElementById('character-description');
                imageEl = document.getElementById('character-image');
                statsContainer = document.querySelector('#catalogue-characters .character-stats');
                
                nameEl.textContent = currentData.name;
                descEl.textContent = currentData.description;
                imageEl.src = currentData.image;
                
                document.getElementById('character-health').textContent = currentData.health;
                document.getElementById('character-attack').textContent = currentData.attack;
                document.getElementById('character-defense').textContent = currentData.defense;
                break;

            case 'enemies':
                currentData = enemies[currentIndex];
                nameEl = document.getElementById('enemy-name');
                descEl = document.getElementById('enemy-description');
                imageEl = document.getElementById('enemy-image');
                statsContainer = document.querySelector('#catalogue-enemies .enemy-stats');
                
                nameEl.textContent = currentData.name;
                descEl.textContent = currentData.description;
                imageEl.src = currentData.image;
                
                document.getElementById('enemy-health').textContent = currentData.health;
                document.getElementById('enemy-attack').textContent = currentData.attack;
                document.getElementById('enemy-defense').textContent = currentData.defense;
                break;

            case 'upgrades':
                currentData = upgrades[currentIndex];
                nameEl = document.getElementById('upgrade-name');
                descEl = document.getElementById('upgrade-description');
                imageEl = document.getElementById('upgrade-image');
                statsContainer = document.querySelector('#catalogue-upgrades .upgrade-details');
                
                nameEl.textContent = currentData.name;
                descEl.textContent = currentData.description;
                imageEl.src = currentData.image;
                
                document.getElementById('upgrade-effect').textContent = currentData.effect;
                document.getElementById('upgrade-cost').textContent = currentData.cost;
                break;
        }
    }

    showSection('catalogue-characters');
    updateDetailView();
});