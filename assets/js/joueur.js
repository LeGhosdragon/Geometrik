export class Joueur {

    constructor(app, size = 16, vitesse = 1, baseHP = 100, currentHP = baseHP, baseDMG = 10, elapsedTime = 0, couleur = 0x9966FF, weapons = []) {
        this.app = app;
        this.size = size;
        this.vitesse = vitesse;
        this.baseHP = baseHP;
        this.currentHP = currentHP;
        this.baseDMG = baseDMG;
        this.elapsedTime = elapsedTime;
        this.couleur = couleur;
        this.weapons = weapons;
        this.body = this.faireJoueur();
        this.hpText = this.createHPText();
    }

    // Function to create the player (joueur)
    faireJoueur() {
        const joueur = new PIXI.Graphics();
        joueur.beginFill(this.couleur);
    
        
        joueur.drawCircle(this.size, this.size, this.size);
    
        joueur.endFill();
        
        joueur.x = window.innerWidth/2;
        joueur.y = window.innerHeight/2;
        joueur.vx = 0;
        joueur.vy = 0;
    
        this.app.stage.addChild(joueur);
        return joueur;
    }


    onPlayerCollision(monstres, message) {
        let collidedMonstres = [];
    
        monstres.forEach(monstre => {
            // Check for collision between player and each monster
            if (this.hitTestCircle(monstre)) {
                // console.log('Player touched an enemy!');
                // message.text = "Player hit an enemy!";
                // monstre.tint += 0x9966FF; // Change monster color upon collision (optional)
                collidedMonstres.push(monstre); // Store the collided monster
            }
        });
    
        // Remove collided monsters from the main array
        collidedMonstres.forEach(monstre => {
            this.endommagé(monstre.getDMG());
            monstre.setHP(0);
            
        });
    }
    
    
    // Collision detection based on circle (using radius)
    hitTestCircle(autreCercle) {
        // Define the distance between the centers of the two objects
        let dx = this.getX() + this.getWidth()/2 - autreCercle.getX();
        let dy = this.getY() + this.getHeight()/2 - autreCercle.getY();
    
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
            fill: 0xFFFFFF,
            align: 'center'
        });
        text.anchor.set(0.5);
        text.x = this.body.x + this.size;
        text.y = this.body.y + this.size;
        this.app.stage.addChild(text);
        return text;
    }

    // Update HP display
    updateHP() {
        if(this.currentHP <= 0)
        {
            this.setHP(0);
        }
        this.hpText.text = this.currentHP;
        this.hpText.x = this.getX() + this.size;
        this.hpText.y = this.getY() + this.size;
    }

    endommagé(dmg)
    {
        this.setHP(this.getHP() - dmg);
        this.updateHP();
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


}


