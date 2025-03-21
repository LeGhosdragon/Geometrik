export class Monstre {
    static monstres = [];
    static joueur = null;
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
    
            // Ensure values are valid before setting
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
    
            // Ensure values are valid before setting
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
    
    endommagé(dmg, weapon) {
        this.setHP(this.getHP() - dmg);
        this.createHitEffect(this, dmg);
        
        if(weapon.type == "sword")
        {
            this.knockback(weapon.knockback, Math.atan2(this.getY() - (Monstre.joueur.getY() + Monstre.joueur.size), this.getX() - (Monstre.joueur.getX() + Monstre.joueur.size)));
            setTimeout(()=> {
                this.setSwordHit(false);
            }, 300);
        }
        if(weapon.type == "explosion")
        {
            this.knockback(weapon.knockback, Math.atan2(this.getY() - (Monstre.joueur.getY() + Monstre.joueur.size), this.getX() - (Monstre.joueur.getX() + Monstre.joueur.size)));
            setTimeout(()=> {
                this.setExplosionHit(false);
            }, 300);
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
    
    static addJoueur(joueurInput) {
        Monstre.joueur = joueurInput;
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
        const exp = 2;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp);
    }

    
}

export class MonstreRunner extends Monstre {
    constructor(x, y, sides) {
        const type = "runner";
        const size = 0.25;
        const speed = 2.5;
        const spinSpeed = 0.04;
        const baseHP = 15;
        const exp = 1;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp);
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
        this.body.endFill();

        // Ensure HP text stays updated
        this.updateHP();
    }
}
export class MonstreTank extends Monstre {


    constructor(x, y, sides) {
        const type = "tank";
        const size = 0.45;
        const speed = 0.4;
        const spinSpeed = 0.005;
        const baseHP = 50;
        const exp = 4;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp);
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
export class MonstreGunner extends Monstre {
    static bullets = [];
    
    constructor(x, y, sides) {
        const type = "gunner";
        const size = 0.2;
        const speed = 1;
        const spinSpeed = 0.005;
        const baseHP = 15;
        const exp = 4;
        super(x, y, sides, size, type, speed, spinSpeed, baseHP, exp);

        this.shootInterval = 250;  // 1 second cooldown for shooting
        this.lastShotTime = 0;
        this.currentTime = 0;
        this.isOnCooldown = false;
        this.bulletSize = 10;
        this.pierce = 1;
    }

    bouger(joueur, delta, deltaX, deltaY, ennemiColor) {
        this.currentTime++;
        const screenHeight = Monstre.app.view.height;
        let moveVector = this.vecteurVersLeJoueur(joueur);

        // Stop moving if monster is too close to player
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
            // Update HP text position
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
            this.hpText.text = this.currentHP;
        }
    }

    shoot(joueur) {
        if (this.isOnCooldown) return;
        this.isOnCooldown = true;

        // Calculate the angle towards the player
        const angleToPlayer = Math.atan2((joueur.getY() + joueur.size) - this.getY(), (joueur.getX() + joueur.size) - this.getX());

        // Create bullet and initialize its properties
        const bullet = new PIXI.Graphics();
        bullet.radius = this.bulletSize;
        bullet.lineStyle(3, 0xFF0000, 1);
        bullet.beginFill(0xFF0000);
        bullet.drawCircle(0, 0, bullet.radius);
        bullet.endFill();
        
        const gunLength = 30;
        bullet.x = this.getX() + Math.cos(angleToPlayer) * gunLength;
        bullet.y = this.getY() + Math.sin(angleToPlayer) * gunLength;

        // Set bullet's initial angle and movement direction
        bullet.angle = angleToPlayer;
        bullet.speed = 3;

        Monstre.app.stage.addChild(bullet);
        MonstreGunner.bullets.push(bullet);

        setTimeout(() => (this.isOnCooldown = false), 1000 * this.shootInterval);
    }

    static updateBullets(delta, deltaX, deltaY, joueur) {
        for (let i = MonstreGunner.bullets.length - 1; i >= 0; i--) {
            let b = MonstreGunner.bullets[i];

            // Update bullet position based on its angle
            b.x += Math.cos(b.angle) * b.speed * delta + deltaX;
            b.y += Math.sin(b.angle) * b.speed * delta + deltaY;

            // Remove bullets that go off-screen
            if (b.x < -b.radius || b.x > Monstre.app.view.width + b.radius ||
                b.y < -b.radius || b.y > Monstre.app.view.height + b.radius || MonstreGunner.isBulletCollidingWithJoueur(joueur)) {
                Monstre.app.stage.removeChild(b);
                b.destroy({ children: true, texture: true, baseTexture: true });
                MonstreGunner.bullets.splice(i, 1);
            }
        }
    }

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
    
    static onBulletHitPlayer(joueur) {
        if(!joueur.isImmune)
        {
            joueur.endommagé(1);
            joueur.isImmune = true;
            setTimeout(() => {joueur.isImmune = false;}, 750);
        }
    }
}
