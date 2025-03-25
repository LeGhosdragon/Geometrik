/**
 * La classe Joueur gère ses propriétés, son affichage, so progression et ses interactions
 * avec les monstres.
 */
export class Joueur {

    static Monstre = null;
    static upgrade = null;
    static Explosion = null;
    static EXP_BAR = document.getElementById('expBar');

    constructor(app, size = 16, vitesse = 1, baseHP = 20, currentHP = baseHP, baseDMG = 15, elapsedTime = 0, couleur = 0xFF0000, weapons = []) {
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
    }

    // Fonction pour créer le joueur
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
        this.exp += qty;
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
        let healthPercent =this.currentHP / this.baseHP;
        if (healthPercent < 0) healthPercent = 0;
    
        // Define pie chart parameters
        let radius = this.size- 1;
        let startAngle = -Math.PI / 2;  // Commence à partir du haut (position 12 heures)
        let endAngle = startAngle + (2 * Math.PI * healthPercent); // Fill proportionally
    
        // Déssiner le pir chart


        //4 principes
        //RNF sécurité
        
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
       
    // Gestion des Healt Points
    updateHP() {
        this.hpText.text = this.currentHP > 0 ?  Math.round(this.currentHP) : ""; // Keep the HP text
        this.hpText.x = this.getX() + this.size;
        this.hpText.y = this.getY() + this.size;
    
        this.updateHealthBar();  // Update the pie chart health bar
    }
    
 
    // Gestion de la progression du joueur
    // 1. vérifie si le joueur a accumulé assez d'EXP pour monter de niveau
    // 2. augmente le niveau du joueur
    // 3. propose des upgrades au joueur
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

    // Gestion de la barre d'EXP
    getExpBar(width = 20) {
        let progress = Math.floor((this.exp / this.expReq) * width);
        let bar = "[" + "#".repeat(progress < 20 ? progress : 20) + "-".repeat(width - progress) < 20 ? Math.abs(width - progress) : 20 + "]";
        return `Lvl ${this.lvl} ${bar} ${this.exp}/${this.expReq}`;
    }

    // Gestion des dégats subis par le joueur
    endommagé(dmg)
    {
        if(this.upgExplosion)
        {
            new Joueur.Explosion(this.getX() + this.size, this.getY()+ this.size, this.body.width * 6 * this.explRadius, this.baseDMG/3, 0xFF0000);    
        }
        this.setHP(this.getHP() - dmg);
        this.updateHP();
    }

    // get la distance d'attraction du joueur
    getMagDist()
    {
        return this.distanceDattraction;
    }

    // association des objets externes mstr et upg avec la classe joueur
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


