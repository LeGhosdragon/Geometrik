document.addEventListener('DOMContentLoaded', function() {
    //Configuration des données
    const catalogueData = {
        characters: [
            {
              name: { fr: "Guerrier", en: "Warrior" },
              description: {
                fr: "Un guerrier avec une épée",
                en: "A warrior with a sword"
              },
              image: "../images/joueur_epee.png",
              health: 20,
              attack: 1
            },
            {
              name: { fr: "Tireur d'elite", en: "Sharpshooter" },
              description: {
                fr: "Un tireur avec une précision incroyable",
                en: "A shooter with incredible accuracy"
              },
              image: "../images/joueur_gun.png",
              health: 20,
              attack: 1
            }
          ],
          
          enemies: [
            {
              name: { fr: "Normal", en: "Normal" },
              description: {
                fr: "Ceci est l'ennemi de base",
                en: "This is the basic enemy"
              },
              image: "../images/ennemi_normal.png",
              health: 25,
              attack: 1
            },
            {
              name: { fr: "Gunner", en: "Gunner" },
              description: {
                fr: "Cet ennemi utilise une arme à feu",
                en: "This enemy uses a firearm"
              },
              image: "../images/ennemi_gunner.png",
              health: 15,
              attack: 1
            },
          
            {
                name: { fr: "Runner", en: "Runner" },
                description: {
                    fr: "Cet ennemi est rapide",
                    en: "This enemy is fast"
                },
                image: "../images/ennemi_runner.png",
                health: 15,
                attack: 1
            },
            {
                name: { fr: "Tank", en: "Tank" },
                description: {
                    fr: "Cet ennemi a une grande défense",
                    en: "This enemy has high defense"
                },
                image: "../images/ennemi_tank.png",
                health: 50,
                attack: 1
            },
            {
                name: { fr: "Exp", en: "Exp" },
                description: {
                    fr: "Cet ennemi contient le cumul des points d'expériences non ramassés",
                    en: "This enemy contains uncollected experience points"
                },
                image: "../images/ennemi_exp.png",
                health: 250,
                attack: 0
            },
            {
                name: { fr: "Boss Normal", en: "Normal Boss" },
                description: {
                    fr: "Un boss standard avec des statistiques équilibrées",
                    en: "A standard boss with balanced stats"
                },
                image: "../images/boss_normal.png",
                health: 5950,
                attack: 10
            },
            {
                name: { fr: "Boss Runner", en: "Runner Boss" },
                description: {
                    fr: "Un boss rapide et agile",
                    en: "A fast and agile boss"
                },
                image: "../images/boss_runner.png",
                health: 2000,
                attack: 3
            },
            {
                name: { fr: "Boss Tank", en: "Tank Boss" },
                description: {
                    fr: "Un boss avec une défense exceptionnelle",
                    en: "A boss with exceptional defense"
                },
                image: "../images/boss_tank.png",
                health: 2733,
                attack: 2
            },
            {
                name: { fr: "Boss Gunner", en: "Gunner Boss" },
                description: {
                    fr: "Un boss qui utilise des armes à feu",
                    en: "A boss that uses firearms"
                },
                image: "../images/boss_gunner.png",
                health: 2578,
                attack: 1
            },
            {
                name: { fr: "Boss Bunny", en: "Bunny Boss" },
                description: {
                    fr: "Un boss rapide et imprévisible",
                    en: "A fast and unpredictable boss"
                },
                image: "../images/boss_bunny.png",
                health: 2380,
                attack: 5
            }

        ],
        upgrades: [
            {
                name: { fr: "Point de vie", en: "Health Points" },
                description: { fr: "Joueur", en: "Player" },
                image: "../../Jeu/assets/images/Health.gif",
                effect: {
                    fr: "Augmente les points de vies du joueur",
                    en: "Increases the player's health points"
                }
            },
            {
                name: { fr: "Vitesse", en: "Speed" },
                description: { fr: "Joueur", en: "Player" },
                image: "../../Jeu/assets/images/MovementSpeed.gif",
                effect: {
                    fr: "Augmente la vitesse du joueur",
                    en: "Increases the player's speed"
                }
            },
            {
                name: { fr: "Zone de Collection", en: "Collection Zone" },
                description: { fr: "Joueur", en: "Player" },
                image: "../../Jeu/assets/images/Magnet.gif",
                effect: {
                    fr: "Augmente la zone de collection d'expérience du joueur",
                    en: "Increases the player's experience collection zone"
                }
            },
            {
                name: { fr: "Explosion de joueur", en: "Player Explosion" },
                description: { fr: "Joueur", en: "Player" },
                image: "../../Jeu/assets/images/PlayerBoom.gif",
                effect: {
                    fr: "Le joueur cause une explosion autour de lui lorsqu'un ennemi le touche",
                    en: "The player causes an explosion around them when an enemy touches them"
                }
            },
            {
                name: { fr: "Zone d'explosion", en: "Explosion Zone" },
                description: { fr: "Joueur", en: "Player" },
                image: "../../Jeu/assets/images/PlayerBoom.gif",
                effect: {
                    fr: "Augmente la zone d'explosion du joueur",
                    en: "Increases the player's explosion zone"
                }
            },
            {
                name: { fr: "Chance de coup critique", en: "Critical Hit Chance" },
                description: { fr: "Joueur", en: "Player" },
                image: "../../Jeu/assets/images/CritChance.gif",
                effect: {
                    fr: "Augmente les chances de coup critique du joueur",
                    en: "Increases the player's critical hit chance"
                }
            },
            {
                name: { fr: "Augmentation de dégâts critiques", en: "Critical Damage Increase" },
                description: { fr: "Joueur", en: "Player" },
                image: "../../Jeu/assets/images/CritDMG.gif",
                effect: {
                    fr: "Augmente les dégâts critiques du joueur",
                    en: "Increases the player's critical damage"
                }
            },
            {
                name: { fr: "Temps de recharge", en: "Cooldown" },
                description: { fr: "Guerrier et Tireur d'élite", en: "Warrior and Sharpshooter" },
                image: "../../Jeu/assets/images/Cooldown.gif",
                effect: {
                    fr: "Diminue le temps de recharge des attaques du joueur",
                    en: "Decreases the player's attack cooldown"
                }
            },
            {
                name: { fr: "Dégâts", en: "Damage" },
                description: { fr: "Guerrier et Tireur d'élite", en: "Warrior and Sharpshooter" },
                image: "../../Jeu/assets/images/Dmg.gif",
                effect: {
                    fr: "Augmente les dégâts du joueur",
                    en: "Increases the player's damage"
                }
            },
            {
                name: { fr: "Recul", en: "Knockback" },
                description: { fr: "Guerrier et Tireur d'élite", en: "Warrior and Sharpshooter" },
                image: "../../Jeu/assets/images/Knockback.gif",
                effect: {
                    fr: "Augmente le recul des ennemis touchés par l'arme du joueur",
                    en: "Increases the knockback of enemies hit by the player's weapon"
                }
            },
            {
                name: { fr: "Piercing", en: "Piercing" },
                description: { fr: "Tireur d'élite", en: "Sharpshooter" },
                image: "../../Jeu/assets/images/Pierce.gif",
                effect: {
                    fr: "Augmente le nombre d'ennemis touchés par les balles du joueur",
                    en: "Increases the number of enemies hit by the player's bullets"
                }
            },
            {
                name: { fr: "Grandeur de la balle", en: "Bullet Size" },
                description: { fr: "Tireur d'élite", en: "Sharpshooter" },
                image: "../../Jeu/assets/images/BulletSize.gif",
                effect: {
                    fr: "Augmente la taille des balles du Tireur d'élite",
                    en: "Increases the size of the Sharpshooter's bullets"
                }
            },
            {
                name: { fr: "Largeur de l'épée", en: "Sword Width" },
                description: { fr: "Guerrier", en: "Warrior" },
                image: "../../Jeu/assets/images/SwordWidth.gif",
                effect: {
                    fr: "Augmente la largeur de l'épée du Guerrier",
                    en: "Increases the Warrior's sword width"
                }
            },
            {
                name: { fr: "Longueur de l'épée", en: "Sword Length" },
                description: { fr: "Guerrier", en: "Warrior" },
                image: "../../Jeu/assets/images/BulletSize.gif",
                effect: {
                    fr: "Augmente la longueur de l'épée du Guerrier",
                    en: "Increases the Warrior's sword length"
                }
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

    /** Cette fonction permet de configurer les événements
     * 
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

    /** Cette fonction permet de changer de section
     * 
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

    /** Cette fonction permet d'afficher la section
     * 
     * @param {*} sectionId l'id de la section
     */
    function showSection(sectionId) {
        uiElements.sections.forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(sectionId).style.display = 'block';
    }

    /** Cette fonction permet de naviguer dans le catalogue
     * 
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

    /** Cette fonction permet de mettre à jour la vue des détails
     * 
     */ 
    function updateDetailView() {
        const currentData = catalogueData[state.currentSection][state.currentIndex];
        const lang = localStorage.getItem('lang') || 'fr';
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
        

        if (nameElement) nameElement.textContent = currentData.name[lang] || currentData.name.fr;
        if (descriptionElement) descriptionElement.textContent = currentData.description[lang] || currentData.description.fr;

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
                    if (effectElement) effectElement.textContent = currentData.effect[lang] || currentData.effect.fr;
                break;
        }
        console.log(state.currentIndex, currentData);
    }

    /** Cette fonction permet d'initialiser l'effet de fond
     * 
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

 

    /** Cette fonction permet d'animer la transition entre les sections
     * 
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

    /** Cette fonction permet d'animer la transition entre les éléments
     * 
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
    window.updateCatalogueLanguage = updateDetailView;

});