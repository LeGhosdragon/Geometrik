export class Joueur {

    static Monstre = null;
    static upgrade = null;
    static Upgrade = null;
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
        
        this.hpText = this.createHPText();
        this.healthBar = this.createHealthBar();
        this.updateHealthBar();
        this.body.visible = false;
        this.hpText.visible = false;
        this.healthBar.visible = false;
        this.damageFlash = this.createDmgFlash(app);
        this.statistics = {UserName: "Guest", kills : 0, dmgDealt : 0, dmgTaken : 0, expGained : 0,  timePlayed : 0, score : 0};//timePlayed*kills*expGained};
    }

    // Function to create the player (joueur)
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
        this.statistics.expGained += qty;
        this.updateHP();
        this.updatelvl();
        this.updateExpBar();
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
        let radius = this.size - 1;
        let startAngle = -Math.PI / 2; // Start from the top (12 o'clock position)
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
    
    
       
    updateHP() {
        this.hpText.text = this.currentHP.toFixed(1) > 0 ? (this.currentHP).toFixed(1)%1 > 0 ? (this.currentHP).toFixed(1) : this.currentHP.toFixed(0) : this.playerDied(); // Keep the HP text
        this.hpText.x = this.getX() + this.size;
        this.hpText.y = this.getY() + this.size;
    
        this.updateHealthBar();
    }
    

    updatelvl()
    {
        if(this.exp >= this.expReq)
        {
            this.lvl+=1;
            this.exp = this.exp - this.expReq < 0 ? 0 : this.exp- this.expReq;
            this.expReq = 7 + Math.round(this.lvl**1.9);
            let upgrades = Joueur.upgrade.choisirUpgrade(this.numChoix);
            Joueur.upgrade.montrerUpgrades(upgrades); 
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
        this.statistics.dmgTaken+=dmg;
        this.triggerDamageEffect();
        this.setHP(this.getHP() - dmg);
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
    

    playerDied() {  
        
        Joueur.Grid.pauseGrid(this.app);
        this.app.pause = true;
        this.statistics.score = ((this.statistics.kills <= 0 ? 1:this.statistics.kills) * (this.statistics.expGained <= 0 ? 1:this.statistics.expGained)  * this.statistics.timePlayed).toFixed(0);
        const seconde = ((this.statistics.timePlayed%60000)/1000);
        const minute = ((this.statistics.timePlayed%3600000)/1000 - seconde);
        const heure = ((this.statistics.timePlayed%(3600000 * 60))/1000 - minute - seconde);
        this.statistics.timePlayed = this.statistics.timePlayed.toFixed(0) + "( " + Math.abs(heure.toFixed(0)) + "h " + minute.toFixed(0)/60 + "min " + seconde.toFixed(2) + "s "+ ")";
        const gameOverText = new PIXI.Text("Game Over", {
            fontFamily: 'courier new',
            fontSize: 72,
            weight: 'bold',
            fill: 0xFF0000,
            align: 'center'
        });
        gameOverText.anchor.set(0.5);
        gameOverText.x = this.app.renderer.width / 2;
        gameOverText.y = this.app.renderer.height / 2;
        gameOverText.zIndex = 10000;
        this.app.stage.addChild(gameOverText);
        
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
                    this.sendStatsToDB();
                    ticker.stop(); 
                }
            });
            ticker.start(); 
        }, 2000);
        

        return "";

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
                Joueur.addupgrade(new Joueur.Upgrade(weapon));
                Joueur.Grid.pauseGrid(this.app)
                this.app.pause = false;
                this.body.visible = true;
                this.hpText.visible = true;
                this.healthBar.visible = true;
                
                document.body.removeChild(container);
            });
            container.appendChild(card);
        });
        
        document.body.appendChild(container);
    
    }


    sendStatsToDB()
    {



        //à faire
    }


    createStatsBoards() {
        const container = document.createElement("div");
        container.id = "stats-container";
        container.style.position = "absolute";
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
    
        // Title for the card
        const cardTitle = document.createElement("h2");
        cardTitle.textContent = "Statistics";
        cardTitle.style.fontFamily = "courier new";
        cardTitle.style.fontSize = "32px";
        cardTitle.style.marginBottom = "20px";
        cardTitle.style.textAlign = "center";
        card.appendChild(cardTitle);
    
        // Loop through statistics object and create text for each
        for (let [statName, statValue] of Object.entries(this.statistics)) {
            
            const statRow = document.createElement("div");
            statRow.style.display = "flex";
            statRow.style.justifyContent = "space-between";
            statRow.style.marginBottom = "10px";
            statRow.style.padding = "5px 10px";
            statRow.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            statRow.style.borderRadius = "10px";
    
            // Stat name
            const name = document.createElement("span");
            name.textContent = this.formatStatName(statName);
            name.style.fontFamily = "courier new";
            name.style.fontSize = "18px";
            name.style.color = "#ccc";
    
            // Stat value
            const value = document.createElement("span");
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
    
        // Append card to container
        container.appendChild(card);
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
    
    getMagDist()
    {
        return this.distanceDattraction;
    }
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


