export class Exp {
    static exps = [];
    static app = null;
    static joueur = null;
    static expBuildUp = 0;

    constructor(x, y, qty) {
        this.qty = qty;
        this.body = this.createEXP(x, y);
        this.color = 0x000000;
        this.size = Math.max(qty / (Exp.joueur?.lvl * Exp.joueur?.lvl + 20), 5);
        this.isIn = true;
        
        this.vx = 0; // Velocity in X direction
        this.vy = 0; // Velocity in Y direction

        Exp.exps.push(this);
    }

    createEXP(x = 0, y = 0) {
        const EXP = new PIXI.Graphics();
        EXP.x = x;
        EXP.y = y;
        EXP.pivot.set(0, 0);
        EXP.beginFill(0x0000FF);
        EXP.drawCircle(0, 0, this.size);
        EXP.endFill();

        if (Exp.app) {
            Exp.app.stage.addChild(EXP);
        }
        return EXP;
    }

    updatePos(deltaX, deltaY) {
        if (!Exp.joueur || !this.body) return;

        this.body.x += deltaX;
        this.body.y += deltaY;
        let playerX = Exp.joueur.getX() + Exp.joueur.getWidth() / 2;
        let playerY = Exp.joueur.getY() + Exp.joueur.getHeight() / 2;
        let dx = playerX - this.body.x;
        let dy = playerY - this.body.y;
        let distance = Math.hypot(dx, dy);

        // Apply attraction force towards the player
        if (distance < Exp.joueur.distanceDattraction + this.size) {
            let attraction = 0.5 / Math.max(distance, 10); // Higher force for closer distances
            this.vx += dx * attraction;
            this.vy += dy * attraction;
        }

        // Apply velocity with damping
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.body.x += this.vx;
        this.body.y += this.vy;

        // Change color dynamically (pulsing rainbow effect)
        const time = Date.now() / 100;
        const red = Math.sin(time) * 127 + 128;
        const green = Math.sin(time + 2) * 127 + 128;
        const blue = Math.sin(time + 4) * 127 + 128;
        const color = (red << 16) | (green << 8) | blue;

        this.body.clear();
        this.body.beginFill(color);
        this.body.drawCircle(0, 0, this.size);
        this.body.endFill();

        if (distance < 16 + this.size) {
            this.collect();
        }
    }

    static cleanup(delta) {
        Exp.exps.forEach((exp1, i) => {
            Exp.exps.forEach((exp2, j) => {
                if (i >= j || !exp1.body || !exp2.body) return;

                let dx = exp2.getX() - exp1.getX();
                let dy = exp2.getY() - exp1.getY();
                let distance = Math.hypot(dx, dy);

                if (distance < 100) { // Attraction between EXPs
                    let attraction = 0.2 / Math.max(distance, 10);
                    exp1.vx += dx * attraction * delta;
                    exp1.vy += dy * attraction * delta;
                    exp2.vx -= dx * attraction * delta;
                    exp2.vy -= dy * attraction * delta;
                }

                if (distance < 10 + exp1.size + exp2.size) { // Fusion
                    exp1.qty += exp2.qty;
                    exp1.size = Math.max(exp1.qty / (Exp.joueur?.lvl + 20), 5);
                    Exp.app.stage.removeChild(exp2.body);
                    exp2.body.destroy({ children: true });
                    exp2.body = null;
                    Exp.exps.splice(j, 1);
                }
            });
            // Remove orbs that leave the screen + 40%
            let screenWidth = Exp.app.renderer.width;
            let screenHeight = Exp.app.renderer.height;
            let marginX = screenWidth * 0.4;
            let marginY = screenHeight * 0.4;

            let x = exp1.getX();
            let y = exp1.getY();
            
            if (x < -marginX || x > screenWidth + marginX || y < -marginY || y > screenHeight + marginY) {
                Exp.expBuildUp += exp1.qty/2;//pour que l'utilisateur veuille pareil aller chercher le EXP
                let index = Exp.exps.indexOf(exp1);
                Exp.app.stage.removeChild(exp1.body);
                if (index !== -1) {
                    Exp.exps.splice(index, 1);
                }
                exp1.body.destroy({ children: true });
                exp1.body = null;
            }
        });
    }

    collect() {
        if (!this.body) return;
        let index = Exp.exps.indexOf(this);
        if (index !== -1) {
            Exp.exps.splice(index, 1);
        }
        Exp.joueur.addExp(this.qty);
        Exp.app.stage.removeChild(this.body);
        this.body.destroy({ children: true });
        this.body = null;
    }

    getX() { return this.body?.x ?? 0; }
    getY() { return this.body?.y ?? 0; }

    static addApp(appInput) {
        Exp.app = appInput;
    }

    static addJoueur(joueurInput) {
        Exp.joueur = joueurInput;
    }
}
