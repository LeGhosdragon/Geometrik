// weapons.js
export class Weapon{
    static monstres = [];
    static app = null;
    static joueur = null;

    constructor(type, cooldown, baseDMG, body) {

        //this.AOE = areaOfAffect;
        this.body = body;
        this.cooldown = cooldown;
        this.type = type;
        this.baseDMG = baseDMG;
        this.currentDMG = this.baseDMG;
    }

    getX() { return this.body.x; }
    setX(x) { this.body.x = x; }
    getY() { return this.body.y; }
    setY(y) { this.body.y = y; }
    setBody(body) { this.body = body; } 

    isHit()
    {

    }


    static addMonstres(monstresInput)
    {
        Weapon.monstres = monstresInput;
    }
    static addApp(appInput) {
        Weapon.app = appInput;
    }
    static addJoueur(joueurInput) {
        Weapon.joueur = joueurInput;
    }
}


export class Sword extends Weapon {
    
    constructor(cooldown = 1, baseDMG = 15, length, hasSword, hasTrail = true) {
        super("sword", cooldown, baseDMG, new PIXI.Graphics());
        this.firstSwing = true;
        this.hasSword = hasSword;
        this.hasTrail = hasTrail;
        this.color = 0x0000FF;
        this.length = length;
        this.trail = [];
        this.swingSpeed = 7;
        this.wideness = 1.3;
        this.swingDirection = 1; // 1 for normal, -1 for inverted
        this.swingTime = 0;
        this.swingDuration = 100; // Adjust this value to control swing duration
        this.storedAngle = 0;
        this.isSwinging = false;
        this.baseAngle = 0;
        this.setBody(this.createSword());
        this.body.visible = false;
        this.previousSwordPosition = {x: 0, y: 0};
        

    }
    

    createSword() {
        const rectangle = new PIXI.Graphics();
        rectangle.beginFill(this.color);
        rectangle.drawRect(0, 0, 10, this.length);
        rectangle.endFill();
        rectangle.pivot.set(10 / 2, this.length + 30);  
        rectangle.x = Weapon.joueur.getX() + 15;
        rectangle.y = Weapon.joueur.getY() + 12;
        rectangle.visible = true;
        Weapon.app.stage.addChild(rectangle);
        return rectangle;
    }

    updateTrail(offsets) {
        if (!this.body.visible) {
            this.trail.forEach((particle, index) => {
                if (particle.alpha > 0) {
                    particle.alpha -= 0.02 * (index + 1);
                }
            });
        } else {
            const dx = this.getX() - this.previousSwordPosition.x;
            const dy = this.getY() - this.previousSwordPosition.y;
            const swordSpeed = Math.sqrt(dx * dx + dy * dy);
            const numParticles = Math.max(15, Math.floor(this.length / 4) + Math.floor(swordSpeed * 5));
            this.previousSwordPosition.x = this.getX();
            this.previousSwordPosition.y = this.getY();
    
            offsets.forEach((offset) => {
                const angle = this.body.rotation - Math.PI / 2 + offset;
                const step = this.length / numParticles;
                const pivotX = this.getX();
                const pivotY = this.getY();
    
                for (let i = 0; i < numParticles; i++) {
                    const distance = i * step;
                    const x = pivotX + Math.cos(angle) * (distance + 30);
                    const y = pivotY + Math.sin(angle) * (distance + 30);
    
                    const trailParticle = new PIXI.Graphics();
                    trailParticle.beginFill(0x0FFFFF, 0.3);  // Less opaque (0.3 instead of 0.7)
                    trailParticle.drawCircle(0, 0, 6);  // Particle size
                    trailParticle.endFill();
                    trailParticle.x = x;
                    trailParticle.y = y;
                    trailParticle.zIndex = -1;  // Ensures particles are below the monsters
    
                    Weapon.app.stage.addChild(trailParticle);
                    this.trail.push({ particle: trailParticle, age: 0 });
                }
            });
        }
    
        this.trail.forEach((trailData) => {
            const particle = trailData.particle;
            if (particle.alpha > 0) {
                trailData.age++;
                particle.alpha -= 0.012 * trailData.age;  // Gradually fade out particles
            }
        });
    
        // Clean up particles when they're fully transparent
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const trailData = this.trail[i];
            if (trailData.particle.alpha <= 0) {
                Weapon.app.stage.removeChild(trailData.particle);
                this.trail.splice(i, 1);
            }
        }
    
        this.body.zIndex = 1;
        Weapon.app.stage.addChild(this.body);
    }
    
    
    hideSwordAndParticles() {
        this.body.visible = false;

        if(this.hasSword)
        {
            setTimeout(() => {
                if(this.hasSword)
                {
                    this.body.visible = true;                    
                }
                this.isSwinging = true;
                this.swingTime = 0;
                Weapon.monstres.forEach(otherMonstre => {
                    otherMonstre.setSwordHit(false);
                });
            }, 1000/this.cooldown);
        }
    }

    isSwordCollidingWithMonster(monstre) {
        if (!this.body.visible) {
            return false;
        }
        const swordBounds =  this.body.getBounds();
        const monstreBounds = monstre.body.getBounds();
    
        let bool = swordBounds.x < monstreBounds.x + monstreBounds.width &&
               swordBounds.x + swordBounds.width > monstreBounds.x &&
               swordBounds.y < monstreBounds.y + monstreBounds.height &&
               swordBounds.y + swordBounds.height > monstreBounds.y;
               return bool;
    }

    onSwordHitEnemy(monstre) {
        if(!monstre.getSwordHit())
        {
            monstre.setSwordHit(true);
            const dmg = this.swordDMG();

            monstre.endommagé(dmg, "sword");
            monstre.setSwordHit(true);
            if(monstre.currentHP <= 0)
            {
                let box = [];
                box.push(monstre.getX());
                box.push(monstre.getY());
                return box;
            }
            else
            {
                return false;
            }
            
        }
    }

    // createHitEffect(monstre, damage) {
    //     // Create the damage text
    //     const damageText = new PIXI.Text(damage, {
    //         fontFamily: 'Arial',
    //         fontSize: 24,
    //         fill: 0xFF0000,
    //         align: 'center',
    //         fontWeight: 'bold'
    //     });
    
    //     // Set initial position based on monster's position
    //     damageText.x = monstre.getX();
    //     damageText.y = monstre.getY();
    
    //     // Add the damage text to the stage
    //     Weapon.app.stage.addChild(damageText);
    
    //     // Set the initial scale and alpha
    //     damageText.scale.set(1);
    //     damageText.alpha = 1;
    
    //     // Animation to move the text upwards and fade out
    //     Weapon.app.ticker.add(() => {
    //         damageText.y -= 2;  // Move text upwards
    //         damageText.alpha -= 0.02;  // Fade out
    
    //         // Shrink the text slightly over time
    //         damageText.scale.x -= 0.01;
    //         damageText.scale.y -= 0.01;
    
    //         // Remove the text once it's fully transparent
    //         if (damageText.alpha <= 0) {
    //             Weapon.app.stage.removeChild(damageText);
    //         }
    //     });
    // }

    playSwordSwing(cursorX, cursorY) {
        if(this.hasSword)
        {
            //Ceci permet au premier swing d'aller dans la direction de la souris
            if(this.firstSwing)
            {
                let dx = cursorX - (Weapon.joueur.getX() + Weapon.app.view.offsetLeft);
                let dy = cursorY - (Weapon.joueur.getY() + Weapon.app.view.offsetTop);
                this.storedAngle = Math.atan2(dy, dx);
                this.baseAngle = this.storedAngle;
                this.firstSwing = false;
                this.isSwinging = true;
            }
            if (!this.isSwinging) {
                let dx = cursorX - (Weapon.joueur.getX() + Weapon.app.view.offsetLeft);
                let dy = cursorY - (Weapon.joueur.getY() + Weapon.app.view.offsetTop);
                this.storedAngle = Math.atan2(dy, dx);
                this.baseAngle = this.storedAngle;
            }
            
            if (this.isSwinging) {
                this.swingTime += this.swingSpeed;
                let swingOffset = Math.cos(this.swingTime / this.swingDuration * Math.PI) * this.wideness * this.swingDirection;
                this.body.rotation = this.baseAngle + swingOffset + Math.PI / 2;
        
                if (this.swingTime >= this.swingDuration) {
                    this.isSwinging = false;
                    this.hideSwordAndParticles();
                }
            }
        }
        if(this.hasTrail)
        {
            this.updateTrail([0, 0.1, 0.2]);
        }
        
        this.previousSwordPosition = { x: this.getX(), y: this.getY() };
    }

    swordDMG() {
        return Math.round(this.baseDMG + Math.random() * 15);
    }
}

export class Explosion {
    static explosions = [];

    constructor(x, y, rayon, baseDMG, couleur) {
        this.rayon = rayon;
        this.baseDMG = baseDMG;
        this.couleur = couleur;
        this.body = this.createExplosion(x, y);
        this.maxRayon = rayon;
        this.currentRayon = rayon -1;
        Explosion.explosions.push(this);
    }

    createExplosion(x, y) {
        const cercle = new PIXI.Graphics();
        cercle.beginFill(this.couleur);
        cercle.drawCircle(0, 0, this.currentRayon);
        cercle.endFill();
        cercle.x = x;
        cercle.y = y;
        cercle.visible = true;
        Weapon.app.stage.addChild(cercle);
        return cercle;
    }

    updateExplosion() {
        if (this.currentRayon < this.maxRayon) {
            this.currentRayon += this.maxRayon / 20;
            this.body.clear();
            this.body.beginFill(this.couleur);
            this.body.drawCircle(0, 0, this.currentRayon);
            this.body.endFill();

            // Apply damage to monsters within the explosion range while the explosion is growing
            this.applyDamage(Weapon.monstres);

        } else {
            Weapon.app.stage.removeChild(this.body);
            let index = Explosion.explosions.indexOf(this);
            if (index !== -1) {
                Explosion.explosions.splice(index, 1);
                delete this;
            }
        }
    }

    // Apply damage to monsters in the explosion range
    applyDamage(monstres) {
        monstres.forEach(monstre => {
            if(!monstre.getExplosionHit())
            {
                
                // Calculate distance between the monster and the explosion's center
                const monstreCenter = { 
                    x: monstre.body.x , 
                    y: monstre.body.y 
                };
                const explosionCenter = { x: this.body.x, y: this.body.y };
                const distance = Math.sqrt(Math.pow(explosionCenter.x - monstreCenter.x, 2) + Math.pow(explosionCenter.y - monstreCenter.y, 2));

                // Check if the monster is within the explosion's current radius
                if (distance <= this.currentRayon) {
                    monstre.setExplosionHit(true);
                    // Calculate damage based on distance, so further monsters take less damage
                    monstre.endommagé(this.baseDMG,  "explosion");
                }
            }
        });
    }
}
