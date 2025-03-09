import { setupKeyboardControls } from './mouvement.js';
import { Monstre, MonstreNormal, MonstreRunner, MonstreTank } from './monstre.js';
import { drawGridBackground, updateBackgroundColor } from './background.js';
import { Joueur } from './joueur.js';
import { Weapon, Sword, Explosion } from './weapons.js';
import { Exp } from './experience.js';


// Aliases
const Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;



//DEBUG ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// la touche Q active ou désactive l'épée
// la touche T active ou désactive les textes de vie des ennemis
//
//
//
//
//
//
//
//
//
//
//
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create a Pixi Application

//noComeBacks makes it so the spawner stops to let in the ones that were lost tot the cleansing !
let joueur, state, ennemiColor = 0x0000ff, xF = 0, yF = 0, 
monstres = Monstre.monstres, explosions = Explosion.explosions, exps = Exp.exps, 
sword, hasSword = false, noComeBacks = false, dedPos = 0, mstr = Monstre,
cursorX, cursorY;

const app = new Application({
    width: 900,
    height: 900,
    antialias: true,
    transparent: false,
    resolution: 1,
    backgroundColor: 0x000000
});

document.body.appendChild(app.view);

function setup() {
    resizeApp();

    Monstre.addApp(app);
    Weapon.addApp(app);
    Weapon.addMonstres(monstres);
    joueur = new Joueur(app);
    Weapon.addJoueur(joueur);
    Exp.addJoueur(joueur);
    Exp.addApp(app);


    sword = new Sword(1, 15, 80, hasSword);  // Blue rectangle of 10x80
    
    
    
    // Create monsters at regular intervals
    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;
    setInterval(() => { 
        ajouterMONSTRE( 3, "normal", 3 + (i % 60 == 0 ? j++ : j - 1));
        i++;
    }, 1000);
    setInterval(() => { 
        ajouterMONSTRE( 3, "runner", 4);
    }, 1000);
    setInterval(() => { 
        ajouterMONSTRE( 3, "tank", 6 + (k % 60 == 0 ? l++ : l - 1));
        k++;
    }, 1000);
    // setInterval(() => {
    //     new Exp (0,0, 10);
    // }, 100);

    setInterval(() => {
        Monstre.cleanup();
    });

    setupKeyboardControls(joueur, sword, mstr);


    // Set the game state
    state = play;
    // Start the game loop
    app.ticker.add((delta) => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

// Update cursor position on mouse move
document.addEventListener("mousemove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
});

function play() {
    let xI = xF;
    let yI = yF;
    xF += joueur.getVX();
    yF += joueur.getVY();

    grid.x -= joueur.getVX();
    grid.y -= joueur.getVY();

    ennemiColor = updateBackgroundColor(app);

    sword.playSwordSwing(cursorX, cursorY);
    
    
    monstres.forEach(monstre => {
        monstre.bouger(joueur, -(xF - xI), -(yF - yI), ennemiColor);
        if(sword.hasSword)
        {
            if (sword.isSwordCollidingWithMonster(monstre)) {
                //new Explosion(monstre.getX(), monstre.getY(), monstre.body.width*2, 1, 0xFF0000);
                dedPos = sword.onSwordHitEnemy(monstre);

                if (Array.isArray(dedPos)) {
                    new Exp(dedPos[0], dedPos[1], 10);
                }                
            }
        }
    });

    

    explosions.forEach(explosion => {
        explosion.updateExplosion();
        explosion.applyDamage(monstres);
    });

    exps.forEach(exp => {
        exp.updatePos(-(xF - xI), -(yF - yI));
    });
    
    joueur.onPlayerCollision(monstres);
}


function ajouterMONSTRE(amount = 1, type = "normal", sides = 3) {  
    
    if((Monstre.cleanMonstres.length < 10 || noComeBacks) && Monstre.monstres.length < 200)
    {
        if(type == "normal") { 
        for (let i = 0; i < amount; i++) {
            let rngPos = posRandomExterieur(app);
            const monstre = new MonstreNormal( rngPos[0], rngPos[1], sides);
            app.stage.addChild(monstre.body);
            monstres.push(monstre);
        }} else if(type == "runner") {
            for (let i = 0; i < amount; i++) {
                let rngPos = posRandomExterieur(app);
                const monstre = new MonstreRunner( rngPos[0], rngPos[1], sides);
                app.stage.addChild(monstre.body);
                monstres.push(monstre);
            }
        }
        else if(type == "tank") {
            for (let i = 0; i < amount; i++) {
                let rngPos = posRandomExterieur(app);
                const monstre = new MonstreTank( rngPos[0], rngPos[1], sides);
                app.stage.addChild(monstre.body);
                monstres.push(monstre);
            }
        }
    }
    else{
        placeOldOnes();
    }

}


function placeOldOnes()
{
    Monstre.cleanMonstres.forEach(monstre => {
        if (!monstre.isIn) {
            //console.log("ITS IN");
            monstre.isIn = true;
            Monstre.monstres.push(monstre);

            let index = Monstre.cleanMonstres.indexOf(monstre);
            if (index !== -1) {
                Monstre.cleanMonstres.splice(index, 1);
            }
        }        
        let rngPos = posRandomExterieur(app);

        monstre.setX(rngPos[0]);
        monstre.setY(rngPos[1]);
    });
}


function posRandomExterieur(app) {
    let randomX = Math.random() * app.view.width;
    let randomY = Math.random() * app.view.height;
    
    if(Math.random() < 0.5 ? -1 : 1 == -1) {
        randomX = (((Math.random() < 0.5 ? 1 : -1)) * app.view.width) + Math.random() * app.view.width/3;
    } else {
        randomY = (((Math.random() < 0.5 ? 1 : -1)) * app.view.height) + Math.random() * app.view.height/3;
    }
    return [randomX, randomY];
}

// Draw the grid background
let grid = drawGridBackground(app);

// Resize event to update grid background when window is resized
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.removeChildren(); // Remove previous grid
    drawGridBackground(app); // Redraw the grid with new dimensions
});

function resizeApp() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    app.renderer.resize(width * 0.989, height * 0.98);
}

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);
loader.add("-").load(setup);
