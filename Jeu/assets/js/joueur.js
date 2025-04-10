
/**
 * La classe Joueur gère ses propriétés, son affichage, so progression et ses interactions
 * avec les monstres.
 */
export class Joueur {

    static Monstre = null;
    static upgrade = null;
    static Upgrade = null;
    static Event = null;
    static Explosion = null;
    static EXP_BAR = document.getElementById('expBar');
    static Grid = null;

    constructor(app, size = 16, vitesse = 1, baseHP = 20, currentHP = baseHP, baseDMG = 15, elapsedTime = 0, couleur = 0xFF0000, weapons = ["sword","gun"]) {
        this.hold = false;
        this.clickLock = false;
        this.lvl = 0;
        this.expReq = 7 + this.lvl*this.lvl; 
        this.debug = false;
        this.exp = 0;
        this.distanceDattraction = 150;
        this.isImmune = false;
        this.app = app;
        this.size = size;
        this.vitesse = vitesse;
        this.baseHP = baseHP;
        this.currentHP = currentHP;
        this.hasGun = false;
        this.hasSword = false;
        this.explRadius = 1;
        this.critChance = 5;
        this.critDMG = 2;
        this.upgExplosion = false;
        this.baseDMG = baseDMG;
        this.elapsedTime = elapsedTime;
        this.couleur = couleur;
        this.weapons = weapons;
        this.numChoix = 3;
        this.bulletHit = false;
        this.body = this.faireJoueur();
        this.hasExplHit = false;
        this.createResolver();
        this.hpText = this.createHPText();
        this.healthBar = this.createHealthBar();
        this.updateHealthBar();
        this.body.visible = false;
        this.hpText.visible = false;
        this.healthBar.visible = false;
        this.damageFlash = this.createDmgFlash(app);
        this.statistics = {UserName: "Guest", kills : 0, dmgDealt : 0, dmgTaken : 0, expGained : 0,  timePlayed : 0, timeShown : 0, score : 0, jeton: ""};
        this.statistics.jeton = localStorage.getItem('jeton');
        this.statistics.UserName = localStorage.getItem('username');
    }

    // Fonction pour créer le joueur
    faireJoueur() {
        const joueur = new PIXI.Graphics();
        joueur.lineStyle(3, 0x000000, 1);
        if(this.app.space){joueur.lineStyle(0xFFFFFF);}
        joueur.beginFill(this.couleur);
        if(Joueur.Monstre.dedMilkMan){joueur.beginFill(0xFF0000);}
        if(this.app.space){joueur.beginFill(0x000000);}
        
        joueur.drawCircle(this.size, this.size, this.size);
        joueur.endFill();
        joueur.zIndex = 99;
        joueur.x = window.innerWidth/2.08;
        joueur.y = window.innerHeight/2.145;
        joueur.vx = 0;
        joueur.vy = 0;
    
        this.app.stage.addChild(joueur);
        return joueur;
    }


    // Gestion des collisions entre le joueur et les monstres
    onPlayerCollision(monstres) {
        let collidedMonstres = [];
    
        monstres.forEach(monstre => {
            // Vérifier la collision entre le joueur et chaque monstre
            if (this.hitTestCircle(monstre)) {
                collidedMonstres.push(monstre); // Stcoker les monstres qui sont rentrés en collision
            }
        });
            
        // Enlever les monstres qui sont rentrés en collision du main array
        collidedMonstres.forEach(monstre => {
            if(!this.isImmune)
            {
                this.endommagé(monstre.getDMG());
                this.isImmune = true;
                setTimeout(() => {this.isImmune = false;}, 750);
            }

            // Maintenant résoudre le chevauchement en poussant le monstre (le joueur reste immobile)
            let dx = this.getX() + this.getWidth()/2  - monstre.getX() - monstre.size / 2;
            let dy = this.getY() + this.getHeight()/2 - monstre.getY() - monstre.size / 2;

            let distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.getWidth()/2.5 + monstre.getWidth() / 2; // Minimum distance to avoid overlap

            if (distance < minDistance) {
                let overlap = minDistance - distance; // Calcul la distance de chevauchement
                let angle = Math.atan2(dy, dx); // Ovtenir l'angle de collision

                // Pousser le monstre du joueur le long du vecteur de collision
                let pushX = Math.cos(angle) * overlap;
                let pushY = Math.sin(angle) * overlap;

                // Déplacer le monstre loin du joueur
                monstre.setX(monstre.getX() - pushX);
                monstre.setY(monstre.getY() - pushY);
            }
        });
    }
    
    
    // Detection de la collision selon un cercle (en utilisant le rayon)
    hitTestCircle(autreCercle) {
        // Définir la distance entre les centres des deux objets
        let dx = this.getX() + this.getWidth()/2.3 - autreCercle.getX();
        let dy = this.getY() + this.getHeight()/2.3 - autreCercle.getY();
    
        // Calcul de la distance entre les centres
        let distance = Math.sqrt(dx * dx*0.9 + dy * dy*0.9);
    
        // Obtenir le rayon entre le joueur et le box (considérer le box comme un cercle pour la collision)
        let thisRadius = this.getWidth() / 2;
        let autreCercleRadius = autreCercle.getWidth() / 2;
    
        // Vérifier si il y a eu une collision
        if (distance < thisRadius + autreCercleRadius) {
            return true; // Il y a collision
        }
        return false; // Pas de collision
    }

    // Fonction pour créer le texte pour les Health Points
    createHPText() {
        const text = new PIXI.Text(this.currentHP, {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: Joueur.Monstre.dedMilkMan ? 0x000000 : 0xFFFFFF,
            align: 'center'
        });
        text.zIndex = 101;
        text.anchor.set(0.5);
        text.x = this.body.x + this.size;
        text.y = this.body.y + this.size;
        this.app.stage.addChild(text);
        return text;
    }

    // Ajoute un quantité l'EXP au joueur
    addExp(qty)
    {
        let val = Math.round(this.exp + qty);
        let val2 = Math.round(this.statistics.expGained + qty);
        this.exp = isNaN(val) ? this.exp : val;
        this.statistics.expGained = isNaN(val2) ? this.statistics.expGained : val2;
        this.updateHP();
        this.updatelvl();
        this.updateExpBar();
    }
    // Vérifie si le joueur a accumulé assez d'EXP
    updateExpBar() {
        let height = window.innerHeight;
        let width = window.innerWidth;
        let expRatio = this.exp / this.expReq + 0.02;
    
        Joueur.EXP_BAR.style.height = `${expRatio * height}px`;
        Joueur.EXP_BAR.style.width = `${width}px`;
    }

    // Création d'un cercle de health bar qui est affiché sur le joueur lui-même
    createHealthBar() {
        const healthBar = new PIXI.Graphics();
        healthBar.zIndex = 100;
        this.app.stage.addChild(healthBar);
        return healthBar;
    }

    updateHealthBar() {
        this.healthBar.clear();
    
        // Calcule du pourcentage de health
        let healthPercent = this.currentHP / this.baseHP;
        if (healthPercent < 0) healthPercent = 0;
    
        // Define pie chart parameters
        let radius = this.size - 1;
        let startAngle = -Math.PI / 2; // Commence à partir du haut (position 12 heures)
        let endAngle = startAngle + (2 * Math.PI * healthPercent); // Fill proportionally
    
        // Skip drawing if health is 0
        if (healthPercent <= 0) return;
    
        // Smooth line style
        this.healthBar.lineStyle({
            width: 3,
            color: this.app.space ? 0xFFFFFF : 0x000000,
            alpha: healthPercent !== 1 ? 1 : 0,
            cap: PIXI.LINE_CAP.ROUND,
            join: PIXI.LINE_JOIN.ROUND,
        });
    
        // Choose fill color based on conditions
        if (Joueur.Monstre.dedMilkMan) {
            this.healthBar.beginFill(0xFFFFFF, 1);
        } else if (this.app.space) {
            this.healthBar.beginFill(0x000000, 1);}
        else {
            this.healthBar.beginFill(0x9966FF, 1);
        }
    
        // Move to center of circle
        let centerX = this.getX() + this.size;
        let centerY = this.getY() + this.size;
        this.healthBar.moveTo(centerX, centerY);
    
        // Increase resolution of the arc
        let totalSegments = 100; // Higher value for smoother curves
    
        // Draw the arc by connecting points
        for (let i = 0; i <= totalSegments; i++) {
            let angle = startAngle + (i / totalSegments) * (endAngle - startAngle);
            let x = centerX + Math.cos(angle) * radius;
            let y = centerY + Math.sin(angle) * radius;
            this.healthBar.lineTo(x, y);
        }
    
        // Close the shape and finish
        this.healthBar.lineTo(centerX, centerY);
        this.healthBar.closePath();
        this.healthBar.endFill();
    }
    
    
       
    // Gestion des Healt Points
    updateHP() {
        this.hpText.text = this.currentHP.toFixed(1) > 0 ? (this.currentHP).toFixed(1)%1 > 0 ? (this.currentHP).toFixed(1) : this.currentHP.toFixed(0) : this.playerDied(); // Keep the HP text
        this.hpText.x = this.getX() + this.size;
        this.hpText.y = this.getY() + this.size;
    
        this.updateHealthBar();
    }
    
 
    // Gestion de la progression du joueur
    // 1. vérifie si le joueur a accumulé assez d'EXP pour monter de niveau
    // 2. augmente le niveau du joueur
    // 3. propose des upgrades au joueur
    updatelvl()
    {
        if(this.exp >= this.expReq)
        {
            this.lvl++;
            this.exp -= this.expReq < 0 ? 0 : this.expReq;
            this.expReq = 7 + Math.round(this.lvl**1.9);
            let upgrades = Joueur.upgrade.choisirUpgrade(this.numChoix);
            Joueur.upgrade.montrerUpgrades(upgrades); 
        }
    }

    // Gestion de la barre d'EXP
    getExpBar(width = 20) {
        let progress = Math.floor((this.exp / this.expReq) * width);
        progress = Math.min(progress, width);
        let bar = "[" + "#".repeat(progress) + "-".repeat(width - progress) + "]";
        return `Lvl ${this.lvl} ${bar} ${this.exp}/${this.expReq}`;
    }

    // Gestion des dégats subis par le joueur
    endommagé(dmg, weapon = "sword") {
    
        
        if(weapon.type == "explosion")
        {
            if(!this.hasExplHit) {
                this.setExplosionHit(true);
                console.log(weapon.baseDMG);
                setTimeout(()=> {
                    this.setExplosionHit(false);
                }, 500);
                this.statistics.dmgTaken+=dmg;
                this.triggerDamageEffect();
                this.setHP(this.getHP() - dmg);
            }
        }
        else{
            if(this.upgExplosion)
            {
                new Joueur.Explosion(this.getX() + this.size, this.getY()+ this.size, this.body.width * 6 * this.explRadius, this.baseDMG/3, 0xFF0000);    
            }
            this.statistics.dmgTaken+=dmg;
            this.triggerDamageEffect();
            this.setHP(this.getHP() - dmg);
        }

        this.updateHP();
    }

    createDmgFlash() {
        // Create a DOM element instead of PIXI Graphics
        const damageFlash = document.createElement('div');
        damageFlash.classList.add('darken-effect');
        damageFlash.style.opacity = '0'; // Start fully transparent
        document.body.appendChild(damageFlash);
        return damageFlash;
    }
    
    triggerDamageEffect() {
        if (parseFloat(this.damageFlash.style.opacity) > 0) return;
        
        // Trigger the animation
        this.damageFlash.style.opacity = '1';
        this.damageFlash.style.animation = 'heartbeat-darken 1s infinite';
    
        // Fade out after 1 second
        setTimeout(() => {
            this.damageFlash.style.opacity = '0';
            this.damageFlash.style.animation = 'none';
        }, 1000);
    }
    
    actualiseScore()
    {
        // let val = Number.parseInt(this.statistics.kills <= 0 ? 1 : this.statistics.kills) *
        // Number.parseInt(this.statistics.expGained <= 0 ? 1 : this.statistics.expGained) *
        // Number.parseInt(this.statistics.timePlayed);
    
        // console.log(val);
        // console.log( Number.parseInt(this.statistics.kills) *Number.parseInt(this.statistics.expGained) *Number.parseInt(this.statistics.timePlayed));
        // if (!isNaN(val)) {
        //     this.statistics.score = Number.parseInt(val);
        // }
    
        // console.log(Number.parseInt(this.statistics.score) + " : score");
    
        // return this.statistics.score;

        // S'assurer que les valeurs sont toujours des entiers positifs et au moins 1
        const kills = Math.max(1, Math.round(this.statistics.kills));
        const expGained = Math.max(1, Math.round(this.statistics.expGained));
        const timePlayed = Math.round(this.statistics.timePlayed);
        
        // Calcul du score selon la même formule que le backend
        const score = kills * expGained * timePlayed;
        
        // Vérifier et stocker le résultat
        if (!isNaN(score)) {
            this.statistics.score = score;
        }
        
        // Log unique et clair pour débogage
        //console.log(`Score calculé: ${this.statistics.score} (kills: ${kills}, exp: ${expGained}, time: ${timePlayed})`);
        
        return this.statistics.score;
    }
    
    playerDied() {  
        this.app.gameOver = true;
        console.log("Player died!");
        Joueur.Grid.pauseGrid(this.app);
        this.app.pause = true;

    
        // Log statistics for debugging
        this.actualiseScore();
        console.log(this.statistics.score + " : score");

        const seconde = ((this.statistics.timePlayed % 60000));
        const minute = ((this.statistics.timePlayed % 3600000)  - seconde);
        const heure = ((this.statistics.timePlayed % (3600000 * 60))  - minute - seconde);
        if (Math.abs(heure.toFixed(0)) > 0) {
            this.statistics.timeShown = Math.abs(heure.toFixed(0)) + "h " + 
            (minute.toFixed(0) / 60) + "min " + 
            seconde.toFixed(2) + "s";
        } else {
            this.statistics.timeShown = (minute.toFixed(0) / 60) + "min " + 
            seconde.toFixed(2) + "s";
        }
        
    
        // Create PIXI text object
        const gameOverText = new PIXI.Text("", {  
            fontFamily: 'calibri',
            stroke: 'white',      
            strokeThickness: 4, 
            fontSize: 72,
            fontWeight: 'bold',
            fill: 0xFF0000,
            align: 'center'
        }); 
        gameOverText.anchor.set(0.5);
        gameOverText.x = this.app.renderer.width / 2;
        gameOverText.y = this.app.renderer.height / 2;
        gameOverText.zIndex = 10000;
        Joueur.Event.currentMusic.stop();
        Joueur.Event.nextSongIs = "gameOver";
        Joueur.Event.nextSong = true;
        
        let text2 = "Game Over";
        this.app.stage.addChild(gameOverText);
        this.createResolver(gameOverText, text2);
    
        let targetY = this.app.renderer.height / 20;
        let speed = 2; 
    
        setTimeout(() => {
            const ticker = new PIXI.Ticker();
            ticker.add(() => {
                speed += 0.1;
                if (gameOverText.y > targetY) {
                    gameOverText.y -= speed; 
                } else {
                    gameOverText.y = targetY;
                    this.createStatsBoards();
                    if(this.statistics.jeton != null && this.statistics.jeton != undefined)
                    {
                        this.sendStatsToDB();
                    }
                    ticker.stop(); 
                }
            });
            ticker.start(); 
        }, 2000);
    }
    
    
    createResolver(object, text1) {
        let text = text1 || "";
        let options = {
            offset: 0,
            timeout: 15, 
            iterations: 10, 
            characters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'x', '#', '%', '&', '-', '+', '_', '?', '/', '\\', '='],
            resolveString: text || "",  
            element: object  // This will be the PIXI Text or HTML element
        };
    
        const resolver = {
            resolve: (options, callback) => this.resolve(options, callback) // Ensuring 'this' is preserved
        };
    
        resolver.resolve(options, () => {
            //console.log("Resolver effect finished!"); // Callback for when effect finishes
        });
    }
    
    resolve(options, callback) {
        const resolveString = options.resolveString;
        const combinedOptions = Object.assign({}, options, { resolveString: resolveString });
        this.doResolverEffect(combinedOptions, callback);
    }
    
    doResolverEffect(options, callback) {
        let resolveString = options.resolveString;
    
        // Ensure resolveString is a string before using substring()
        if (typeof resolveString !== "string") {
            if (resolveString && resolveString.text !== undefined) {
                // If it's a PIXI.Text object, use its text content
                resolveString = resolveString.text;
            } else if (resolveString instanceof HTMLElement) {
                // If it's an HTML element, use its innerText
                resolveString = resolveString.innerText;
            } else {
                //console.error("Invalid resolveString type:", resolveString);
                return;
            }
        }
    
        const characters = options.characters;
        const offset = options.offset;
        const partialString = resolveString.substring(0, offset);
    
        const combinedOptions = Object.assign({}, options, { partialString: partialString });
    
        this.doRandomiserEffect(combinedOptions, () => {
            const nextOptions = Object.assign({}, options, { offset: offset + 1 });
    
            if (offset <= resolveString.length) {
                this.doResolverEffect(nextOptions, callback);
            } else if (typeof callback === "function") {
                callback(); // Fixing callback invocation here
            }
        });
    }
    
    
    getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    randomCharacter(characters) {
        return characters[this.getRandomInteger(0, characters.length - 1)];
    }
    
    doRandomiserEffect(options, callback) {
        const characters = options.characters;
        const timeout = options.timeout;
        const element = options.element;  // PIXI Text or HTML element
        const partialString = options.partialString;
    
        if (!element) {
            //console.error("Element is undefined in doRandomiserEffect:", options);
            return;
        }
    
        let iterations = options.iterations;
    
        setTimeout(() => {
            if (iterations >= 0) {
                const nextOptions = Object.assign({}, options, { iterations: iterations - 1 });
    
                if (element instanceof PIXI.Text) {
                    element.text = "";  // Clear the text first for PIXI Text
                } else {
                    element.textContent = "";  // Clear the text first for HTML elements
                }
    
                if (iterations === 0) {
                    if (element instanceof PIXI.Text) {
                        element.text = partialString;  // Update PIXI text
                    } else {
                        element.textContent = partialString;  // Update HTML element's text
                    }
                } else {
                    const randomChar = this.randomCharacter(characters);
                    if (element instanceof PIXI.Text) {
                        element.text = partialString.substring(0, partialString.length - 1) + randomChar;  // Update PIXI text
                    } else {
                        element.textContent = partialString.substring(0, partialString.length - 1) + randomChar;  // Update HTML element's text
                    }
                }
    
                this.doRandomiserEffect(nextOptions, callback);
            } else if (typeof callback === "function") {
                callback();
            }
        }, timeout);
    }
    
    

    chooseClass()
    {
        const container = document.createElement("div");
        container.id = "upgrade-container";
        container.style.position = "absolute";
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)"; 
        container.style.display = "flex";
        container.style.gap = "2vw";
        container.style.zIndex = "1000";
        container.style.backgroundColor = "rgba(0, 0, 0, 0.0)";
        
        this.weapons.forEach((weapon) => {
            const card = document.createElement("div");
            this.createResolver(card, weapon);
            card.className = "card";
            card.style.width = "200px";
            card.style.borderRadius = "15px";
            card.style.overflow = "hidden";
            card.style.backgroundColor = "#2a2a2a";
            card.style.color = "white";
            card.style.textAlign = "center";
            card.style.padding = "15px";
            card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
            card.style.cursor = "pointer";
            card.style.userSelect = "none"; // Prevent text highlighting
            
            const description = document.createElement("p");
            description.textContent = weapon;
            description.style.fontFamily ="courier new";
            description.style.fontSize = "16px";
            description.style.userSelect = "none"; // Prevent text highlighting
            
            card.appendChild(description);
            card.addEventListener("click", () => {
                if(!document.body.contains(this.app.menu))
                {
                    Joueur.addupgrade(new Joueur.Upgrade(weapon));
                    Joueur.Grid.pauseGrid(this.app)
                    this.app.class = false;
                    this.app.pause = false;
                    this.body.visible = true;
                    this.hpText.visible = true;
                    this.healthBar.visible = true;
                    Joueur.Event.currentMusic.play();
                    document.body.removeChild(container);
                    
                }
            });
            container.appendChild(card);
        });
        
        document.body.appendChild(container);
    
    }


    async sendStatsToDB()
    {
        //J'enleve le domcontent... pcq on le fait dans une fonction async qui pourrait causer un bug avec les references this
        //document.addEventListener("DOMContentLoaded", async function(){
            
            // const score = this.actualiseScore();
            
                try {
                    const jeton = this.statistics.jeton;
                    // const kills = this.statistics.kills <= 0 ? 1 : this.statistics.kills;
                    // const expGained = this.statistics.expGained <= 0 ? 1 : this.statistics.expGained;
                    // const rawTimePlayed = parseInt(Math.round(this.statistics.timePlayed));
                    // console.log(rawTimePlayed + " : time played");
                    // //Le score est calculer de mm dans le backend
                    // const score = this.actualiseScore();
                    
                    // S'assurer que les valeurs sont toujours des entiers positifs et au moins 1
                    const kills = Math.max(1, Math.round(this.statistics.kills));
                    const expGained = Math.max(1, Math.round(this.statistics.expGained));
                    const timePlayed = Math.round(this.statistics.timePlayed);
                    
                    // Recalculer le score exactement comme le backend l'attend
                    const score = kills * expGained * timePlayed;

                    const formData = new FormData();
                    formData.append('jeton', jeton);
                    formData.append('ennemis', kills);
                    formData.append('experience', expGained);
                    formData.append('duree', timePlayed);
                    formData.append('score', score);

                    // Déboguer les valeurs envoyées
                    console.log("Valeurs envoyées au serveur:", {
                        jeton, kills, expGained, timePlayed, score
                    });
                    
                    // AJUSTER LE FETCH URL AU BESOIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    let response = await fetch('http://localhost/H2025_TCH099_02_S1/api/api.php/palmares/ajouter', {
                        method: 'POST',
                        body: formData
                    });


                    const responseText = await response.text();
                    console.log("RÃ©ponse du serveur:", responseText);

                    let data;
                    try {
                        data = JSON.parse(responseText);
                        if (data.reussite) {
                            console.log("Score ajouter succes!");
                        } else {
                            console.error("Erreur score ajouter", data.erreurs);
                        }
                    } catch (e) {
                        console.error("Failed to parse JSON:", e);
                        throw new Error("Invalid JSON response");
                    }
                    
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue lors de l\'envoi des statistiques: ' + error.message);
                }
        //});
    }
    createStatsBoards() {
        const container = document.createElement("div");
        container.id = "stats-container";
        container.style.position = "fixed";
        container.style.width = "40%";
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)"; 
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "10px";
        container.style.zIndex = "1000";
        //container.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        container.style.padding = "20px";
        container.style.borderRadius = "15px";
        //container.style.boxShadow = "0 4px 15px rgba(255, 5, 5, 0.3)";
    
        // Store reference for dynamic updates
        this.statElements = {};
    
        // Create the card for all stats
        const card = document.createElement("div");
        card.className = "stats-card";
        //card.style.width = "90%";
        card.style.borderRadius = "15px";
        card.style.overflow = "hidden";
        card.style.backgroundColor = "#2a2a2a";
        card.style.color = "white";
        card.style.textAlign = "center";
        card.style.padding = "15px";
        card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        card.style.cursor = "default";
        card.style.userSelect = "none"; 
        card.style.overscrollBehavior = "none";
        // Title for the card
        const cardTitle = document.createElement("h2");
        cardTitle.textContent = "Statistics";
        cardTitle.style.fontFamily = "courier new";
        cardTitle.style.fontSize = "32px";
        cardTitle.style.marginBottom = "20px";
        cardTitle.style.textAlign = "center";
        cardTitle.style.overscrollBehavior = "none";
        card.appendChild(cardTitle);
    
        // Loop through statistics object and create text for each
        for (let [statName, statValue] of Object.entries(this.statistics)) {

            if(statName != "jeton" && statName != "timePlayed")
            {
                const statRow = document.createElement("div");
                statRow.style.display = "flex";
                statRow.style.justifyContent = "space-between";
                statRow.style.marginBottom = "10px";
                statRow.style.padding = "5px 10px";
                statRow.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                statRow.style.borderRadius = "10px";
                statRow.style.overscrollBehavior = "none";
                // Stat name
                const name = document.createElement("div");
                this.createResolver(name, this.formatStatName(statName));
                name.textContent = this.formatStatName(statName);
                name.style.fontFamily = "courier new";
                name.style.fontSize = "18px";
                name.style.color = "#ccc";
        
                // Stat value
                const value = document.createElement("div");
                this.createResolver(value, statValue);
                value.textContent = statValue;
                value.style.fontFamily = "courier new";
                value.style.fontSize = "18px";
                value.style.fontWeight = "bold";
                value.style.color = "white";

        
                // Append to statRow
                statRow.appendChild(name);
                statRow.appendChild(value);
        
                // Store reference for dynamic updates
                this.statElements[statName] = value;
        
                // Append statRow to card
                card.appendChild(statRow);
            }
        }
      
        // Append card to container
        container.appendChild(card);
        document.body.appendChild(container);
        this.createEndButtons();
    }
    
    createEndButtons()
    {
        const container = document.createElement("div");
        container.id = "menuContainer";
        container.style.position = "absolute";
        container.style.top = "85%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.background = "rgba(0, 0, 0, 0.8)";
        container.style.padding = "20px";
        container.style.borderRadius = "10px";
        container.style.display = "flex";
        container.style.flexDirection = "row";
        container.style.alignItems = "center";
        container.style.zIndex = "1000000";
        container.style.gap = "50px";

        function createMenuItem(text, onClick) {
            const description = document.createElement("p");
            description.textContent = text;
            description.style.fontFamily ="courier new";
            description.style.fontSize = "16px";
            description.style.userSelect = "none";
            const item = document.createElement("div");
            
            item.style.width = "200px";
            item.style.borderRadius = "15px";
            item.style.overflow = "hidden";
            item.style.backgroundColor = "#2a2a2a";
            //item.style.color = "white";
            item.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
            item.style.cursor = "pointer";
            item.style.userSelect = "none";
    
            item.style.padding = "10px 20px";
            //item.style.background = "#fff";
            item.style.borderRadius = "5px";
            item.className = "card";
            item.style.cursor = "pointer";
            item.style.textAlign = "center";
            item.style.width = "100px";
            item.style.zIndex = "1000000";
            item.appendChild(description);
            item.addEventListener("click", onClick);
            return item;
        }
        const restart = createMenuItem("Restart", () => {
            location.reload(); // Reloads the page to restart
        });
        const exit = createMenuItem("Exit", () => {
            location.href = "../../../assets/pages/index.html";
        });


        container.append(restart,  exit);
        document.body.appendChild(container);
    }
    
    // Helper function to format stat names
    formatStatName(statName) {
        return statName.replace(/([A-Z])/g, " $1") // Add space before capital letters
                       .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
    }
    
    // Method to dynamically update stats
    updateStat(statName, newValue) {
        if (this.statElements && this.statElements[statName]) {
            this.statElements[statName].textContent = newValue;
        }
    }
    
    // get la distance d'attraction du joueur
    getMagDist()
    {
        return this.distanceDattraction;
    }
    setExplosionHit(bool){this.hasExplHit = bool;}
    getExplosionHit(){return this.hasExplHit;}
    // association des objets externes mstr et upg avec la classe joueur
    static addMonstre(Monstre)
    {
        Joueur.Monstre = Monstre;
    }
    static addupgrade(upg)
    {
        Joueur.upgrade = upg;
    }
    static addUpgrade(upg)
    {
        Joueur.Upgrade = upg;
    }
    static addExplosion(expl)
    {
        Joueur.Explosion = expl;
    }
    static addGrid(grid)
    {
        Joueur.Grid = grid;
    }
    static addEvent(event)
    {
        Joueur.Event = event;
    }

    // Getters et Setters
    setHP(hp)
    {
        this.currentHP = hp;
    }
    getHP()
    {
        return this.currentHP;
    }
    getX() {
        return this.body.x;
    }
    setX(x) {
        this.body.x = x;
    }
    getY() {
        return this.body.y;
    }
    setY(y) {
        this.body.y = y;
    }
    getCouleur() {
        return this.couleur;
    }   
    getVX() {
        return this.body.vx;
    }
    setVX(vx) {
        this.body.vx = vx;
    }
    getVY() {
        return this.body.vy;
    }
    setVY(vy) {
        this.body.vy = vy;
    }
    getWidth()
    {
        return this.body.width;
    }
    setWidth(w)
    {
        this.body.width = w;
    }
    getHeight()
    {
        return this.body.height;
    }
    setHeight(h)
    {
        this.body.height = h;
    }
    setVitesse(v)
    {
        this.vitesse = v;
    }
    getVitesse()
    {
        return this.vitesse;
    }


}


