export class Exp {
    static exps = [];
    static app = null;
    static joueur = null;

    constructor(x, y, qty) {
        this.qty = qty;
        this.body = this.createEXP(x, y);
        this.color = 0x000000;
        Exp.exps.push(this); // Ajouter à la liste des orbes d'expérience
    }

    createEXP(x = 0, y = 0) {
        const EXP = new PIXI.Graphics();
        EXP.x = x;
        EXP.y = y;
        EXP.pivot.set(0, 0);

        // Dessiner un cercle bleu pour représenter l'expérience
        EXP.beginFill(0x0000FF);
        EXP.drawCircle(0, 0, 5);
        EXP.endFill();

        if (Exp.app) {
            Exp.app.stage.addChild(EXP);
        }

        return EXP;
    }

    updatePos(deltaX = 0, deltaY = 0) {
        if (!Exp.joueur) return; // Vérifier si le joueur est défini
    
        // Move with the background (this is what was missing)
        this.body.x += deltaX;
        this.body.y += deltaY;
    
        let playerX = Exp.joueur.getX() + Exp.joueur.getWidth() / 2;
        let playerY = Exp.joueur.getY() + Exp.joueur.getHeight() / 2;
    
        let dx = playerX - this.body.x;
        let dy = playerY - this.body.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
    
        // Pulsing rainbow effect
        const time = Date.now() / 100; // Time-based value to cycle the colors
        const red = Math.sin(time) * 127 + 128;  // RGB value for red
        const green = Math.sin(time + 2) * 127 + 128;  // RGB value for green
        const blue = Math.sin(time + 4) * 127 + 128;  // RGB value for blue
    
        const color = (red << 16) | (green << 8) | blue; // Combine RGB into hex color format
    
        // Clear the previous circle
        this.body.clear(); 
    
        // Draw the orb with the new color
        this.body.beginFill(color);  
        this.body.drawCircle(0, 0, 5); 
        this.body.endFill();
        if (distance < 3) {
            this.collect(); // Collect the orb when close enough
            delete this;
        } else if (distance < Exp.joueur.getMagDist()) {
            // If within attraction range, adjust movement towards the player
            let force = 0.2 / Math.max(distance, 10); // Attraction force (weaker when far, stronger when close)
    
            this.vx = (this.vx || 0) + dx * force; // Apply force to velocity
            this.vy = (this.vy || 0) + dy * force;
    
            let friction = 0.95; // Slow down movement over time (prevents jitter)
            this.vx *= friction;
            this.vy *= friction;
    
            this.body.x += this.vx;
            this.body.y += this.vy;
        }
    }
    
    
    
    

    collect() {
        let index = Exp.exps.indexOf(this);
        if (index !== -1) {
            
            Exp.exps.splice(index, 1);
        }
        this.body.clear();
        Exp.joueur.addExp(this.qty);
        delete this;
    }

    getX() { return this.body.x; }
    setX(x) { this.body.x = x; }
    getY() { return this.body.y; }
    setY(y) { this.body.y = y; }
    setBody(body) { this.body = body; }
    getQty() { return this.qty; }

    static addApp(appInput) {
        Exp.app = appInput;
        // Ajouter un ticker pour animer les orbes
        Exp.app.ticker.add(() => {
            Exp.exps.forEach(exp => exp.updatePos());
        });
    }

    static addJoueur(joueurInput) {
        Exp.joueur = joueurInput;
    }
}
