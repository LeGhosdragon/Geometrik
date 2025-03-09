//import { Exp } from "./experience";
export class Monstre {
    static monstres = [];
    static cleanMonstres = [];
    static app = null;
    static showLife = false;


    constructor(x, y, sides, size, type, vitesse = 1, spinSpeed = 0.02, baseHP = 100, baseDMG = 1, couleur = 0xff0000) {
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
    }

    static addApp(appInput) {
        Monstre.app = appInput;
    }

    createShape(x = 0, y = 0) {
        const shape = new PIXI.Graphics();
        shape.x = x;
        shape.y = y;
        shape.sides = this.sides;
        shape.pivot.set(0, 0);
        return shape;
    }

    vecteurVersLeJoueur(joueur) {
        let dx = joueur.getX() + joueur.getWidth() / 2 - this.getX();
        let dy = joueur.getY() + joueur.getHeight() / 2 - this.getY();
        let magnitude = Math.sqrt(dx * dx + dy * dy);
        
        return { x: this.vitesse * dx / magnitude, y: this.vitesse * dy / magnitude };
    }

    actualiserPolygone(ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        this.body.beginFill(ennemiColor);
    
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

        // Ensure HP text stays updated
        this.updateHP();
    }

    bouger(joueur, deltaX, deltaY, ennemiColor) {
        let moveVector = this.vecteurVersLeJoueur(joueur);
        this.setX(this.getX() + moveVector.x + deltaX);
        this.setY(this.getY() + moveVector.y + deltaY);
        
        this.spins ? this.body.rotation += this.spinSpeed : 0;
        this.avoidMonsterCollision();
        this.actualiserPolygone(ennemiColor);

        if(this.showLife && this.currentHP > 0)
        {
            // Update HP text position
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
            this.hpText.text = this.currentHP;
        }
    }

    static cleanup() {
        const screenWidth = Monstre.app.view.width;
        const screenHeight = Monstre.app.view.height;
    
        // Extend boundary by 1/5 of the screen size
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
    

    avoidMonsterCollision() {
        const minDistance = 75 * this.size;
        const avoidFactor = 1;

        Monstre.monstres.forEach(otherMonstre => {
            if (this === otherMonstre) return;
            let dx = this.getX() - otherMonstre.getX();
            let dy = this.getY() - otherMonstre.getY();
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                let angle = Math.atan2(dy, dx);
                let avoidX = Math.cos(angle) * avoidFactor;
                let avoidY = Math.sin(angle) * avoidFactor;
                this.setX(this.getX() + avoidX);
                this.setY(this.getY() + avoidY);
            }
        });
    }

    createHPText() {
        const text = new PIXI.Text(this.currentHP, {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: 0x000000,
            align: 'center'
        });

        text.anchor.set(0.5, 2);
        text.x = this.body.x;
        text.y = this.body.y;
        Monstre.app.stage.addChild(text);
        return text;
    }

    updateHP() {
        if (this.currentHP <= 0) {
            // Trigger death animation before removal
            this.disintegrationAnimation();

            //new Exp(this.getX(), this.getY(), 1);
    
            let index = Monstre.monstres.indexOf(this);
            Monstre.app.stage.removeChild(this.hpText);
            if (index !== -1) {
                Monstre.monstres.splice(index, 1);
            }
            // Clear the monster's graphics
            this.body.clear();
            delete this;
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
    
    disintegrationAnimation() {
        const particleCount = 50; // Number of particles
        const particles = [];
        const gravity = 2; // Gravity force pulling particles downward
        const drag = 0.98; // Drag to slow down particles over time
    
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(this.couleur); // Red color for particles (you can change this)
            particle.drawCircle(0, 0, 2); // Small particles
            particle.endFill();
            particle.x = this.getX(); // Starting position of the monster
            particle.y = this.getY();
            particle.alpha = 1; // Fully opaque initially
    
            // Random initial velocity
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 2 + 1; // Random speed for initial velocity
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
    
            Monstre.app.stage.addChild(particle);
            particles.push(particle);
        }
    
        // Animate the particles' movement with gravity and fading
        let disintegrationInterval = setInterval(() => {
            particles.forEach((particle, index) => {
                // Apply gravity
                particle.vy += gravity; // Increase vertical speed due to gravity
    
                // Apply drag to slow down particles over time
                particle.vx *= drag; // Horizontal speed decreases over time
                particle.vy *= drag; // Vertical speed decreases over time
    
                // Move the particle based on velocity
                particle.x += particle.vx;
                particle.y += particle.vy;
    
                // Fade out over time
                particle.alpha -= 0.03; // Fade out gradually
    
                // Remove particle when fully faded or goes off-screen
                if (particle.alpha <= 0 || particle.y > Monstre.app.view.height) {
                    Monstre.app.stage.removeChild(particle); // Remove particle from stage
                    particles.splice(index, 1); // Remove from particles array
                }
            });
    
            // Stop the animation once all particles are removed
            if (particles.length === 0) {
                clearInterval(disintegrationInterval);
            }
        }, 20); // Update every 20ms for smooth animation
    }
    
    
    
      
    
    endommagé(dmg, type) {
        this.setHP(this.getHP() - dmg);
        this.createHitEffect(this, dmg);
        if(type == "sword")
        {
            setTimeout(()=> {
                this.setSwordHit(false);
            }, 300);
        }
        if(type == "explosion")
        {
            setTimeout(()=> {
                this.setExplosionHit(false);
            }, 300);
        }
        this.updateHP();
    }


    createHitEffect(monstre, damage) {
        // Create the damage text
        const damageText = new PIXI.Text(damage, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFF0000,
            align: 'center',
            fontWeight: 'bold'
        });
    
        // Set initial position based on monster's position
        damageText.x = monstre.getX();
        damageText.y = monstre.getY();
    
        // Add the damage text to the stage
        Monstre.app.stage.addChild(damageText);
    
        // Set the initial scale and alpha
        damageText.scale.set(1);
        damageText.alpha = 1;
    
        // Animation to move the text upwards and fade out
        Monstre.app.ticker.add(() => {
            damageText.y -= 2;  // Move text upwards
            damageText.alpha -= 0.02;  // Fade out
    
            // Shrink the text slightly over time
            damageText.scale.x -= 0.01;
            damageText.scale.y -= 0.01;
    
            // Remove the text once it's fully transparent
            if (damageText.alpha <= 0) {
                Monstre.app.stage.removeChild(damageText);
            }
        });
    }

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
}

export class MonstreNormal extends Monstre {
    constructor(x, y, sides) {
        const type = "normal";
        const size = 0.3;
        const speed = 1;
        const spinSpeed = 0.02;
        const baseHP = 25;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP);
    }
}

export class MonstreRunner extends Monstre {
    constructor(x, y, sides) {
        const type = "runner";
        const size = 0.25;
        const speed = 3;
        const spinSpeed = 0.5;
        const baseHP = 15;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP);
    }
}
export class MonstreTank extends Monstre {


    constructor(x, y, sides) {
        const type = "tank";
        const size = 0.45;
        const speed = 0.4;
        const spinSpeed = 0.005;
        const baseHP = 50;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP);
    }
}


