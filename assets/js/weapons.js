// weapons.js
export class Weapon{
    static mstr = null;
    static monstres = null;
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


    static addMonstres(monstresInput)
    {
        Weapon.mstr = monstresInput;
        Weapon.monstres = Weapon.mstr.monstres;
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
        this.swingDuration = 100;
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
                    trailParticle.beginFill(0x0FFFFF, 0.3);
                    trailParticle.drawCircle(0, 0, 6);
                    trailParticle.endFill();
                    trailParticle.x = x;
                    trailParticle.y = y;
                    trailParticle.zIndex = -1;
    
                    Weapon.app.stage.addChild(trailParticle);
                    this.trail.push({ particle: trailParticle, age: 0 });
                }
            });
        }
    
        this.trail.forEach((trailData) => {
            const particle = trailData.particle;
            if (particle.alpha > 0) {
                trailData.age++;
                particle.alpha -= 0.012 * trailData.age;
            }
        });
    
        // Clean up particles when they are fully transparent
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const trailData = this.trail[i];
            if (trailData.particle.alpha <= 0) {
                Weapon.app.stage.removeChild(trailData.particle);
                trailData.particle.destroy();  // Ensure proper cleanup
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
        }
    }

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


export class Gun extends Weapon {
    static bullets = [];

    constructor(cooldown, baseDMG, pierce) {
        super("Gun", cooldown, baseDMG, new PIXI.Graphics());
        this.hasGun = false;
        this.pierce = pierce;
        this.isOnCooldown = false;
        this.color = 0x9966FF;
        this.wideness = 1.3;
        this.storedAngle = 0;
        this.isSwinging = false;
        this.baseAngle = 0;
        this.setBody(this.createGun());
        this.body.visible = this.hasGun;
    }

    createGun() {
        const gun = new PIXI.Graphics();
        gun.lineStyle(3, 0x000000, 1);
        gun.beginFill(this.color);
        gun.drawRect(0, 0, 10, 15); // Adjust gun size
        gun.endFill();
        gun.pivot.set(5, 30);  
        gun.x = Weapon.joueur.getX() + 15;
        gun.y = Weapon.joueur.getY() + 100;
        gun.zIndex = 1000;
        gun.visible = true;
        Weapon.app.stage.addChild(gun);
        return gun;
    }

    gunDMG() {
        return Math.round(this.baseDMG + Math.random() * 15);
    }

    shoot() {
        if (this.isOnCooldown || !this.hasGun) return;
        this.isOnCooldown = true;
        
        const bullet = new PIXI.Graphics();
        bullet.radius = 6;
        bullet.lineStyle(3, 0x000000, 1);
        bullet.beginFill(0xFF0000); // Bullet color
        if(Weapon.mstr.dedMilkMan)
        {
            bullet.lineStyle(3, 0xFFFFFF, 1);
            bullet.beginFill(0xFFFFFF); // Bullet color
        }
        
        
        bullet.drawCircle(0, 0, bullet.radius);
        bullet.endFill();

        bullet.angle = this.storedAngle;
        // Calculate bullet spawn position at gun barrel
        const gunLength = 30; // Length of the gun shape
        bullet.x = this.body.x + Math.cos(this.storedAngle - Math.PI / 2) * gunLength;
        bullet.y = this.body.y + Math.sin(this.storedAngle - Math.PI / 2) * gunLength;

        Weapon.app.stage.addChild(bullet);
        Gun.bullets.push(bullet);

        setTimeout(() => this.isOnCooldown = false, 1000 * this.cooldown);
    }

    update(cursorX, cursorY, deltaX, deltaY) {
        // Update gun position based on the player
        this.body.x = Weapon.joueur.getX() + Weapon.joueur.getWidth() / 2- 1;
        this.body.y = Weapon.joueur.getY() + Weapon.joueur.getHeight() / 2 -1; 

        // Calculate gun rotation to aim at the cursor
        let dx = cursorX - this.body.x;
        let dy = cursorY - this.body.y;
        this.storedAngle = Math.atan2(dy, dx) + Math.PI / 2; // Store aiming angle
        this.body.rotation = this.storedAngle; // Rotate gun

        // Update bullets
        Gun.bullets.forEach((b, index) => {
            b.x += Math.cos(b.angle - Math.PI / 2) * 10 + deltaX;
            b.y += Math.sin(b.angle - Math.PI / 2) * 10 + deltaY;

            // Remove bullets that go off-screen
            if (b.x < 0 - b.radius || b.x > Weapon.app.view.width + b.radius ||
                b.y < 0 - b.radius || b.y > Weapon.app.view.height + b.radius) {
                Weapon.app.stage.removeChild(b);
                b.destroy();  // Destroy the bullet to prevent memory leak
                Gun.bullets.splice(index, 1);  // Remove from bullets array
            }
        });
    }

    isBulletCollidingWithMonster(monstre) {
        if (!monstre || !monstre.body) return;  // Check if monstre or monstre.body is null
    
        Gun.bullets.forEach((bullet, index) => {
            if (!bullet || !monstre.body) return;  // Check if bullet is valid
    
            const bulletBounds = bullet.getBounds();
            const monstreBounds = monstre.body.getBounds();
    
            if (
                bulletBounds.x < monstreBounds.x + monstreBounds.width &&
                bulletBounds.x + bulletBounds.width > monstreBounds.x &&
                bulletBounds.y < monstreBounds.y + monstreBounds.height &&
                bulletBounds.y + bulletBounds.height > monstreBounds.y
            ) {
                this.onBulletHitEnemy(monstre);
                Weapon.app.stage.removeChild(bullet);
                bullet.destroy();  
                Gun.bullets.splice(index, 1); 
            }
        });
    }
    
    

    onBulletHitEnemy(monstre) {
        if (!monstre.getBulletHit()) {
            monstre.setBulletHit(true);
            const dmg = this.gunDMG();

            monstre.endommagé(dmg, "gun");
            monstre.setBulletHit(true);            
        }
    }
}

export class Explosion {
    static explosions = [];

    constructor(x, y, rayon, baseDMG, couleur) {
        this.rayon = rayon;
        this.baseDMG = baseDMG;
        this.couleur = Weapon.mstr.dedMilkMan ? 0xFFFFFF : couleur;
        this.maxRayon = rayon;
        this.currentRayon = Math.max(1, rayon / 20); // Avoid 0 radius

        this.body = this.createExplosion(x, y);

        // Ensure body has valid x, y immediately
        if (!this.body) {
            console.error("Explosion creation failed.");
            return;
        }

        Explosion.explosions.push(this);
    }

    createExplosion(x, y) {
        const cercle = new PIXI.Graphics();
        cercle.beginFill(this.couleur);
        cercle.drawCircle(0, 0, this.currentRayon);
        cercle.endFill();
        
        // Set position BEFORE adding to stage
        cercle.x = x;
        cercle.y = y;
        
        Weapon.app.stage.addChild(cercle);
        return cercle;
    }

    updateExplosion(deltaX, deltaY) {
        if (!this.body) return;

        this.body.x += deltaX;
        this.body.y += deltaY;

        if (this.currentRayon < this.maxRayon) {
            this.currentRayon += this.maxRayon / 20;
            this.body.clear();
            this.body.beginFill(this.couleur);
            this.body.drawCircle(0, 0, this.currentRayon);
            if(!Weapon.mstr.dedMilkMan)
            {
                this.body.alpha -= 0.065;
            }
            this.body.endFill();

            this.applyDamage(Weapon.monstres);

        } else {
            this.destroy();
        }
    }

    applyDamage(monstres) {
        if (!this.body) return;

        monstres.forEach(monstre => {
            if (!monstre.getExplosionHit()) {
                const distance = Math.hypot(this.body.x - monstre.getX(), this.body.y - monstre.getY());

                if (distance <= this.currentRayon) {
                    monstre.setExplosionHit(true);
                    monstre.endommagé(this.baseDMG, "explosion");
                }
            }
        });
    }

    destroy() {
        if (!this.body) return;

        Weapon.app.stage.removeChild(this.body);
        this.body.destroy({ children: true });

        const index = Explosion.explosions.indexOf(this);
        if (index !== -1) {
            Explosion.explosions.splice(index, 1);
        }

        this.body = null;
    }
}



