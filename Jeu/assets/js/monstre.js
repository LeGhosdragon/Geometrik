/**
 * La classe Monstre gére leurs propriétés, leurs affichages, 
 * leurs déplacements et leurs interactions avec le joueur.
 */
export class Monstre {
    static monstres = [];
    static joueur = null;
    static cleanMonstres = [];
    static Explosion = null;
    static Shape3D = null;
    static Exp = null;
    static app = null;
    static Event = null;
    static showLife = false;
    static dedExpl = false;
    static dedEXP = true;
    static dedMilkMan = false;
    static milkMode = null;
    static gun = null;
    static Joueur = null;

    constructor(x, y, sides, size, type, vitesse = 1, spinSpeed = 0.02, baseHP = 100, exp = 1, baseDMG = 1, couleur = 0xff0000) {
        this.exp = exp;
        this.isIn = true;
        this.showLife = Monstre.showLife;
        this.size = size;
        this.vitesse = vitesse;
        this.spinSpeed = spinSpeed;
        this.couleur = couleur;
        this.sides = sides;
        this.type = type;
        this.baseHP = baseHP;
        this.currentHP = baseHP;
        this.baseDMG = baseDMG;
        this.body = this.createShape(x, y);
        this.hpText = this.createHPText();
        this.elapsedTime = 0;
        this.oscillates = true;
        this.spins = true;
        this.hasSwordHit = false;
        this.hasExplHit = false;
        this.hasBulletHit = false;
        this.radius = 0;
    }

    // Méthodes statiques pour configurer les réf globals pour l'app pixi,
    // les sphères d'expérience et l'explosion 
    static addApp(appInput) {
        Monstre.app = appInput;
    }
    static addExp(expInput) {
        Monstre.Exp = expInput;
    }
    static addExplosion(explInput) {
        Monstre.Explosion = explInput;
    }

    // Fonction pour créer la forme du monstre
    createShape(x = 0, y = 0) {
        const shape = new PIXI.Graphics();
        
        shape.x = x;
        shape.y = y;
        shape.sides = this.sides;
        shape.zIndex = 1;
        shape.pivot.set(0, 0);
        return shape;
    }

    // Calcul du vecteur directionnel pour déplacer le monstre vers le joueur
    vecteurVersLeJoueur(joueur) {
        let dx = joueur.getX() + joueur.getWidth() / 2 - this.getX();
        let dy = joueur.getY() + joueur.getHeight() / 2 - this.getY();
        let magnitude = Math.sqrt(dx * dx + dy * dy);
        
        return { x: this.vitesse * dx / magnitude, y: this.vitesse * dy / magnitude };
    }

    // mise a jour de l'apparence des monstre
    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3 * delta;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        if(Monstre.app.space) {
            this.body.lineStyle(3, ennemiColor, 1);
            this.body.beginFill(this.getContrastingColor(this.hexToRgb(ennemiColor)));
        } else {
            this.body.lineStyle(3, 0x000000, 1);
            this.body.beginFill(ennemiColor);
        }
    
        const radius = newSize * 50;
        const angleStep = (2 * Math.PI) / this.sides;
    
        this.body.moveTo(radius * Math.cos(0), radius * Math.sin(0));
        for (let i = 1; i <= this.sides; i++) {
            let angle = i * angleStep;
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }

        this.body.closePath();
        this.body.endFill();

        // S'assurer que le HP reste à jour
        this.updateHP();
    }

    // Fonction pour déplacer le monstre vers le joueur
    bouger(joueur, delta, deltaX, deltaY, ennemiColor) {
        let moveVector = this.vecteurVersLeJoueur(joueur);
        this.setX(this.getX() + (moveVector.x)*delta + deltaX);
        this.setY(this.getY() + (moveVector.y)*delta + deltaY);
        
        this.spins ? this.body.rotation += this.spinSpeed * delta : 0;
        this.avoidMonsterCollision();
        this.actualiserPolygone(delta, ennemiColor);

        if(this.showLife && this.currentHP > 0)
        {
            // Update HP text position
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
            this.hpText.text = this.currentHP;
        }
    }

    // Gérer les monstres qui sont sortis de l'écran
    static cleanup() {
        const screenWidth = Monstre.app.view.width;
        const screenHeight = Monstre.app.view.height;
    
        // Étendre la limite de 1/5 de la taille de l'écran
        const extraWidth = screenWidth * 1;
        const extraHeight = screenHeight * 1;
    
        Monstre.monstres.forEach(monstre => {
            let x = monstre.getX();
            let y = monstre.getY();
    
            let isIn =
                x > -extraWidth && x < screenWidth + extraWidth &&
                y > -extraHeight && y < screenHeight + extraHeight;
    
            if (!isIn) {
                //console.log("ITS OUT");
                monstre.isIn = false;
                Monstre.cleanMonstres.push(monstre);

                let index = Monstre.monstres.indexOf(monstre);
                if (index !== -1) {
                    Monstre.monstres.splice(index, 1);
                }
            }
        });
    }
    

    // éviter les collisions entre les monstres
    avoidMonsterCollision() {
        
        const minDistance = 85 * this.size;
        const avoidFactor = 1.2;

        Monstre.monstres.forEach(otherMonstre => {
            if (this === otherMonstre) return;
            let dx = this.getX() - otherMonstre.getX();
            let dy = this.getY() - otherMonstre.getY();
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance && this.type != "err404" && this.type != "bossTank" && this.type != "milkMan" && this.type != "bossBunny") {
                let angle = Math.atan2(dy, dx);
                let avoidX = Math.cos(angle) * avoidFactor;
                let avoidY = Math.sin(angle) * avoidFactor;
                this.setX(this.getX() + avoidX);
                this.setY(this.getY() + avoidY);
            }
        });
    }

    knockback(force, angle) {
        if (!this.body) {
            console.warn("Knockback failed: body is null");
            return;
        }
    
        this.knockbackX = Math.cos(angle) * force;
        this.knockbackY = Math.sin(angle) * force;
    
        let decayRate = 0.92;
        let duration = 10; // Frames
    
        let frames = 0;
        const applyKnockback = () => {
            if (frames >= duration || !this.body) {
                Monstre.app.ticker.remove(applyKnockback);
                return;
            }
    
            // S'assurer que les valeurs sont valides avant de les définir
            if (typeof this.getX !== "function" || typeof this.getY !== "function") {
                console.error("Error: getX or getY is not a function.");
                Monstre.app.ticker.remove(applyKnockback);
                return;
            }
    
            this.setX(this.getX() + this.knockbackX);
            this.setY(this.getY() + this.knockbackY);
    
            // Decay the knockback force over time
            this.knockbackX *= decayRate;
            this.knockbackY *= decayRate;
    
            frames++;
        };
    
        Monstre.app.ticker.add(applyKnockback);
    }
        
    

    // Création du texte affichant les points de vie du monstre et l'ajoute au PIXI
    createHPText() {
        const text = new PIXI.Text(this.currentHP, {
            fontFamily: 'Arial',
            fontSize: 26,
            fill: 0xFFFFFF,
            stroke: 0x000000,      
            strokeThickness: 4, 
            align: 'center'
        });

        text.anchor.set(0.5, 2);
        text.x = this.body.x;
        text.y = this.body.y;
        Monstre.app.stage.addChild(text);
        return text;
    }
    
    // Mise a jour des points de vie du monstre

    updateHP() {
        if (this.currentHP <= 0) {
            // Trigger l'animation de mort avant de le supprimer du jeu
            this.disintegrationAnimation();
    
            if (Monstre.dedExpl) {
                new Monstre.Explosion(this.getX(), this.getY(), this.body.width * 6, 50, 0xFF0000);
            }
            if (Monstre.dedEXP) {

                new Monstre.Exp(this.getX(), this.getY(), this.exp);
                if(this.type == "expBall")
                {
                    Monstre.Exp.expBuildUp = Monstre.Exp.expBuildUp/2;
                }
            }
            Monstre.joueur.statistics.kills += 1;
            // Supprimer le monstre de l'array 
            let index = Monstre.monstres.indexOf(this);
            if (index !== -1) {
                Monstre.monstres.splice(index, 1);
            }
    
            // Supprimer les graphiques du stage
            Monstre.app.stage.removeChild(this.hpText);
            Monstre.app.stage.removeChild(this.body);
    
            // Arrêt de toute animation ticker-based
            if (this.updateFn) {
                Monstre.app.ticker.remove(this.updateFn);
                this.updateFn = null; 
            }
    
            // Clean up des références pour le garbage collection
            this.hpText.destroy({ children: true });
            this.body.destroy({ children: true });
            this.hpText = null;
            this.body = null;

            if(this.type == "bossNormal")
            {
                Monstre.Event.boss["bossNormal"] = null;
                Monstre.Event.nextSong = true; 
            }
            if(this.type == "bossRunner")
            {
                Monstre.Event.boss["bossRunner"] = null;
                Monstre.Event.nextSong = true; 
            }
            if(this.type == "bossTank")
            {
                Monstre.Event.boss["bossTank"] = null;
                Monstre.Event.nextSong = true; 
            }
            if(this.type == "bossGunner")
            {
                Monstre.Event.boss["bossGunner"] = null;
                Monstre.Event.nextSong = true; 
            }
            if(this.type == "milkMan")
            {
                Monstre.milkMode(Monstre.app, Monstre.joueur, 0, Monstre, Monstre.gun, 0, Monstre.Joueur, Monstre.Event, true);

                Monstre.Event.boss["milkMan"] = null;
                Monstre.Event.nextSong = true; 
                Monstre.app.stage.removeChild(this.milkBody);
                this.milkBody.destroy();
            }

            return;
        }
    
        // Mise a jour ud texte HP si le joueur est encore en vie
        if (this.showLife) {
            this.hpText.text = this.currentHP;
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
        } else {
            Monstre.app.stage.removeChild(this.hpText);
        }
    }
    
    // Animation de mort du monstre
    // Génère des particules qui se dispersent et disparaissent progressivement.
    disintegrationAnimation() {
        const particleCount = 2;
        const particles = [];
        const gravity = 0.05; // force de gravité attire les particules vers le bas
        const drag = 0.98; // Drag pour les ralentir avec le temps
    
        // Creation des particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(this.couleur);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            particle.x = this.getX();
            particle.y = this.getY();
            particle.alpha = 1;
    
            // Vitesse initiales aléatoires
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 2 + 1;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
    
            Monstre.app.stage.addChild(particle);
            particles.push(particle);
        }
    
        // Mise a jour des particules
        const updateParticles = () => {
            for (let i = particles.length - 1; i >= 0; i--) {
                let particle = particles[i];
    
                particle.vy += gravity;
                particle.vx *= drag;
                particle.vy *= drag;
    
                // Déplacer la particle
                particle.x += particle.vx;
                particle.y += particle.vy;
    
                // Fade out
                particle.alpha -= 0.03;
    
                // Suprrimer les particules déja disparues
                if (particle.alpha <= 0 || particle.y > Monstre.app.view.height) {
                    Monstre.app.stage.removeChild(particle);
                    particle.destroy({ children: true }); // Ensures PIXI fully cleans it up
                    particles.splice(i, 1); // Remove from array
                }
            }
    
            // On arrête l'animation quand il reste plus de particules
            if (particles.length === 0) {
                Monstre.app.ticker.remove(updateParticles);
            }
        };
    
        // Add update function to PIXI ticker (better than `setInterval`)
        Monstre.app.ticker.add(updateParticles);
    }
    
    // Gestion de la perte de HP par le monstre selon le type de d'arme utilisé
    endommagé(dmg, weapon, crit) {
        crit ?  dmg = Math.ceil( dmg * Monstre.joueur.critDMG) : 0;
        Monstre.joueur.statistics.dmgDealt = (Monstre.joueur.statistics.dmgDealt + dmg);
        this.setHP(this.getHP() - dmg);
        this.createHitEffect(this, dmg, crit);
        
        if(weapon.type == "sword")
        {
            this.knockback(weapon.knockback, Math.atan2(this.getY() - (Monstre.joueur.getY() + Monstre.joueur.size), this.getX() - (Monstre.joueur.getX() + Monstre.joueur.size)));
            setTimeout(()=> {
                this.setSwordHit(false);
            }, 300);
        }
        if(weapon.type == "explosion")
        {
            if(this.type != "milkMan")
            {
                this.knockback(weapon.knockback, Math.atan2(this.getY() - (weapon.getY()), this.getX() - (weapon.getX())));
            }
            setTimeout(()=> {
                this.setExplosionHit(false);
            }, 500);
        }
        if(weapon.type == "gun")
        {
            this.knockback(weapon.knockback, Math.atan2(this.getY() - (Monstre.joueur.getY() + Monstre.joueur.size), this.getX() - (Monstre.joueur.getX() + Monstre.joueur.size)));
            setTimeout(()=> {
                this.setBulletHit(false);
            }, 10);
        }
        
        this.updateHP();
    }

    // Gestion de l'effet visuel lorsqu'un monstre subit des dégâts
    createHitEffect(monstre, damage, crit) {
        // Creation du texte de 
        let color = crit ? 0xFF0000 : 0xFFFFFF;

        const damageText = new PIXI.Text(damage, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: color,
            stroke: 0x000000,      // Black outline
            strokeThickness: 4, 
            align: 'center',
            fontWeight: 'bold'
        });
        damageText.zIndex = 101;
        // Set position initiale selon la position du monstre
        damageText.x = monstre.getX();
        damageText.y = monstre.getY();
    
        // Ajouter le texte de dégâts au stage
        Monstre.app.stage.addChild(damageText);
    
        // Set l'échelle initail et l'alpha
        damageText.scale.set(1);
        damageText.alpha = 1;
    
        // Stocker la référence de la fonction de mise à jour
        const updateFn = (delta) => this.damageText(damageText, updateFn);
    
        // Ajouter la fontion au ticker
        Monstre.app.ticker.add(updateFn);
    }
    
    // Méthode appelé a chque frame pour animer le texte de dégâts
    damageText(damageText, updateFn) {
        damageText.y -= 2; 
        damageText.alpha -= 0.05;  
        damageText.scale.x -= 0.01;
        damageText.scale.y -= 0.01;
    

        if (damageText.alpha <= 0) {
            Monstre.app.stage.removeChild(damageText);
            Monstre.app.ticker.remove(updateFn);  
            damageText.destroy({ children: true });
        }
    }

    getContrastingColor(r, g, b) {
        // Simply invert the RGB values for a contrasting color
        const contrastR = 255 - r;
        const contrastG = 255 - g;
        const contrastB = 255 - b;
    
        // Return the RGB color for the contrasting color
        return { r: contrastR, g: contrastG, b: contrastB };
    }
    // Function to extract RGB from a hex color code
    hexToRgb(hex) {
        const r = (hex >> 16) & 0xFF;
        const g = (hex >> 8) & 0xFF;
        const b = hex & 0xFF;
        return { r, g, b };
    }
    
    static addJoueur(joueurInput) {
        Monstre.joueur = joueurInput;
    }
    static addEvent(eventInput) {
        Monstre.Event = eventInput;
    }
    static addShape(shapeInput) {
        Monstre.Shape3D = shapeInput;
    }

    static addMilk(milkM, gun, Joueur)
    {
        Monstre.milkMode = milkM;
        Monstre.gun = gun;
        Monstre.Joueur = Joueur;
    }
    
        // Getters et Setters    

    getX() { return this.body.x; }
    setX(x) { this.body.x = x; }
    getY() { return this.body.y; }
    setY(y) { this.body.y = y; }
    getCouleur() { return this.couleur; }
    getWidth() { return this.body.width; }
    setWidth(w) { this.body.width = w; }
    getHeight() { return this.body.height; }
    setHeight(h) { this.body.height = h; }
    setHP(hp) { this.currentHP = hp; }
    getHP() { return this.currentHP; }
    setDMG(dmg) { this.baseDMG = dmg; }
    getDMG() { return this.baseDMG; }
    setSwordHit(bool){this.hasSwordHit = bool;}
    getSwordHit(){return this.hasSwordHit;}
    setExplosionHit(bool){this.hasExplHit = bool;}
    getExplosionHit(){return this.hasExplHit;}
    setBulletHit(bool){this.hasBulletHit = bool;}
    getBulletHit(){return this.hasBulletHit;}
}

/**
 * Les sous-classes de Monstre
 */

export class MonstreNormal extends Monstre {
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "normal";
        const size = 0.3;
        const speed = 1;
        const spinSpeed = 0.02;
        const baseHP = Math.round(25 * ennemiDifficultee**1.2);
        const exp = Math.round(2 + ennemiDifficultee/3);
        const baseDMG = Math.round(1 * ennemiDifficultee);
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
    }
}

export class MonstreRunner extends Monstre {
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "runner";
        const size = 0.25;
        const speed = 2.5;
        const spinSpeed = 0.04;
        const baseHP = Math.round(15 * ennemiDifficultee**1.2);
        const exp = Math.round(1 + ennemiDifficultee/3);
        const baseDMG = Math.round(1 * ennemiDifficultee);
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
    }
    
    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3 * delta;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        this.body.lineStyle(2, 0x000000, 1);
        this.body.beginFill(ennemiColor);

        const size = newSize * 50;
        const points = this.sides;
        this.body.drawStar(0, 0, points, size, size*0.6); // Draw a star

        // S'assurer que HP text reste à jour
        this.updateHP();
    }
}

export class MonstreTank extends Monstre {
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "tank";
        const size = 0.45;
        const speed = 0.4;
        const spinSpeed = 0.005;
        const baseHP = Math.round(50 * ennemiDifficultee**1.2);
        const exp = Math.round(4 + 4 * ennemiDifficultee/3);
        const baseDMG = Math.round(2 * ennemiDifficultee);
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
    }


    // mise a jour de l'apparence du monstre
    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3 * delta;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        // gérer les couleurs selon le thème ?
        if (Monstre.app.space) {
            this.body.lineStyle(3, ennemiColor, 1);
            this.body.beginFill(this.getContrastingColor(this.hexToRgb(ennemiColor)));
        } else {
            this.body.lineStyle(3, 0x000000, 1);
            this.body.beginFill(ennemiColor);
        }
    
        const radius = newSize * 50;
        const angleStep = (2 * Math.PI) / this.sides;
    
        this.body.moveTo(radius, 0);
        for (let i = 1; i <= this.sides; i++) {
            let angle = i * angleStep;
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }

        // inner shape of tank
        this.body.moveTo(0.5*radius, 0);
        for (let i = 0; i <= this.sides; i++) {
            let angle = i * angleStep;
            let x = 0.5*radius * Math.cos(angle);
            let y = 0.5*radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }
        for (let i = 0; i < this.sides; i++) {
            let angle = i * angleStep;
            this.body.moveTo(0.5*radius * Math.cos(angle), 0.5*radius * Math.sin(angle));
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }
        
        this.body.closePath();
        this.body.endFill();
        
        // S'assurer que le HP reste à jour
        this.updateHP();
    }
}

export class MonstreExp extends Monstre {
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "expBall";
        const size = 0.5;
        const speed = 0.2;
        const spinSpeed = 0.003;
        const baseHP = Math.round(250 * ennemiDifficultee**1.2);
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, 1, Monstre.Exp.expBuildUp);
    }
    actualiserPolygone() {
        if (this.sides < 3) return;
        
        // Generer les couleurs rainbow avec sine waves
        const r = Math.floor(127.5 * (1 + Math.sin(this.elapsedTime * 0.1)));
        const g = Math.floor(127.5 * (1 + Math.sin(this.elapsedTime * 0.1 + 2 * Math.PI / 3)));
        const b = Math.floor(127.5 * (1 + Math.sin(this.elapsedTime * 0.1 + 4 * Math.PI / 3)));
        const color = (r << 16) | (g << 8) | b;

        this.couleur = color;
        this.elapsedTime += 3;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        this.body.lineStyle(3, 0x000000, 1);
        this.body.beginFill(color);
    
        const radius = newSize * 50;
        const angleStep = (2 * Math.PI) / this.sides;
    
        this.body.moveTo(radius * Math.cos(0), radius * Math.sin(0));
    
        for (let i = 1; i <= this.sides; i++) {
            let angle = i * angleStep;
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }
        this.exp = Math.round(Monstre.Exp.expBuildUp);// + Monstre.joueur.reqExp;
    
        this.body.closePath();
        this.body.endFill();
    
        // S'aasure que le HP reste à jour
        this.updateHP();
    }

}
export class MonstreGunner extends Monstre {
    static bullets = [];
    
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "gunner";
        const size = 0.3;
        const speed = 1;
        const spinSpeed = 0;
        const baseHP = Math.round(15 * ennemiDifficultee**1.2);
        const exp = Math.round(4 + 4 * ennemiDifficultee/3);
        const baseDMG = Math.round(1 * ennemiDifficultee);
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
        this.shootInterval = 250;
        this.lastShotTime = 0;
        this.currentTime = 0;
        this.isOnCooldown = false;
        this.bulletSize = 8;
    }

    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3 * delta;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        if(Monstre.app.space) {
            this.body.lineStyle(3, ennemiColor, 1);
            this.body.beginFill(this.getContrastingColor(this.hexToRgb(ennemiColor)));
        } else {
            this.body.lineStyle(3, 0x000000, 1);
            this.body.beginFill(ennemiColor);
        }

        this.body.rotation = Math.atan2((Monstre.joueur.getY() + Monstre.joueur.size) - this.getY(), (Monstre.joueur.getX() + Monstre.joueur.size) - this.getX());
        const r = newSize * 50;
    
        this.body.moveTo(r*0.5, r*0.6);
        this.body.lineTo(r*0.5, r*-0.6);
        this.body.lineTo(r*1.4, r*-0.8);
        this.body.lineTo(r*1.4, r*0.8);
        this.body.lineTo(r*0.5, r*0.6);
        this.body.lineTo(r*-0.3, r*1.1);
        this.body.lineTo(r*-1.1, r*0);
        this.body.lineTo(r*-0.3, r*-1.1);
        this.body.lineTo(r*0.5, r*-0.6);

        this.body.closePath();
        this.body.endFill();

        // S'assurer que le HP reste à jour
        this.updateHP();
    }

    bouger(joueur, delta, deltaX, deltaY, ennemiColor) {
        this.currentTime++;
        const screenHeight = Monstre.app.view.height;
        let moveVector = this.vecteurVersLeJoueur(joueur);

        // Arrête de bouger si le monstre est trop proche du joueur
        if (screenHeight / 3 < Math.sqrt((joueur.getX() - this.getX()) ** 2 + (joueur.getY() - this.getY()) ** 2)) {
            this.setX(this.getX() + (moveVector.x) * delta + deltaX);
            this.setY(this.getY() + (moveVector.y) * delta + deltaY);
        } else {
            this.setX(this.getX() + deltaX);
            this.setY(this.getY() + deltaY);

            if (this.currentTime - this.lastShotTime >= this.shootInterval && !this.isOnCooldown) {
                this.shoot(joueur, delta, deltaX, deltaY);
                this.lastShotTime = this.currentTime;
                this.isOnCooldown = true;

                // Reset cooldown after the interval
                setTimeout(() => { this.isOnCooldown = false }, this.shootInterval);
            }
        }

        this.spins ? this.body.rotation += this.spinSpeed * delta : 0;
        this.avoidMonsterCollision();
        this.actualiserPolygone(delta, ennemiColor);

        if (this.showLife && this.currentHP > 0) {
            // Mise a jour de la position du HP text
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
            this.hpText.text = this.currentHP;
        }
    }

    shoot(joueur) {
        if (this.isOnCooldown) return;
        this.isOnCooldown = true;

        // Calcul de l'angle vers le joueur
        const angleToPlayer = Math.atan2((joueur.getY() + joueur.size) - this.getY(), (joueur.getX() + joueur.size) - this.getX());

        // Créer une balle et inisialiser ses propriétés
        const bullet = new PIXI.Graphics();
        bullet.radius = this.bulletSize;
        bullet.lineStyle(3, 0xFFFFFF, 1);
        bullet.beginFill(0xFF0000);
        bullet.drawCircle(0, 0, bullet.radius);
        bullet.endFill();
        
        const gunLength = 30;
        bullet.x = this.getX() + Math.cos(angleToPlayer) * gunLength;
        bullet.y = this.getY() + Math.sin(angleToPlayer) * gunLength;

        // Inisiliser l'angle et la direction de la balle
        bullet.angle = angleToPlayer;
        bullet.speed = 3;

        Monstre.app.stage.addChild(bullet);
        MonstreGunner.bullets.push(bullet);

        setTimeout(() => (this.isOnCooldown = false), 1000 * this.shootInterval);
    }

    static updateBullets(delta, deltaX, deltaY, joueur) {
        for (let i = MonstreGunner.bullets.length - 1; i >= 0; i--) {
            let b = MonstreGunner.bullets[i];

            // Mise a jour de la position de la nalle selon son angle
            b.x += Math.cos(b.angle) * b.speed * delta + deltaX;
            b.y += Math.sin(b.angle) * b.speed * delta + deltaY;

            // Enlever les balles qui sont off-screen
            if (b.x < -b.radius || b.x > Monstre.app.view.width + b.radius ||
                b.y < -b.radius || b.y > Monstre.app.view.height + b.radius || MonstreGunner.isBulletCollidingWithJoueur(joueur)) {
                Monstre.app.stage.removeChild(b);
                b.destroy({ children: true, texture: true, baseTexture: true });
                MonstreGunner.bullets.splice(i, 1);
            }
        }
    }

    // Méthode pout vérifier si une balle entre en collision avec le joueur 
    static isBulletCollidingWithJoueur(joueur) {
        for (let i = MonstreGunner.bullets.length - 1; i >= 0; i--) {
            let bullet = MonstreGunner.bullets[i];
            if (!bullet) continue;

            const bulletBounds = bullet.getBounds();
            const joueurBounds = joueur.body.getBounds();
            if (
                bulletBounds.x < joueurBounds.x + joueurBounds.width &&
                bulletBounds.x + bulletBounds.width > joueurBounds.x &&
                bulletBounds.y < joueurBounds.y + joueurBounds.height &&
                bulletBounds.y + bulletBounds.height > joueurBounds.y
            ) {
                MonstreGunner.onBulletHitPlayer(joueur);
                Monstre.app.stage.removeChild(bullet);
                bullet.destroy({ children: true, texture: true, baseTexture: true });
                MonstreGunner.bullets.splice(i, 1);
            }
        }
    }
    
    // Gestion des effets quand une balle touche le joueur
    static onBulletHitPlayer(joueur) {
        if(!joueur.isImmune)
        {
            joueur.endommagé(1);
            joueur.isImmune = true;
            setTimeout(() => {joueur.isImmune = false;}, 750);
        }
    }
}



export class BossNormal extends Monstre {
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "bossNormal";
        const size = 1.2;
        const speed = 2;
        const spinSpeed = 0.01;
        const baseHP = Math.round(25 * ennemiDifficultee**1.2)*100;
        const exp = Math.round(2 * ennemiDifficultee/3)*100;
        const baseDMG = Math.round(1 * ennemiDifficultee)*10;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
    }
}
export class BossTank extends Monstre {
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "bossTank";
        const size = 3;
        const speed = 1.3;
        const spinSpeed = 0.005;
        const baseHP = Math.round(50 * ennemiDifficultee**1.2)*25;
        const exp = Math.round(4 + 4 * ennemiDifficultee/3)*10;
        const baseDMG = Math.round(2 * ennemiDifficultee);
        super(x, y, 8, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
        this.baseBaseDMG = this.baseDMG;
        this.baseExp = this.exp;
        this.baseBaseHP = this.baseHP;
    }

    // mise a jour de l'apparence du monstre
    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3 * delta;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        // gérer les couleurs selon le thème ?
        if (Monstre.app.space) {
            this.body.lineStyle(3, ennemiColor, 1);
            this.body.beginFill(this.getContrastingColor(this.hexToRgb(ennemiColor)));
        } else {
            this.body.lineStyle(3, 0x000000, 1);
            this.body.beginFill(ennemiColor);
        }
        this.size += 0.001;
        this.radius = newSize * 15;
        const angleStep = (2 * Math.PI) / this.sides;
    
        this.body.moveTo(this.radius, 0);
        for (let i = 1; i <= this.sides; i++) {
            let angle = i * angleStep;
            let x = this.radius * Math.cos(angle);
            let y = this.radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }

        this.baseDMG = this.baseBaseDMG * this.size;
        this.exp = this.baseExp * this.size;
        this.baseHP = this.baseBaseHP  * this.size;

        // inner shape of tank
        this.body.moveTo(0.5*this.radius, 0);
        for (let i = 0; i <= this.sides; i++) {
            let angle = i * angleStep;
            let x = 0.5*this.radius * Math.cos(angle);
            let y = 0.5*this.radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }
        for (let i = 0; i < this.sides; i++) {
            let angle = i * angleStep;
            this.body.moveTo(0.5*this.radius * Math.cos(angle), 0.5*this.radius * Math.sin(angle));
            let x = this.radius * Math.cos(angle);
            let y = this.radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }

        this.body.closePath();
        this.body.endFill();
        
        // S'assurer que le HP reste à jour
        this.updateHP();
    }
}

export class BossRunner extends Monstre {
    wooshCounter = null;
    moveVector = null;
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "bossRunner";
        const size = 1;
        const speed = 8;
        const spinSpeed = 0.1;
        const baseHP = Math.round(25 * ennemiDifficultee**1.2)*80;
        const exp = Math.round(2 * ennemiDifficultee/3)*100;
        const baseDMG = Math.round(1 * ennemiDifficultee)*5;
        
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
        this.wooshCounter = 110;
    }

    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3 * delta;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        this.body.lineStyle(5, ennemiColor, 1);
        this.body.beginFill(0x000000);

        const size = newSize * 50;
        //const points = this.sides;
        this.body.drawStar(0, 0, 6, size, size*0.6); // Draw a star

        // S'assurer que HP text reste à jour
        this.updateHP();
    }

    // Fonction pour déplacer le monstre vers le joueur
    bouger(joueur, delta, deltaX, deltaY, ennemiColor) {
        if (this.wooshCounter == 110) {
            this.moveVector = this.vecteurVersLeJoueur(joueur);
            this.wooshCounter = 0;
        } else {
            this.wooshCounter++;
        }
        
        this.setX(this.getX() + (this.moveVector.x)*delta + deltaX);
        this.setY(this.getY() + (this.moveVector.y)*delta + deltaY);
        
        this.spins ? this.body.rotation += this.spinSpeed * delta : 0;
        this.avoidMonsterCollision();
        this.actualiserPolygone(delta, ennemiColor);

        if(this.showLife && this.currentHP > 0)
        {
            // Update HP text position
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
            this.hpText.text = this.currentHP;
        }
    }
}

export class MilkMan extends Monstre {
    static bullets = [];
    static baseDMG = 1;
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "milkMan";
        const size = 1.2;
        const speed = 2;
        const spinSpeed = 0.01;
        const baseHP = Math.round(25 * ennemiDifficultee**1.2)*10;
        const exp = Math.round(2 * ennemiDifficultee/3)*100;
        const baseDMG = Math.round(1 * ennemiDifficultee)*1;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
        this.milkBody = this.createBody();
        this.shootInterval = 40;
        this.lastShotTime = 0;
        this.currentTime = 0;
        this.isOnCooldown = false;
        this.bulletSize = 8*3;
        MilkMan.baseDMG = this.baseDMG;
    }
    createBody() {
        let milkBody = new PIXI.Sprite.from("../images/milkMan.png");        
        milkBody.width = 300;
        milkBody.height = 300;
        milkBody.zIndex = 1000000;
        milkBody.x = this.body.x;
        milkBody.y = this.body.y;


        Monstre.app.stage.addChild(milkBody);
        return milkBody;
    }
    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;

        this.elapsedTime += 3 * delta;

        this.body.clear();
        if(Monstre.app.space) {
            this.body.lineStyle(3, ennemiColor, 1);
            this.body.beginFill(this.getContrastingColor(this.hexToRgb(ennemiColor)));
        } else {
            this.body.lineStyle(3, 0x000000, 1);
            this.body.beginFill(ennemiColor);
        }
    
        const radius = this.size * 70;
        const angleStep = (2 * Math.PI) / this.sides;
    
        this.body.moveTo(radius * Math.cos(0), radius * Math.sin(0));
        for (let i = 1; i <= this.sides; i++) {
            let angle = i * angleStep;
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }
        this.milkBody.x = this.body.x - this.milkBody.width/2;
        this.milkBody.y = this.body.y- this.milkBody.height/2;
        this.body.closePath();
        this.body.endFill();
        this.body.zIndex = -1;
        this.body.visible = false;
        // S'assurer que le HP reste à jour
        this.updateHP();
    }
    bouger(joueur, delta, deltaX, deltaY, ennemiColor) {
        this.currentTime++;
        const screenHeight = Monstre.app.view.height;
        let moveVector = this.vecteurVersLeJoueur(joueur);

        // Arrête de bouger si le monstre est trop proche du joueur
        if (screenHeight / 2 < Math.sqrt((joueur.getX() - this.getX()) ** 2 + (joueur.getY() - this.getY()) ** 2)) {
            this.setX(this.getX() + (moveVector.x) * delta + deltaX);
            this.setY(this.getY() + (moveVector.y) * delta + deltaY);
        } else {
            this.setX(this.getX() + deltaX);
            this.setY(this.getY() + deltaY);

            if (this.currentTime - this.lastShotTime >= this.shootInterval && !this.isOnCooldown) {
                this.shoot(joueur, delta, deltaX, deltaY);
                this.lastShotTime = this.currentTime;
                this.isOnCooldown = true;

                // Reset cooldown after the interval
                setTimeout(() => { this.isOnCooldown = false }, this.shootInterval);
            }
        }

        this.spins ? this.body.rotation += this.spinSpeed * delta : 0;
        this.avoidMonsterCollision();
        this.actualiserPolygone(delta, ennemiColor);

        if (this.showLife && this.currentHP > 0) {
            // Mise a jour de la position du HP text
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
            this.hpText.text = this.currentHP;
        }
    }
    shoot(joueur) {
        if (this.isOnCooldown) return;
        this.isOnCooldown = true;
    
        const angleToPlayer = Math.atan2((joueur.getY() + joueur.size) - this.getY(), 
                                         (joueur.getX() + joueur.size) - this.getX());
    
        const bullet = new PIXI.Container(); // Use a container to hold both graphics and sprite
        bullet.radius = this.bulletSize;
        bullet.speed = 4;
        bullet.angle = angleToPlayer;
        bullet.x = this.getX() + Math.cos(angleToPlayer) * 30; // Gun length offset
        bullet.y = this.getY() + Math.sin(angleToPlayer) * 30;
    
        // Create bullet sprite
        bullet.img = PIXI.Sprite.from("../images/grossMilk.png");
        bullet.img.width = this.bulletSize*4;
        bullet.img.height = this.bulletSize*4;
        bullet.img.anchor.set(0.5); // Center the pivot at the middle
        bullet.addChild(bullet.img);
    
        Monstre.app.stage.addChild(bullet);
        MilkMan.bullets.push(bullet);
    
        setTimeout(() => (this.isOnCooldown = false), 1000 * this.shootInterval);
    }
    
    
    
    static updateBullets(delta, deltaX, deltaY, joueur, monstres) {
        for (let i = MilkMan.bullets.length - 1; i >= 0; i--) {
            let b = MilkMan.bullets[i];
    
            if (!b || !b.img) continue;
    
            b.img.rotation += 0.2 * delta;
    
            // Move bullet
            b.x += Math.cos(b.angle) * b.speed * delta + deltaX;
            b.y += Math.sin(b.angle) * b.speed * delta + deltaY;
    
            // Check collision with each monster
            for (let monstre of Monstre.monstres) {
                MilkMan.isBulletCollidingWithMonster(monstre);
            }
            let offScreen = false;
            offScreen = b.x < -b.radius || b.x > Monstre.app.view.width + b.radius ||
                              b.y < -b.radius || b.y > Monstre.app.view.height + b.radius;

    
            if (offScreen || MilkMan.isBulletCollidingWithJoueur(joueur, b)) {
                new Monstre.Explosion(b.x, b.y, b.radius * 12, MilkMan.baseDMG, 0xFFFFFF);
                console.log(this.baseDMG);
                Monstre.app.stage.removeChild(b);
                b.destroy({ children: true });
                MilkMan.bullets.splice(i, 1);
            }
        }
    }
    static isBulletCollidingWithMonster(monstre, bullet) {
        if (!monstre || !monstre.body || monstre.type == "milkMan") return;
        

            if (!bullet || !monstre.body)  return false;
    
 
            const bulletBounds = bullet.getBounds();
            const monstreBounds = monstre.body.getBounds();
            if (
                bulletBounds.x < monstreBounds.x + monstreBounds.width &&
                bulletBounds.x + bulletBounds.width > monstreBounds.x &&
                bulletBounds.y < monstreBounds.y + monstreBounds.height &&
                bulletBounds.y + bulletBounds.height > monstreBounds.y
            ) {
                return true;
            }
            
           
        
        return false;
    }
    

    
    static isBulletCollidingWithJoueur(joueur, b) {
        const bulletsToRemove = []; // Array to store bullets that need to be removed
    
        // Skip invalid bullets early
        try{
            if (b && b.img && b.img.parent) {
                const bulletBounds = b.getBounds();
                const joueurBounds = joueur.body.getBounds();

                // Check if bullet collides with the player
                if (
                    bulletBounds.x < joueurBounds.x + joueurBounds.width &&
                    bulletBounds.x + bulletBounds.width > joueurBounds.x &&
                    bulletBounds.y < joueurBounds.y + joueurBounds.height &&
                    bulletBounds.y + bulletBounds.height > joueurBounds.y
                ) {
                    MilkMan.onBulletHitPlayer(joueur);

                    // Store the bullet to be removed after the loop
                    bulletsToRemove.push(b);
                }
            }
        }
        catch(e){}
        // Remove bullets outside of the loop to avoid interference during iteration
        bulletsToRemove.forEach(bullet => {
            if (bullet && bullet.img && bullet.img.parent) {
                // Remove the bullet from the stage and destroy it properly
                Monstre.app.stage.removeChild(bullet);
                bullet.destroy({ texture: true, baseTexture: true });
                //bullet.destroy({ children: true });
            }
        });

        // Update MilkMan.bullets array by filtering out the removed bullets
        MilkMan.bullets = MilkMan.bullets.filter(b => !bulletsToRemove.includes(b));
    
    }
    
    


    
    // Gestion des effets quand une balle touche le joueur
    static onBulletHitPlayer(joueur) {
        new Monstre.Explosion(Monstre.joueur.getX(), Monstre.joueur.getY(), 300, this.baseDMG, 0xFFFFFF);
        if(!joueur.isImmune)
        {
            joueur.endommagé(2);
            joueur.isImmune = true;
            setTimeout(() => {joueur.isImmune = false;}, 250);
        }
    }
}


export class BossGunner extends Monstre {
    static bullets = [];
    
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "bossGunner";
        const size = 1;
        const speed = 0.7;
        const spinSpeed = 0;
        const baseHP = Math.round(15 * ennemiDifficultee**1.2 * 100);
        const exp = Math.round(4 + 4 * ennemiDifficultee/3) * 100;
        const baseDMG = Math.round(1 * ennemiDifficultee);
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
        this.shootInterval = 25;
        this.lastShotTime = 0;
        this.currentTime = 0;
        this.isOnCooldown = false;
        this.bulletSize = 8*3;
    }

    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3 * delta;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        if(Monstre.app.space) {
            this.body.lineStyle(3, ennemiColor, 1);
            this.body.beginFill(this.getContrastingColor(this.hexToRgb(ennemiColor)));
        } else {
            this.body.lineStyle(3, 0x000000, 1);
            this.body.beginFill(ennemiColor);
        }

        this.body.rotation = Math.atan2((Monstre.joueur.getY() + Monstre.joueur.size) - this.getY(), (Monstre.joueur.getX() + Monstre.joueur.size) - this.getX());
        const r = newSize * 50;
    
        this.body.moveTo(r*0.5, r*0.6);
        this.body.lineTo(r*0.5, r*-0.6);
        this.body.lineTo(r*1.4, r*-0.8);
        this.body.lineTo(r*1.4, r*0.8);
        this.body.lineTo(r*0.5, r*0.6);
        this.body.lineTo(r*-0.3, r*1.1);
        this.body.lineTo(r*-1.1, r*0);
        this.body.lineTo(r*-0.3, r*-1.1);
        this.body.lineTo(r*0.5, r*-0.6);

        this.body.closePath();
        this.body.endFill();

        // S'assurer que le HP reste à jour
        this.updateHP();
    }

    bouger(joueur, delta, deltaX, deltaY, ennemiColor) {
        this.currentTime++;
        const screenHeight = Monstre.app.view.height;
        let moveVector = this.vecteurVersLeJoueur(joueur);

        // Arrête de bouger si le monstre est trop proche du joueur
        if (screenHeight / 2 < Math.sqrt((joueur.getX() - this.getX()) ** 2 + (joueur.getY() - this.getY()) ** 2)) {
            this.setX(this.getX() + (moveVector.x) * delta + deltaX);
            this.setY(this.getY() + (moveVector.y) * delta + deltaY);
        } else {
            this.setX(this.getX() + deltaX);
            this.setY(this.getY() + deltaY);

            if (this.currentTime - this.lastShotTime >= this.shootInterval && !this.isOnCooldown) {
                this.shoot(joueur, delta, deltaX, deltaY);
                this.lastShotTime = this.currentTime;
                this.isOnCooldown = true;

                // Reset cooldown after the interval
                setTimeout(() => { this.isOnCooldown = false }, this.shootInterval);
            }
        }

        this.spins ? this.body.rotation += this.spinSpeed * delta : 0;
        this.avoidMonsterCollision();
        this.actualiserPolygone(delta, ennemiColor);

        if (this.showLife && this.currentHP > 0) {
            // Mise a jour de la position du HP text
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
            this.hpText.text = this.currentHP;
        }
    }

    shoot(joueur) {
        if (this.isOnCooldown) return;
        this.isOnCooldown = true;

        // Calcul de l'angle vers le joueur
        const angleToPlayer = Math.atan2((joueur.getY() + joueur.size) - this.getY(), (joueur.getX() + joueur.size) - this.getX());

        // Créer une balle et inisialiser ses propriétés
        const bullet = new PIXI.Graphics();
        bullet.radius = this.bulletSize;
        bullet.lineStyle(3, 0xFFFFFF, 1);
        bullet.beginFill(0xFF0000);
        bullet.drawCircle(0, 0, bullet.radius);
        bullet.endFill();
        
        const gunLength = 30;
        bullet.x = this.getX() + Math.cos(angleToPlayer) * gunLength;
        bullet.y = this.getY() + Math.sin(angleToPlayer) * gunLength;

        // Inisiliser l'angle et la direction de la balle
        bullet.angle = angleToPlayer;
        bullet.speed = 7;

        Monstre.app.stage.addChild(bullet);
        MonstreGunner.bullets.push(bullet);

        setTimeout(() => (this.isOnCooldown = false), 1000 * this.shootInterval);
    }

    static updateBullets(delta, deltaX, deltaY, joueur) {
        for (let i = MonstreGunner.bullets.length - 1; i >= 0; i--) {
            let b = MonstreGunner.bullets[i];

            // Mise a jour de la position de la nalle selon son angle
            b.x += Math.cos(b.angle) * b.speed * delta + deltaX;
            b.y += Math.sin(b.angle) * b.speed * delta + deltaY;

            // Enlever les balles qui sont off-screen
            if (b.x < -b.radius || b.x > Monstre.app.view.width + b.radius ||
                b.y < -b.radius || b.y > Monstre.app.view.height + b.radius || MonstreGunner.isBulletCollidingWithJoueur(joueur)) {
                Monstre.app.stage.removeChild(b);
                b.destroy({ children: true, texture: true, baseTexture: true });
                MonstreGunner.bullets.splice(i, 1);
            }
        }
    }

    // Méthode pout vérifier si une balle entre en collision avec le joueur 
    static isBulletCollidingWithJoueur(joueur) {
        for (let i = MonstreGunner.bullets.length - 1; i >= 0; i--) {
            let bullet = MonstreGunner.bullets[i];
            if (!bullet) continue;

            const bulletBounds = bullet.getBounds();
            const joueurBounds = joueur.body.getBounds();
            if (
                bulletBounds.x < joueurBounds.x + joueurBounds.width &&
                bulletBounds.x + bulletBounds.width > joueurBounds.x &&
                bulletBounds.y < joueurBounds.y + joueurBounds.height &&
                bulletBounds.y + bulletBounds.height > joueurBounds.y
            ) {
                MonstreGunner.onBulletHitPlayer(joueur);
                Monstre.app.stage.removeChild(bullet);
                bullet.destroy({ children: true, texture: true, baseTexture: true });
                MonstreGunner.bullets.splice(i, 1);
            }
        }
    }
    
    // Gestion des effets quand une balle touche le joueur
    static onBulletHitPlayer(joueur) {
        if(!joueur.isImmune)
        {
            joueur.endommagé(1);
            joueur.isImmune = true;
            setTimeout(() => {joueur.isImmune = false;}, 750);
        }
    }
}
export class Err404 extends Monstre {
    static shapes = [];
    
    constructor(x, y, sides = 10, ennemiDifficultee) {
        const shapeNum = 50;
        const type = "err404";
        const size = 2;
        const speed = 2;
        const spinSpeed = 0.01;
        const baseHP = Math.round(25 * ennemiDifficultee**1.2) * 20;
        const exp = Math.round(2 * ennemiDifficultee / 3) * 100;
        const baseDMG = Math.round(1 * ennemiDifficultee);
        super(x, y, 15, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
        this.count = 0;
        this.shapeNum = shapeNum;
        this.attachedShapes = [];
        this.createBody();
    }
    

    createBody() {
        for (let i = 0; i < this.shapeNum; i++) {
            let vertices, edges;
            ({ vertices, edges } = Monstre.Shape3D.createCube(300));
            
            // Create shape at monster's position
            let shape = new Monstre.Shape3D(Monstre.app, vertices, edges, this.body.x, this.body.y, Math.random(), true);
            shape.boss = true;
            // Attach to monster
            this.attachedShapes.push(shape);
            Monstre.Shape3D.shapes.push(shape);
        }
    }
    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        if(this.count > 20)
        {
            this.vitesse = Math.random() * 4;
            this.count = 0;
        }
        this.count+=1*delta;

        this.elapsedTime += 3 * delta;

        this.body.clear();
        if(Monstre.app.space) {
            this.body.lineStyle(3, ennemiColor, 1);
            this.body.beginFill(this.getContrastingColor(this.hexToRgb(ennemiColor)));
        } else {
            this.body.lineStyle(3, 0x000000, 1);
            this.body.beginFill(ennemiColor);
        }
    
        const radius = this.size * 70;
        const angleStep = (2 * Math.PI) / this.sides;
    
        this.body.moveTo(radius * Math.cos(0), radius * Math.sin(0));
        for (let i = 1; i <= this.sides; i++) {
            let angle = i * angleStep;
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }

        this.body.closePath();
        this.body.endFill();
        this.body.zIndex = -1;
        this.body.visible = false;
        // S'assurer que le HP reste à jour
        this.updateHP();
    }

    updateHP() {
        if (this.currentHP <= 0) {
            if (Monstre.dedExpl) new Monstre.Explosion(this.getX(), this.getY(), this.body.width * 6, 50, 0xFF0000);
            Monstre.joueur.statistics.kills += 1;

            let index = Monstre.monstres.indexOf(this);
            if (index !== -1) {
                Monstre.monstres.splice(index, 1);
            }

            // Remove shapes from scene when monster dies
            for (let shape of this.attachedShapes) {
                let shapeIndex = Monstre.Shape3D.shapes.indexOf(shape);
                if (shapeIndex !== -1) {
                    Monstre.Shape3D.shapes.splice(shapeIndex, 1);
                }
                shape.graphics.clear();
            }
            this.attachedShapes = [];


            // Remove monster from stage
            Monstre.app.stage.removeChild(this.hpText);
            Monstre.app.stage.removeChild(this.body);

            if (this.updateFn) {
                Monstre.app.ticker.remove(this.updateFn);
                this.updateFn = null; 
            }

            this.hpText.destroy({ children: true });
            this.body.destroy({ children: true });
            this.hpText = null;
            this.body = null;
            if(this.type == "err404")
            {
                Monstre.Event.boss["err404"] = null;
                Monstre.Event.nextSong = true; 
            }
            return;
        }

        if (this.showLife) {
            this.hpText.text = this.currentHP;
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
        } else {
            Monstre.app.stage.removeChild(this.hpText);
        }
    }
}
export class BossBunny extends Monstre {
    constructor(x, y, sides, ennemiDifficultee) {
        const type = "bossBunny";
        const size = 1.2;
        const speed = 2;
        const spinSpeed = 0.01;
        const baseHP = Math.round(25 * ennemiDifficultee ** 1.2) * 50;
        const exp = Math.round(2 * ennemiDifficultee / 3) * 100;
        const baseDMG = Math.round(1 * ennemiDifficultee) * 5;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp, baseDMG);
        this.alt = false;
    }
    
    // Crée une explosion autour du boss
    createExplosion() {
        this.vitesse = 0;
        const radius = this.body.width * 5;
        const explosionDamage = 10;
        const explosionColor = 0xFFFFFF;
        const isEnnemy = true;

        setTimeout(() => {
            this.vitesse = 2;
            new Monstre.Explosion(this.getX(), this.getY(), radius, explosionDamage, explosionColor, isEnnemy);
        }, 2000);    
    }

    // Fait sauter le boss vers le joueur
    jumpTowardsPlayer() {
        this.vitesse +=6;
        setTimeout(() => {this.vitesse-=6}, 700);
    }

    activatePower()
    {
        if(this.alt) {
            this.createExplosion();
            this.alt = false;
        }
        else {
            this.jumpTowardsPlayer();
            this.alt = true;
        }
    }

    // Dessine le BossBunny en forme de lapin à l'aide de formes géométriques
    actualiserPolygone(delta, ennemiColor) {
        // Efface l’ancien dessin
        this.body.clear();

        // Définir le style de ligne et la couleur de remplissage
        if(Monstre.app.space) {
            this.body.lineStyle(3, ennemiColor, 1);
            this.body.beginFill(this.getContrastingColor(this.hexToRgb(ennemiColor)));
        } else {
            this.body.lineStyle(3, 0x000000, 1);
            this.body.beginFill(ennemiColor);
        }
        const base = this.size * 50;

        // Oreille gauche
        this.body.moveTo(-0.2 * base, -0.9 * base);
        this.body.lineTo(-0.3 * base, -1.4 * base);
        this.body.lineTo(-0.1 * base, -0.9 * base);
        this.body.closePath();

        // Oreille droite
        this.body.moveTo(0.2 * base, -0.9 * base);
        this.body.lineTo(0.3 * base, -1.4 * base);
        this.body.lineTo(0.1 * base, -0.9 * base);
        this.body.closePath();

        // Tête (polygone anguleux)
        this.body.moveTo(-0.4 * base, -0.7 * base);
        this.body.lineTo(0.4 * base, -0.7 * base);
        this.body.lineTo(0.5 * base, -0.4 * base);
        this.body.lineTo(0.3 * base, -0.2 * base);
        this.body.lineTo(-0.3 * base, -0.2 * base);
        this.body.lineTo(-0.5 * base, -0.4 * base);
        this.body.closePath();

        // Corps
        this.body.moveTo(-0.5 * base, -0.2 * base);
        this.body.lineTo(-0.7 * base, 0.4 * base);
        this.body.lineTo(-0.4 * base, 0.8 * base);
        this.body.lineTo(0.4 * base, 0.8 * base);
        this.body.lineTo(0.7 * base, 0.4 * base);
        this.body.lineTo(0.5 * base, -0.2 * base);
        this.body.closePath();

        // Patte avant gauche
        this.body.moveTo(-0.4 * base, 0.6 * base);
        this.body.lineTo(-0.5 * base, 1.0 * base);
        this.body.lineTo(-0.3 * base, 1.0 * base);
        this.body.lineTo(-0.2 * base, 0.6 * base);
        this.body.closePath();

        // Patte avant droite
        this.body.moveTo(0.4 * base, 0.6 * base);
        this.body.lineTo(0.5 * base, 1.0 * base);
        this.body.lineTo(0.3 * base, 1.0 * base);
        this.body.lineTo(0.2 * base, 0.6 * base);
        this.body.closePath();

        // Patte arrière gauche
        this.body.moveTo(-0.6 * base, 0.4 * base);
        this.body.lineTo(-0.8 * base, 0.9 * base);
        this.body.lineTo(-0.5 * base, 0.9 * base);
        this.body.lineTo(-0.4 * base, 0.4 * base);
        this.body.closePath();

        // Patte arrière droite
        this.body.moveTo(0.6 * base, 0.4 * base);
        this.body.lineTo(0.8 * base, 0.9 * base);
        this.body.lineTo(0.5 * base, 0.9 * base);
        this.body.lineTo(0.4 * base, 0.4 * base);
        this.body.closePath();

        // Queue
        this.body.moveTo(0.7 * base, 0.3 * base);
        this.body.lineTo(0.9 * base, 0.5 * base);
        this.body.lineTo(0.8 * base, 0.2 * base);
        this.body.closePath();

        // Yeux rouges (losanges)
        this.body.lineStyle(2, 0xFF0000, 1); // Lignes rouges pour les yeux
        this.body.beginFill(0xFF0000);

        // Œil gauche
        this.body.moveTo(-0.2 * base, -0.5 * base);
        this.body.lineTo(-0.15 * base, -0.55 * base);
        this.body.lineTo(-0.1 * base, -0.5 * base);
        this.body.lineTo(-0.15 * base, -0.45 * base);
        this.body.closePath();

        // Œil droit
        this.body.moveTo(0.2 * base, -0.5 * base);
        this.body.lineTo(0.15 * base, -0.55 * base);
        this.body.lineTo(0.1 * base, -0.5 * base);
        this.body.lineTo(0.15 * base, -0.45 * base);
        this.body.closePath();

        this.body.endFill();

        // Mise à jour des points de vie
        this.updateHP();
    }

    updateHP() {
        if (this.currentHP <= 0) {
            if (Monstre.dedExpl) new Monstre.Explosion(this.getX(), this.getY(), this.body.width * 6, 50, 0xFF0000);
            Monstre.joueur.statistics.kills += 1;

            // Supprimer le monstre de l'array
            let index = Monstre.monstres.indexOf(this);
            if (index !== -1) {
                Monstre.monstres.splice(index, 1);
            }

            // Supprimer les graphiques du stage
            Monstre.app.stage.removeChild(this.hpText);
            Monstre.app.stage.removeChild(this.body);

            // Arrêt de toute animation ticker-based
            if (this.updateFn) {
                Monstre.app.ticker.remove(this.updateFn);
                this.updateFn = null;
            }

            // Clean up des références pour le garbage collection
            this.hpText.destroy({ children: true });
            this.body.destroy({ children: true });
            this.hpText = null;
            this.body = null;
            if(this.type == "bossBunny")
            {
                Monstre.Event.boss["bossBunny"] = null;
                Monstre.Event.nextSong = true; 
            }
            return;
        }

        // Mise à jour du texte HP si le joueur est encore en vie
        if (this.showLife) {
            this.hpText.text = this.currentHP;
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
        } else {
            Monstre.app.stage.removeChild(this.hpText);
        }
    }
}
