
export class Monstre {
    static monstres = [];
    static cleanMonstres = [];
    static Explosion = null;
    static Exp = null;
    static app = null;
    static showLife = false;
    static dedExpl = false;
    static dedEXP = true;
    static dedMilkMan = false;

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
    }

    static addApp(appInput) {
        Monstre.app = appInput;
    }
    static addExp(expInput) {
        Monstre.Exp = expInput;
    }
    static addExplosion(explInput) {
        Monstre.Explosion = explInput;
    }

    createShape(x = 0, y = 0) {
        const shape = new PIXI.Graphics();
        
        shape.x = x;
        shape.y = y;
        shape.sides = this.sides;
        shape.zIndex = 1;
        shape.pivot.set(0, 0);
        return shape;
    }

    vecteurVersLeJoueur(joueur) {
        let dx = joueur.getX() + joueur.getWidth() / 2 - this.getX();
        let dy = joueur.getY() + joueur.getHeight() / 2 - this.getY();
        let magnitude = Math.sqrt(dx * dx + dy * dy);
        
        return { x: this.vitesse * dx / magnitude, y: this.vitesse * dy / magnitude };
    }

    actualiserPolygone(delta, ennemiColor) {
        if (this.sides < 3) return;
        this.couleur = ennemiColor;
        this.elapsedTime += 3 * delta;
        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;
        this.body.clear();
        this.body.lineStyle(3, 0x000000, 1);
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

    bouger(joueur, delta, deltaX, deltaY, ennemiColor) {
        let moveVector = this.vecteurVersLeJoueur(joueur);
        this.setX(this.getX() + (moveVector.x)*delta + deltaX);
        this.setY(this.getY() + (moveVector.y)*delta + deltaY);
        
        this.spins ? this.body.rotation += this.spinSpeed : 0;
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
        const minDistance = 85 * this.size;
        const avoidFactor = 1.2;

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
    updateHP() {
        if (this.currentHP <= 0) {
            // Trigger death animation before removal
            this.disintegrationAnimation();
    
            if (Monstre.dedExpl) {
                new Monstre.Explosion(this.getX(), this.getY(), this.body.width * 6, 50, 0xFF0000);
            }
            if (Monstre.dedEXP) {

                new Monstre.Exp(this.getX(), this.getY(), this.exp);
                if(this.type == "expBall")
                {
                    Monstre.Exp.expBuildUp = 0;
                }
            }
    
            // Remove the monster from the array
            let index = Monstre.monstres.indexOf(this);
            if (index !== -1) {
                Monstre.monstres.splice(index, 1);
            }
    
            // Remove all graphics from the stage
            Monstre.app.stage.removeChild(this.hpText);
            Monstre.app.stage.removeChild(this.body);
    
            // Stop any running ticker-based animations
            if (this.updateFn) {
                Monstre.app.ticker.remove(this.updateFn);
                this.updateFn = null; 
            }
    
            // Clean up references for garbage collection
            this.hpText.destroy({ children: true });
            this.body.destroy({ children: true });
            this.hpText = null;
            this.body = null;
    
            return;
        }
    
        // Update HP display if still alive
        if (this.showLife) {
            this.hpText.text = this.currentHP;
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
        } else {
            Monstre.app.stage.removeChild(this.hpText);
        }
    }
    
    
    disintegrationAnimation() {
        const particleCount = 2; // Number of particles
        const particles = [];
        const gravity = 0.05; // Gravity force pulling particles downward
        const drag = 0.98; // Drag to slow down particles over time
    
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(this.couleur);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            particle.x = this.getX();
            particle.y = this.getY();
            particle.alpha = 1;
    
            // Random initial velocity
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 2 + 1;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
    
            Monstre.app.stage.addChild(particle);
            particles.push(particle);
        }
    
        // Function to update particles
        const updateParticles = () => {
            for (let i = particles.length - 1; i >= 0; i--) {
                let particle = particles[i];
    
                // Apply gravity and drag
                particle.vy += gravity;
                particle.vx *= drag;
                particle.vy *= drag;
    
                // Move particle
                particle.x += particle.vx;
                particle.y += particle.vy;
    
                // Fade out
                particle.alpha -= 0.03;
    
                // Remove fully faded particles
                if (particle.alpha <= 0 || particle.y > Monstre.app.view.height) {
                    Monstre.app.stage.removeChild(particle);
                    particle.destroy({ children: true }); // Ensures PIXI fully cleans it up
                    particles.splice(i, 1); // Remove from array
                }
            }
    
            // Stop animation when no particles are left
            if (particles.length === 0) {
                Monstre.app.ticker.remove(updateParticles);
            }
        };
    
        // Add update function to PIXI ticker (better than `setInterval`)
        Monstre.app.ticker.add(updateParticles);
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
        if(type == "gun")
            {
                setTimeout(()=> {
                    this.setBulletHit(false);
                }, 10);
            }

        this.updateHP();
    }

    createHitEffect(monstre, damage) {
        // Create the damage text
        const damageText = new PIXI.Text(damage, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFF0000,
            stroke: 0x000000,      // Black outline
            strokeThickness: 4, 
            align: 'center',
            fontWeight: 'bold'
        });
        damageText.zIndex = 101;
        // Set initial position based on monster's position
        damageText.x = monstre.getX();
        damageText.y = monstre.getY();
    
        // Add the damage text to the stage
        Monstre.app.stage.addChild(damageText);
    
        // Set the initial scale and alpha
        damageText.scale.set(1);
        damageText.alpha = 1;
    
        // Store a reference to the update function
        const updateFn = (delta) => this.damageText(damageText, updateFn);
    
        // Add the function to the ticker
        Monstre.app.ticker.add(updateFn);
    }
    
    damageText(damageText, updateFn) {
        damageText.y -= 2; 
        damageText.alpha -= 0.02;  
        damageText.scale.x -= 0.01;
        damageText.scale.y -= 0.01;
    

        if (damageText.alpha <= 0) {
            Monstre.app.stage.removeChild(damageText);
            Monstre.app.ticker.remove(updateFn);  
            damageText.destroy({ children: true });
        }
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
    setBulletHit(bool){this.hasBulletHit = bool;}
    getBulletHit(){return this.hasBulletHit;}
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

export class MonstreExp extends Monstre {

    actualiserPolygone() {
        if (this.sides < 3) return;
        
        // Generate a rainbow color using sine waves
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
        this.exp = Monstre.Exp.expBuildUp;
    
        this.body.closePath();
        this.body.endFill();
    
        // Ensure HP text stays updated
        this.updateHP();
    }
    constructor(x, y, sides)
    {
        const type = "expBall";
        const size = 0.5;
        const speed = 0.2;
        const spinSpeed = 0.003;
        const baseHP = 250;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, 1, Monstre.Exp.expBuildUp);
    }
}