export class Joueur {

    static Monstre = null;
    static upgrade = null;
    static Explosion = null;
    static EXP_BAR = document.getElementById('expBar');

    constructor(app, size = 16, vitesse = 1, baseHP = 20, currentHP = baseHP, baseDMG = 15, elapsedTime = 0, couleur = 0xFF0000, weapons = []) {
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
        this.explRadius = 1;
        this.upgExplosion = false;
        this.baseDMG = baseDMG;
        this.elapsedTime = elapsedTime;
        this.couleur = couleur;
        this.weapons = weapons;
        this.bulletHit = false;
        this.body = this.faireJoueur();
        this.hpText = this.createHPText();
        this.healthBar = this.createHealthBar();
        this.updateHealthBar();
    }

    // Function to create the player (joueur)
    faireJoueur() {
        const joueur = new PIXI.Graphics();
        joueur.lineStyle(3, 0x000000, 1);
        joueur.beginFill(this.couleur);
        if(Joueur.Monstre.dedMilkMan)
        {
            joueur.beginFill(0xFF0000);
        }
        
        joueur.drawCircle(this.size, this.size, this.size);
        joueur.endFill();
        joueur.zIndex = 99;
        joueur.x = window.innerWidth/2;
        joueur.y = window.innerHeight/2;
        joueur.vx = 0;
        joueur.vy = 0;
    
        this.app.stage.addChild(joueur);
        return joueur;
    }


    onPlayerCollision(monstres) {
        let collidedMonstres = [];
    
        monstres.forEach(monstre => {
            // Check for collision between player and each monster
            if (this.hitTestCircle(monstre)) {
                collidedMonstres.push(monstre); // Store the collided monster
            }
        });
            
        // Remove collided monsters from the main array
        collidedMonstres.forEach(monstre => {
            if(!this.isImmune)
            {
                this.endommagé(monstre.getDMG());
                this.isImmune = true;
                setTimeout(() => {this.isImmune = false;}, 750);
            }

            // Now resolve overlap by pushing the monster apart (player stays immovable)
            let dx = this.getX() + this.getWidth()/2  - monstre.getX() - monstre.size / 2;
            let dy = this.getY() + this.getHeight()/2 - monstre.getY() - monstre.size / 2;

            let distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.getWidth()/2.5 + monstre.getWidth() / 2; // Minimum distance to avoid overlap

            if (distance < minDistance) {
                let overlap = minDistance - distance; // Calculate the overlap distance
                let angle = Math.atan2(dy, dx); // Get angle of collision

                // Push the monster apart from the player along the collision vector
                let pushX = Math.cos(angle) * overlap;
                let pushY = Math.sin(angle) * overlap;

                // Move the monster away from the player
                monstre.setX(monstre.getX() - pushX);
                monstre.setY(monstre.getY() - pushY);
            }
        });
    }
    
    
    // Collision detection based on circle (using radius)
    hitTestCircle(autreCercle) {
        // Define the distance between the centers of the two objects
        let dx = this.getX() + this.getWidth()/2.3 - autreCercle.getX();
        let dy = this.getY() + this.getHeight()/2.3 - autreCercle.getY();
    
        // Calculate the distance between the centers
        let distance = Math.sqrt(dx * dx*0.9 + dy * dy*0.9);
    
        // Get the radius of the joueur and the box (consider box as circle for collision)
        let thisRadius = this.getWidth() / 2;
        let autreCercleRadius = autreCercle.getWidth() / 2;
    
        // Check for a collision
        if (distance < thisRadius + autreCercleRadius) {
            return true; // There's a collision
        }
        return false; // No collision
    }

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

    addExp(qty)
    {
        this.exp += qty;
        this.updateHP();
        this.updatelvl();
        this.updateExpBar()
    }

    updateExpBar() {
        let height = window.innerHeight;
        let width = window.innerWidth;
        let expRatio = this.exp / this.expReq + 0.02;
    
        Joueur.EXP_BAR.style.height = `${expRatio * height}px`;
        Joueur.EXP_BAR.style.width = `${width}px`;
    }
    createHealthBar() {
        const healthBar = new PIXI.Graphics();
        healthBar.zIndex = 100;
        this.app.stage.addChild(healthBar);
        return healthBar;
    }

    updateHealthBar() {
        this.healthBar.clear();
    
        // Calculate the health percentage
        let healthPercent = this.currentHP / this.baseHP;
        if (healthPercent < 0) healthPercent = 0;
    
        // Define pie chart parameters
        let radius = this.size- 1;
        let startAngle = -Math.PI / 2;  // Start from the top (12 o'clock position)
        let endAngle = startAngle + (2 * Math.PI * healthPercent); // Fill proportionally
    
        // Draw pie chart
        if(this.currentHP / this.baseHP != 1)
        {
            this.healthBar.lineStyle(3, 0x000000, 1);
        }
        
        if(Joueur.Monstre.dedMilkMan)
        {
            this.healthBar.beginFill(0xFFFFFF, 1);
        }
        else{this.healthBar.beginFill(0x9966FF, 1);}
         // Red color for HP
        this.healthBar.moveTo(this.getX() + this.size, this.getY() + this.size);
        this.healthBar.arc(this.getX() + this.size, this.getY() + this.size, radius, startAngle, endAngle);
        this.healthBar.lineTo(this.getX() + this.size, this.getY() + this.size);
        this.healthBar.endFill();
    }
       
    updateHP() {
        this.hpText.text = this.currentHP > 0 ? this.currentHP : ""; // Keep the HP text
        this.hpText.x = this.getX() + this.size;
        this.hpText.y = this.getY() + this.size;
    
        this.updateHealthBar();  // Update the pie chart health bar
    }
    

    updatelvl()
    {
        if(this.exp >= this.expReq)
        {

            this.lvl+=1;
            this.exp = this.exp - this.expReq < 0 ? 0 : this.exp- this.expReq;
            this.expReq = 7 + Math.round(this.lvl**1.9);
            //functLvLUp();
            let upgrades = Joueur.upgrade.choisirUpgrade(5);
            Joueur.upgrade.montrerUpgrades(upgrades);
            //Joueur.upgrade.upgradeChoisi(upgrades[0]);
            // this.body.vx = 0;
            // this.body.vy = 0;
            
        }
    }

    getExpBar(width = 20) {
        let progress = Math.floor((this.exp / this.expReq) * 20);
        let bar = "[" + "#".repeat(progress < 20 ? progress : 20) + "-".repeat(Math.abs(width - progress) < 20 ? Math.abs(width - progress) : 20) + "]";
        return `Lvl ${this.lvl} ${bar} ${this.exp}/${this.expReq}`;
    }

    endommagé(dmg)
    {
        if(this.upgExplosion)
        {
            new Joueur.Explosion(this.getX() + this.size, this.getY()+ this.size, this.body.width * 6 * this.explRadius, this.baseDMG/3, 0xFF0000);
        }
        this.setHP(this.getHP() - dmg);
        this.updateHP();
    }

    getMagDist()
    {
        return this.distanceDattraction;
    }
    static addMonstre(Monstre)
    {
        Joueur.Monstre = Monstre;
    }
    static addUpgrade(upg)
    {
        Joueur.upgrade = upg;
    }
    static addExplosion(expl)
    {
        Joueur.Explosion = expl;
    }



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


