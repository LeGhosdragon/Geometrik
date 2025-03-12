export class Exp {
    static exps = [];
    static app = null;
    static joueur = null;

    constructor(x, y, qty) {
        this.qty = qty;
        this.vx = 0; // Initialize velocity
        this.vy = 0;
        this.body = this.createEXP(x, y);
        this.color = 0x000000;
        Exp.exps.push(this);
    }

    createEXP(x = 0, y = 0) {
        const EXP = new PIXI.Graphics();
        EXP.x = x;
        EXP.y = y;
        EXP.pivot.set(0, 0);

        // Initial color
        EXP.beginFill(0x0000FF);
        EXP.drawCircle(0, 0, 5);
        EXP.endFill();

        if (Exp.app) {
            Exp.app.stage.addChild(EXP);
        }

        return EXP;
    }

    updatePos(deltaX = 0, deltaY = 0) {
        if (!Exp.joueur || !this.body) return; // Ensure the player exists and the object is not deleted
    
        this.body.x += deltaX;
        this.body.y += deltaY;
    
        let playerX = Exp.joueur.getX() + Exp.joueur.getWidth() / 2;
        let playerY = Exp.joueur.getY() + Exp.joueur.getHeight() / 2;
    
        let dx = playerX - this.body.x;
        let dy = playerY - this.body.y;
        let distance = Math.hypot(dx, dy);
    
        // Pulsing rainbow effect
        const time = Date.now() / 100;
        const red = Math.sin(time) * 127 + 128;
        const green = Math.sin(time + 2) * 127 + 128;
        const blue = Math.sin(time + 4) * 127 + 128;
        const color = (red << 16) | (green << 8) | blue;
    
        this.body.clear();
        this.body.beginFill(color);
        this.body.drawCircle(0, 0, 5);
        this.body.endFill();
    
        if (distance < 16) {
            this.collect();
        } else if (distance < Exp.joueur.getMagDist()) {
            let force = 0.2 / Math.max(distance, 10);
    
            this.vx += dx * force;
            this.vy += dy * force;
    
            this.vx *= 0.95;
            this.vy *= 0.95;
    
            this.body.x += this.vx;
            this.body.y += this.vy;
        }
    }

    collect() {
        if (!this.body) return; // Prevent double deletion

        let index = Exp.exps.indexOf(this);
        if (index !== -1) {
            Exp.exps.splice(index, 1); // Remove from active list
        }

        Exp.joueur.addExp(this.qty); // Give EXP to player

        if (Exp.app) {
            Exp.app.stage.removeChild(this.body);
        }

        this.body.destroy({ children: true }); // Fully remove PIXI object
        this.body = null; // Remove reference for garbage collection
    }

    getX() { return this.body?.x ?? 0; }
    getY() { return this.body?.y ?? 0; }

    static addApp(appInput) {
        Exp.app = appInput;
        Exp.app.ticker.add(() => {
            Exp.exps.forEach(exp => exp.updatePos());
        });
    }

    static addJoueur(joueurInput) {
        Exp.joueur = joueurInput;
    }
}
