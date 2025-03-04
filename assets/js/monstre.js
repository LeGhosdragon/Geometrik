export class Monstre {
    static monstres = [];
    static cleanMonstres = [];
    static app = null;

    constructor(x, y, sides, size, type, vitesse = 1, spinSpeed = 0.02, baseHP = 100, baseDMG = 1, couleur = 0xff0000) {
        this.isIn = true;
        this.lifeShow = false;
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

        if(this.lifeShow && this.currentHP <= 0)
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
            let index = Monstre.monstres.indexOf(this);
            Monstre.app.stage.removeChild(this.hpText);
            if (index !== -1) {
                Monstre.monstres.splice(index, 1);
            }
            // Clear the monster's graphics
            this.body.clear();
            
            return;
        }
        
        if(this.lifeShow)
        {
            this.hpText.text = this.currentHP;
            this.hpText.x = this.getX();
            this.hpText.y = this.getY() - 10;
        }
        else{Monstre.app.stage.removeChild(this.hpText);}
        return

    }
      
    
    endommagé(dmg) {
        this.setHP(this.getHP() - dmg);
        this.updateHP();
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
    setSwordHit(bool)
    {
        this.hasSwordHit = bool;
    }
    getSwordHit()
    {
        return this.hasSwordHit;
    }
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
        const size = 0.2;
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


