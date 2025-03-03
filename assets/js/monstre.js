
export class Monstre {
    static monstres = [];
    constructor(x, y, sides, size, type, vitesse = 1, spinSpeed = 0.02, hp = 100, dmg = 1, elapsedTime = 0, couleur = 0xff0000, oscillates = true, spins = true) {
        this.size = size;
        this.vitesse = vitesse;
        this.spinSpeed = spinSpeed;
        this.couleur = couleur;
        this.sides = sides;
        this.type = type
        this.hp = hp;
        this.dmg = dmg;
        this.body = this.createShape(x, y);
        this.elapsedTime = elapsedTime;
        this.oscillates = oscillates;
        this.spins = spins;
    }

    // Ceci est la référence à la forme du monstre en PIXI, alors x et y sont les coordonnées de la forme
    createShape(x = 0, y = 0) {
        const shape = new PIXI.Graphics();
        shape.x = x;
        shape.y = y;
        shape.sides = this.sides;
        shape.pivot.set(0, 0);
        return shape;
    }

    vecteurVersLeJoueur(joueur) {
        let dx = joueur.x + joueur.width / 2 - this.getX();
        let dy = joueur.y + joueur.height / 2 - this.getY();
        let magnitude = Math.sqrt(dx * dx + dy * dy);
      
        return { x: this.vitesse * dx / magnitude, y: this.vitesse * dy / magnitude };
    }

    actualiserPolygone(ennemiColor) {
        if (this.sides < 3) return; // A polygon must have at least 3 sides
    
        this.elapsedTime += 3;

        let newSize = this.oscillates ? this.size + 0.05 * Math.cos(this.elapsedTime / 50.0) : this.size;

        this.body.clear();
        this.body.beginFill(ennemiColor);
    
        const radius = newSize * 50; // Adjust size scaling
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
    }

    bouger(joueur, deltaX, deltaY, ennemiColor) {
        let moveVector = this.vecteurVersLeJoueur(joueur);
        this.setX(this.getX() + moveVector.x + deltaX);
        this.setY(this.getY() + moveVector.y + deltaY);
        this.spins ? this.body.rotation += this.spinSpeed : 0;
        this.avoidMonsterCollision();
        this.actualiserPolygone(ennemiColor);
    }

        // Function to check and handle collision avoidance between monsters
        avoidMonsterCollision() {
            const minDistance = 75 * this.size; // Minimum distance between monsters to avoid collision
            const avoidFactor = 1; // Smaller value for less avoidance movement
    
            Monstre.monstres.forEach(otherMonstre => {
                // Skip self-collision check (monstre vs. itself)
                if (this === otherMonstre) return;
    
                let dx = this.getX() - otherMonstre.getX();
                let dy = this.getY() - otherMonstre.getY();
                let distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance < minDistance) {
                    // Apply smaller avoidance: move the monster away by a smaller factor
                    let angle = Math.atan2(dy, dx);
                    let avoidX = Math.cos(angle) * avoidFactor; // Smaller movement to avoid collision
                    let avoidY = Math.sin(angle) * avoidFactor;
    
                    // Move the monster slightly away from the other monster
                    this.setX(this.getX() + avoidX);
                    this.setY(this.getY() + avoidY);
                }
            });
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



}

export class MonstreNormal extends Monstre {
    constructor(x, y, sides, size = 0.3, type = "normal") {
        super(x, y, sides, size, type);
    }
}

export class MonstreRunner extends Monstre {
    constructor(x, y, sides, size = 0.2, type = "runner") {
        super(x, y, sides, size, type, 3, 0.5);
    }
}
export class MonstreTank extends Monstre {
    constructor(x, y, sides, size, type = "tank") {
        super(x, y, sides, size, type, 0.4);
    }
}