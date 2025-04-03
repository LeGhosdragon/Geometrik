/**
 * Cette classe permet de créer, mettre à jour et gérer les interactions
 * des armes du joueur avec les monstres et l'environnement.
 */
export class Weapon{
    static Monstre = null;
    static monstres = null;
    static MonstreGunner = null;
    static app = null;
    static joueur = null;


    constructor(type, cooldown, baseDMG, body) {

        //this.AOE = areaOfAffect;
        this.body = body;
        this.cooldown = cooldown*60;
        this.type = type;
        this.baseDMG = baseDMG;
        this.currentDMG = this.baseDMG;
        this.knockback = 0;
    }

    getX() { return this.body.x; }
    setX(x) { this.body.x = x; }
    getY() { return this.body.y; }
    setY(y) { this.body.y = y; }
    setBody(body) { this.body = body; } 


    static addMonstres(monstresInput)
    {
        Weapon.Monstre = monstresInput;
        Weapon.monstres = Weapon.Monstre.monstres;
    }
    static addApp(appInput) {
        Weapon.app = appInput;
    }
    static addJoueur(joueurInput) {
        Weapon.joueur = joueurInput;
    }
    static addMonstreGunner(MonstreGunner) {
        Weapon.MonstreGunner = MonstreGunner;
    }
}


export class Sword extends Weapon {
    
    constructor(cooldown = 1, baseDMG = 15, length, hasSword, hasTrail = false) {
        super("sword", cooldown, baseDMG, new PIXI.Graphics());
        this.firstSwing = true;
        this.hasSword = hasSword;
        this.hasTrail = hasTrail;
        this.color = 0x0000FF;
        this.length = length;
        this.trail = [];
        this.swingSpeed = 7;
        this.wideness = 0.8;
        this.swingDirection = 1; // 1 for normal, -1 for inverted
        this.swingTime = 0;
        this.swingDuration = 100;
        this.storedAngle = 0;
        this.knockback = 2;
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

    updateTrail(delta, offsets, deltaX, deltaY) {
        if (!this.body.visible) {
            this.trail.forEach((trailData, index) => {
                if (trailData.particle.alpha > 0) {
                    trailData.particle.alpha -= 0.02 * (index + 1);
                }
            });
            return;
        }
    
        const dx = this.getX() - this.previousSwordPosition.x;
        const dy = this.getY() - this.previousSwordPosition.y;
        const swordSpeed = Math.sqrt(dx * dx + dy * dy);
        const numParticles = Math.max(10, Math.floor(this.length / 5) + Math.floor(swordSpeed * 3)); // Fewer particles
    
        this.previousSwordPosition.x = this.getX();
        this.previousSwordPosition.y = this.getY();
    
        const pivotX = this.getX();
        const pivotY = this.getY();
    
        // Create particles only if necessary
        if (this.trail.length < numParticles) {
            offsets.forEach((offset) => {
                const angle = this.body.rotation - Math.PI / 2 + offset;
                const step = this.length / numParticles;
    
                for (let i = 0; i < numParticles - this.trail.length; i++) {
                    const distance = i * step;
                    const x = pivotX + Math.cos(angle) * (distance + 20);
                    const y = pivotY + Math.sin(angle) * (distance + 20);
    
                    let trailParticle;
                    if (this.trailPool.length > 0) {
                        // Reuse old particle
                        trailParticle = this.trailPool.pop();
                        trailParticle.alpha = 0.3;
                    } else {
                        // Create new particle
                        trailParticle = new PIXI.Graphics();
                        trailParticle.beginFill(0x0FFFFF, 0.3);
                        trailParticle.drawCircle(0, 0, 5);
                        trailParticle.endFill();
                        Weapon.trailContainer.addChild(trailParticle); // Use a container
                    }
    
                    trailParticle.x = x;
                    trailParticle.y = y;
                    trailParticle.zIndex = -1;
                    this.trail.push({ particle: trailParticle, age: 0 });
                }
            });
        }
    
        // Update existing particles
        this.trail.forEach((trailData) => {
            const particle = trailData.particle;
            trailData.age++;
            particle.alpha -= 0.01;
            particle.x += deltaX;
            particle.y += deltaY;
        });
    
        // Recycle faded particles
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const trailData = this.trail[i];
            if (trailData.particle.alpha <= 0) {
                Weapon.trailContainer.removeChild(trailData.particle);
                this.trailPool.push(trailData.particle); // Store for reuse
                this.trail.splice(i, 1);
            }
        }
    
        this.body.zIndex = 1;
        Weapon.app.stage.addChild(this.body);
    }
    
    hideSwordAndParticles() {
        this.body.visible = false;
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

    isSwordCollidingWithBullet(bullet) {
        if (!this.body.visible) {
            return false;
        }
        const swordBounds =  this.body.getBounds();
        const bulletBounds = bullet.getBounds();
    
        let bool = swordBounds.x < bulletBounds.x + bulletBounds.width &&
               swordBounds.x + swordBounds.width > bulletBounds.x &&
               swordBounds.y < bulletBounds.y + bulletBounds.height &&
               swordBounds.y + swordBounds.height > bulletBounds.y;
               return bool;
    }

    onSwordHitEnemy(monstre) {
        if(!monstre.getSwordHit())
        {
            monstre.setSwordHit(true);
            const dmg = this.swordDMG();

            monstre.endommagé(dmg, this, Math.random() * 100 < Weapon.joueur.critChance);
            monstre.setSwordHit(true);            
        }
    }

    onSwordHitEnemyBullet(bullet) {
        let i = Weapon.MonstreGunner.bullets.indexOf(bullet);
        Weapon.Monstre.app.stage.removeChild(bullet);
        bullet.destroy({ children: true, texture: true, baseTexture: true });
        Weapon.MonstreGunner.bullets.splice(i, 1);
    }

    playSwordSwing(delta, cursorX, cursorY) {
        if(this.hasSword)
        {
            this.body.clear(); // Efface l'ancienne épée
            this.body.beginFill(this.color);
            this.body.drawRect(0, 0, 10, this.length); // Met à jour avec la nouvelle longueur
            this.body.endFill();
            this.body.pivot.set(10 / 2, this.length + 30);

            //Ceci permet au premier swing d'aller dans la direction de la souris
            if(this.firstSwing)
            {
                //console.log(1);
                let dx = cursorX - (Weapon.joueur.getX() + Weapon.app.view.offsetLeft);
                let dy = cursorY - (Weapon.joueur.getY() + Weapon.app.view.offsetTop);
                this.storedAngle = Math.atan2(dy, dx);
                this.baseAngle = this.storedAngle;
                this.firstSwing = false;
                this.isSwinging = true;
                this.body.visible = true;
            }
            if (!this.isSwinging) {
                //console.log(2);
                let dx = cursorX - (Weapon.joueur.getX() + Weapon.app.view.offsetLeft);
                let dy = cursorY - (Weapon.joueur.getY() + Weapon.app.view.offsetTop);
                this.storedAngle = Math.atan2(dy, dx);
                this.baseAngle = this.storedAngle;
            }
             
            if (this.isSwinging) {
                
                this.swingTime += this.swingSpeed;
                let swingOffset = Math.cos(this.swingTime / this.swingDuration * Math.PI) * this.wideness * this.swingDirection;
                this.body.rotation = this.baseAngle + swingOffset + Math.PI / 2;
                //console.log(swingOffset);
                if (this.swingTime >= this.swingDuration) {
                    this.isSwinging = false;
                    this.swingTime = 0;
                    this.hideSwordAndParticles();
                }
            }
        }
        
        this.previousSwordPosition = { x: this.getX(), y: this.getY() };
    }

    swordDMG() {
        return Math.round(this.baseDMG + Math.random() * this.baseDMG/5);
    }
}

/**
 * Sous-classe de Weapon pour gérer le Gun.
 */
export class Gun extends Weapon {
    static bullets = [];

    constructor(cooldown, baseDMG, pierce) {
        super("gun", cooldown, baseDMG, new PIXI.Graphics());
        this.hasGun = false;
        this.pierce = pierce;
        this.isOnCooldown = false;
        this.cooldownTimeLeft = 0;
        this.color = 0x9966FF;
        this.bulletSize = 6;
        this.knockback = 5;
        this.wideness = 1.3;
        this.storedAngle = 0;
        this.isSwinging = false;
        this.baseAngle = 0;
        this.setBody(this.createGun());
        this.body.visible = this.hasGun;
    }

    // Méthode pour créer le Gun en tant que graphique PIXI 
    createGun() {
        const gun = new PIXI.Graphics();
        gun.lineStyle(3, 0x000000, 1);
        gun.beginFill(this.color);
        if (Weapon.Monstre.dedMilkMan) {
            gun.beginFill(0xFFFFFF);
        }
        else if(Weapon.app.space)
        {
            gun.beginFill(0x000000);
        }
        gun.drawRect(0, 0, 10, 15);
        gun.endFill();
        gun.pivot.set(5, 30);
        gun.x = Weapon.joueur.getX() + 15;
        gun.y = Weapon.joueur.getY() + 100;
        gun.zIndex = 1000;
        gun.visible = true;
        Weapon.app.stage.addChild(gun);
        return gun;
    }

    // Méthode pour calculer le damage infligés par le Gun
    gunDMG() {
        return Math.round(this.baseDMG + Math.random() * this.baseDMG/5);
    }

    // Tire une balle
    shoot() {
        if (this.isOnCooldown || !this.hasGun) return;

        const bullet = new PIXI.Graphics();
        bullet.radius = Weapon.Monstre.dedMilkMan ? 20 : this.bulletSize;
        bullet.lineStyle(3, Weapon.Monstre.dedMilkMan ? 0xFFFFFF : 0x000000, 1);
        bullet.beginFill(Weapon.Monstre.dedMilkMan ? 0xFFFFFF : 0xFF0000);
        bullet.drawCircle(0, 0, bullet.radius);
        bullet.endFill();
        bullet.touches = [];
        bullet.pierce = this.pierce;
        bullet.angle = this.storedAngle;
        const gunLength = 30;
        bullet.x = this.body.x + Math.cos(this.storedAngle - Math.PI / 2) * gunLength;
        bullet.y = this.body.y + Math.sin(this.storedAngle - Math.PI / 2) * gunLength;
    
        Weapon.app.stage.addChild(bullet);
        Gun.bullets.push(bullet); 
        this.cooldownTimeLeft = this.cooldown;
        
    }
    
    // Mise a jour de la position du gun et des balles
    update(delta, cursorX, cursorY, deltaX, deltaY) {
        this.body.x = Weapon.joueur.getX() + Weapon.joueur.getWidth() / 2 - 1;
        this.body.y = Weapon.joueur.getY() + Weapon.joueur.getHeight() / 2 - 1;

        let dx = cursorX - 10 - this.body.x;
        let dy = cursorY - 10 - this.body.y;
        this.storedAngle = Math.atan2(dy, dx) + Math.PI / 2;
        this.body.rotation = this.storedAngle;


        // Iteration backwards quand on enleve des elements
        for (let i = Gun.bullets.length - 1; i >= 0; i--) {
            let b = Gun.bullets[i];
            b.x += (Math.cos(b.angle - Math.PI / 2) * 10) * delta + deltaX;
            b.y += (Math.sin(b.angle - Math.PI / 2) * 10) * delta + deltaY;

            // Enlever les balles qui sortent de l'écran
            if (
                b.x < -b.radius || b.x > Weapon.app.view.width + b.radius ||
                b.y < -b.radius || b.y > Weapon.app.view.height + b.radius
            ) {
                Weapon.app.stage.removeChild(b);
                b.destroy({ children: true, texture: true, baseTexture: true });
                Gun.bullets.splice(i, 1);
            }
        }
    }

    // Méthode qui vérifie une balle entre en collision avec un monstre
    isBulletCollidingWithMonster(monstre) {
        if (!monstre || !monstre.body) return;

        for (let i = Gun.bullets.length - 1; i >= 0; i--) {
            let bullet = Gun.bullets[i];
            if (!bullet || !monstre.body) continue;

            const bulletBounds = bullet.getBounds();
            const monstreBounds = monstre.body.getBounds();

            if (
                bulletBounds.x < monstreBounds.x + monstreBounds.width &&
                bulletBounds.x + bulletBounds.width > monstreBounds.x &&
                bulletBounds.y < monstreBounds.y + monstreBounds.height &&
                bulletBounds.y + bulletBounds.height > monstreBounds.y
            ) {
                this.onBulletHitEnemy(bullet, monstre);
                if(!bullet.touches.includes(monstre))
                {
                    bullet.pierce--;
                } 

                if(bullet.pierce <= 0)
                {
                    Weapon.app.stage.removeChild(bullet);
                    bullet.destroy({ children: true, texture: true, baseTexture: true });
                    Gun.bullets.splice(i, 1);
                }
                 
                bullet.touches[bullet.touches.length] = monstre;
            }
        }
    }

    // Gestion des effet lorsqu'une balle touche un monstre
    onBulletHitEnemy(bullet, monstre) {
        if (!monstre.getBulletHit() && !bullet.touches.includes(monstre)) {
            monstre.setBulletHit(true);
            const dmg = this.gunDMG();
            monstre.endommagé(dmg, this, Math.random() * 100 < Weapon.joueur.critChance);
        }
    }
}

/**
 * Sous-classe de Weapon pour représenter les explosions.
 */
export class Explosion extends Weapon {
    static explosions = [];
    static bodyKnockback = 10;

    constructor(x, y, rayon, baseDMG, couleur, isEnnemy = false) {
        super("explosion", 10, 10, new PIXI.Graphics());
        this.rayon = rayon;
        this.baseDMG = baseDMG;
        this.couleur = Weapon.Monstre.dedMilkMan ? 0xFFFFFF : couleur;
        this.maxRayon = rayon;
        this.currentRayon = Math.max(1, rayon / 20); // Éviter un rayon de 0
        this.knockback = Explosion.bodyKnockback;
        this.isEnnemy = isEnnemy;
        this.body = this.createExplosion(x, y);
        // S'assuer que body a x,y valides immédiatement
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
        
        // Initialise sa position avant la mise sur la scène
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
            if(!Weapon.Monstre.dedMilkMan)
            {
                this.body.alpha -= 0.065;
            }
            this.body.endFill();

            this.applyDamage(Weapon.monstres);

        } else {
            this.destroy();
        }
    }

    // Applique du damage aux monstres dans la rayon d'explosion
    applyDamage(monstres) {
        if (!this.body) return;

     
            monstres.forEach(monstre => {
                if (!monstre.getExplosionHit()) {
                    const distance = Math.hypot(this.body.x - monstre.getX(), this.body.y - monstre.getY());
                    if (distance <= this.currentRayon) {
                        monstre.setExplosionHit(true);
                        monstre.endommagé(this.baseDMG, this, Math.random() * 100 < Weapon.joueur.critChance);
                    }
                } 
            }); 
        if(this.isEnnemy)
        {

            const distance = Math.hypot(this.body.x - Weapon.Monstre.joueur.getX(), this.body.y - Weapon.Monstre.joueur.getY());
            if (distance <= this.currentRayon) {
                Weapon.Monstre.joueur.endommagé(this.baseDMG, this);
            }
        }
    }

    // Détruit l'explosion et la supprime de la scène 
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