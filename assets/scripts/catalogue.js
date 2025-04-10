document.addEventListener('DOMContentLoaded', function() {
    //Configuration des données
    const catalogueData = {
        characters: [
            {
                name: "Guerrier",
                description: "Un guerrier avec une épée",
                image: "../images/joueur_epee.png",
                health: 20,
                attack: 1
            },
            {
                name: "Tireur d'elite",
                description: "Un tireur avec une précision incroyable",
                image: "../images/joueur_gun.png",
                health: 20,
                attack: 1
            }
        ],
        enemies: [
            {
                name: "Normal",
                description: "Ceci est l'ennemi de base",
                image: "../images/ennemi_normal.png",
                health: 25,
                attack: 1
            },
            {
                name: "Gunner",
                description: "Cet ennemi utilise une arme à feu",
                image: "../images/ennemi_gunner.png",
                health: 15,
                attack: 1
            },
            {
                name: "Runner",
                description: "Cet ennemi est rapide",
                image: "../images/ennemi_runner.png",
                health: 15,
                attack: 1
            },
            {
                name: "Tank",
                description: "Cet ennemi a une grande défense",
                image: "../images/ennemi_tank.png",
                health: 50,
                attack: 1
            },
            {
                name: "Exp",
                description: "Cet ennemi contient le cumul des points d'expériences non ramassés",
                image: "../images/ennemi_exp.png",
                health: 250,
                attack: 0
            },
            {
                name: "Boss Normal",
                description: "",
                image: "../images/boss_normal.png",
                health: 5950,
                attack: 10
            },
            {
                name: "Boss Tank",
                description: "",
                image: "../images/boss_tank.png",
                health: 2733,
                attack: 2
            },
            {
                name: "Boss Gunner",
                description: "",
                image: "../images/boss_gunner.png",
                health: 2578,
                attack: 1
            },
            {
                name: "Boss Bunny",
                description: "",
                image: "../images/boss_bunny.png",
                health: 2380,
                attack: 5
            }

        ],
        upgrades: [
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
        ]
    };

    //Structure de l'interface
    const uiElements = {
        buttons: {
            characters: document.getElementById('catalogue-characters-btn'),
            enemies: document.getElementById('catalogue-enemies-btn'),
            upgrades: document.getElementById('catalogue-upgrades-btn'),
            prev: document.getElementById('catalogue-prev-btn'),
            next: document.getElementById('catalogue-next-btn')
        },
        sections: document.querySelectorAll('.catalogue-section'),
        container: document.querySelector('.catalogue-container')
    };

    //État de l'application
    const state = {
        currentSection: 'characters',
        currentIndex: 0
    };

    //Initialisation du background GSAP
    initBackgroundEffect();

    //Configuration des événements
    setupEventListeners();

    //Initialisation de l'interface
    showSection('catalogue-characters');
    updateDetailView();

    /**
     * Cette fonction permet de configurer les événements
     */
    function setupEventListeners() {
        // Boutons de catégorie
        uiElements.buttons.characters.addEventListener('click', () => switchSection('characters'));
        uiElements.buttons.enemies.addEventListener('click', () => switchSection('enemies'));
        uiElements.buttons.upgrades.addEventListener('click', () => switchSection('upgrades'));
        
        // Boutons de navigation
        uiElements.buttons.prev.addEventListener('click', () => navigateCatalogue(-1));
        uiElements.buttons.next.addEventListener('click', () => navigateCatalogue(1));
    }

    /**
     * Cette fonction permet de changer de section
     * @param {*} section la section à changer
     */
    function switchSection(section) {
        state.currentSection = section;
        state.currentIndex = 0;
        showSection(`catalogue-${section}`);
        updateDetailView();
        
        // Animation de transition avec GSAP
        animateSectionTransition();
    }

    /**
     * Cette fonction permet d'afficher la section
     * @param {*} sectionId l'id de la section
     */
    function showSection(sectionId) {
        uiElements.sections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
    }

    /**
     * Cette fonction permet de naviguer dans le catalogue
     * @param {*} direction la direction de la navigation
     */
    function navigateCatalogue(direction) {
        const currentData = catalogueData[state.currentSection];
        
        state.currentIndex += direction;
        
        if (state.currentIndex < 0) {
            state.currentIndex = currentData.length - 1;
        } else if (state.currentIndex >= currentData.length) {
            state.currentIndex = 0;
        }

        // Animer le changement d'élément
        animateItemTransition();
        updateDetailView();
    }

    /**
     * Cette fonction permet de mettre à jour la vue des détails
     */ 
    function updateDetailView() {
        const currentData = catalogueData[state.currentSection][state.currentIndex];
        if (!currentData) {
            console.error(`No data found for section ${state.currentSection} at index ${state.currentIndex}`);
            return;
        }
        
        // Mapping pour obtenir le bon préfixe d'ID pour chaque section
        const idPrefix = {
            'characters': 'character',
            'enemies': 'enemy',
            'upgrades': 'upgrade'
        }[state.currentSection];
        
        if (!idPrefix) {
            console.error(`Invalid section: ${state.currentSection}`);
            return;
        }
        
        // Structure commune à toutes les sections
        const elementIds = {
            name: `${idPrefix}-name`,
            description: `${idPrefix}-description`,
            image: `${idPrefix}-image`
        };
        
        // Mettre à jour les éléments communs
        const nameElement = document.getElementById(elementIds.name);
        const descriptionElement = document.getElementById(elementIds.description);
        const imageElement = document.getElementById(elementIds.image);
        
        if (nameElement) nameElement.textContent = currentData.name;
        if (descriptionElement) descriptionElement.textContent = currentData.description;
        if (imageElement) imageElement.src = currentData.image;
        
        // Mettre à jour les statistiques spécifiques
        switch (state.currentSection) {
            case 'characters':
                const healthElement = document.getElementById('character-health');
                const attackElement = document.getElementById('character-attack');
                if (healthElement) healthElement.textContent = currentData.health || 'N/A';
                if (attackElement) attackElement.textContent = currentData.attack || 'N/A';
                break;
            case 'enemies':
                const enemyHealthElement = document.getElementById('enemy-health');
                const enemyAttackElement = document.getElementById('enemy-attack');
                if (enemyHealthElement) enemyHealthElement.textContent = currentData.health || 'N/A';
                if (enemyAttackElement) enemyAttackElement.textContent = currentData.attack || 'N/A';
                break;
            case 'upgrades':
                const effectElement = document.getElementById('upgrade-effect');
                if (effectElement) effectElement.textContent = currentData.effect || 'N/A';
                break;
        }
        console.log(state.currentIndex, currentData);
    }

    /**
     * Cette fonction permet d'initialiser l'effet de fond
     */
    function initBackgroundEffect() {
        // Créer une div pour contenir les particules interactives
        const bgContainer = document.createElement('div');
        bgContainer.className = 'background-particles';
        document.body.insertBefore(bgContainer, document.body.firstChild);

        // Générer des particules
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            bgContainer.appendChild(particle);
            
            // Position initiale aléatoire
            gsap.set(particle, {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5,
                // backgroundColor: getRandomColor()
            });
            
            // Animation de base
            //animateParticle(particle);
        }

        // Ajouter un écouteur d'événements pour l'interaction à la souris
        document.addEventListener('mousemove', (e) => {
            gsap.to('.particle', {
                duration: 2,
                x: '+=' + (e.clientX - window.innerWidth / 2) / 20,
                y: '+=' + (e.clientY - window.innerHeight / 2) / 20,
                ease: 'power1.out',
                stagger: 0.02
            });
        });
    }

    /**
     * Cette fonction permet d'animer les particules
     * @param {*} particle la particule à animer
     */
    // function animateParticle(particle) {
    //     gsap.to(particle, {
    //         duration: Math.random() * 10 + 10,
    //         x: Math.random() * window.innerWidth,
    //         y: Math.random() * window.innerHeight,
    //         rotation: Math.random() * 360,
    //         ease: 'none',
    //         repeat: -1,
    //         yoyo: true
    //     });
    // }

    /**
     * Cette fonction permet de récupérer une couleur aléatoire pour le background
     * @returns la couleur aléatoire
     */
    // function getRandomColor() {
    //     const colors = [
    //         'rgba(0, 153, 255, 0.3)',    // primary
    //         'rgba(74, 0, 153, 0.3)',     // secondary
    //         'rgba(153, 0, 94, 0.3)',     // accent
    //         'rgba(138, 43, 226, 0.3)'    // purple
    //     ];
    //     return colors[Math.floor(Math.random() * colors.length)];
    // }

    /**
     * Cette fonction permet d'animer la transition entre les sections
     */
    function animateSectionTransition() {
        // Animation de transition entre les sections
        const sectionElement = document.getElementById(`catalogue-${state.currentSection}`);
        if (!sectionElement) {
            console.error(`Section element #catalogue-${state.currentSection} not found`);
            return;
        }
        
        gsap.fromTo(
            sectionElement, 
            { opacity: 0, scale: 0.9 }, 
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5, 
                ease: 'back.out' 
            }
        );
    }

    /**
     * Cette fonction permet d'animer la transition entre les éléments
     */
    function animateItemTransition() {
        // Mapping pour obtenir le bon préfixe d'ID pour chaque section
        const idPrefix = {
            'characters': 'character',
            'enemies': 'enemy',
            'upgrades': 'upgrade'
        }[state.currentSection];
        
        if (!idPrefix) {
            console.error(`Invalid section: ${state.currentSection}`);
            return;
        }
        
        const imageSelector = `#${idPrefix}-image`;
        const imageElement = document.querySelector(imageSelector);
        
        if (!imageElement) {
            console.error(`Image element ${imageSelector} not found`);
            return;
        }
        
        // Animation pour le changement d'élément
        gsap.fromTo(
            imageElement, 
            { opacity: 0, rotationY: 90 }, 
            { 
                opacity: 1, 
                rotationY: 0, 
                duration: 0.7, 
                ease: 'power3.out' 
            }
        );

        // Animation pour le texte
        const textElements = document.querySelectorAll(`.catalogue-description-container h2, .catalogue-description-container p, .stat`);
        if (textElements.length > 0) {
            gsap.fromTo(
                textElements, 
                { opacity: 0, y: 20 }, 
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.5, 
                    stagger: 0.1,
                    ease: 'power2.out' 
                }
            );
        }
    }
});