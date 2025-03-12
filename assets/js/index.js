import { setupKeyboardControls } from './mouvement.js';
import { Monstre, MonstreNormal, MonstreRunner, MonstreTank } from './monstre.js';
import { drawGridBackground, updateBackgroundColor } from './background.js';
import { Joueur } from './joueur.js';
import { Weapon, Sword, Explosion, Gun } from './weapons.js';
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
// la touche Y desactive ou active les exp orbs qui droppent des ennemis
// la touche B active ou désactive les explosions lors de la mort d'ennemis
// la touche ; active debug mode
// la touche G active ou désactive gun
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
monstres = Monstre.monstres, explosions = Explosion.explosions, exps = Exp.exps, exp = Exp, explosion = Explosion, bullets = Gun.bullets,
sword, gun, hasSword = false, noComeBacks = false, dedPos = 0, mstr = Monstre,
cursorX, cursorY, hold = false;

const app = new Application({
    width: 900,
    height: 900,
    antialias: true,
    transparent: false,
    resolution: 1,
    backgroundColor: 0x000000
});

let debugText = new Text('', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0x000000,
    align: 'left',
    fontWeight: 'bold'
});
debugText.x = 10;
debugText.y = 10;
debugText.zIndex = 1000;


function setup() {
    
    resizeApp();
    app.stage.sortableChildren = true;
    Monstre.addApp(app);
    Weapon.addApp(app);
    Weapon.addMonstres(mstr);
    joueur = new Joueur(app);
    Weapon.addJoueur(joueur);
    Exp.addJoueur(joueur);
    Exp.addApp(app);
    Monstre.addExp(exp);
    Monstre.addExplosion(explosion);


    sword = new Sword(1, 15, 80, hasSword);  // Blue rectangle of 10x80
    gun = new Gun(0,10);
    
 

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
    //     new Exp(joueur.getX(), joueur.getY(), 10);
    // }, 1);

    setInterval(() => {
        Monstre.cleanup();
    });

    setupKeyboardControls(joueur, sword, mstr, gun, exps);


    // Set the game state
    state = play;
    // Start the game loop
    app.ticker.add((delta) => gameLoop(delta));
    app.stage.addChild(debugText);
}

function gameLoop(delta) {
    state(delta);
}

// Update cursor position on mouse move
document.addEventListener("mousemove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
});

document.addEventListener("mousedown", (event) =>
{
    hold = true;
});

document.addEventListener("mouseup", (event) =>
{
    hold = false;
});
document.addEventListener('contextmenu', (event) =>{
    //event.preventDefault();
});

function play() {
    let xI = xF;
    let yI = yF;
    xF += joueur.getVX();
    yF += joueur.getVY();

    const deltaX = -(xF - xI);
    const deltaY = -(yF - yI);

    grid.x -= joueur.getVX();
    grid.y -= joueur.getVY();

    ennemiColor = updateBackgroundColor(app, mstr);

    sword.playSwordSwing(cursorX, cursorY);
    
    gun.update(cursorX, cursorY, deltaX, deltaY);
    
    monstres.forEach(monstre => {
        monstre.bouger(joueur, deltaX, deltaY, ennemiColor);
        if(sword.hasSword)
        {
            if (sword.isSwordCollidingWithMonster(monstre)) {
                //new Explosion(monstre.getX(), monstre.getY(), monstre.body.width*6, 15, 0xFF0000);
                sword.onSwordHitEnemy(monstre);             
            }
        }
        if(gun.isBulletCollidingWithMonster(monstre))
        {
            gun.onBulletHitEnemy(monstre);
        }
    });
    if(hold)
    {
        gun.shoot();
    }
    
    
    explosions.forEach(explosion => {
        explosion.updateExplosion(deltaX, deltaY);
        explosion.applyDamage(monstres);
    });

    exps.forEach(exp => {
        let index = exps.indexOf(exp);
        if(mstr.dedEXP)
        {
            exp.updatePos(deltaX, deltaY);
        }
        else if(exps.length > 0)
        {
            exp.body.clear();
            app.stage.removeChild(exp);
            if (index !== -1) {
                exps.splice(index, 1);
            }
        }
        
    });
    
    joueur.onPlayerCollision(monstres);
    afficherDebug();
}


function ajouterMONSTRE(amount = 1, type = "normal", sides = 3) {  
    
    if((Monstre.cleanMonstres.length < 10 || noComeBacks) && Monstre.monstres.length < 300)
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
    let margin = Math.min(app.view.width, app.view.height) * 0.1; // Thin area around the screen
    let randomX, randomY;

    let side = Math.random();

    if (side < 0.2) {
        // Top side
        randomX = Math.random() * app.view.width;
        randomY = -margin - Math.random() * margin;
    } else if (side < 0.4) {
        // Bottom side
        randomX = Math.random() * app.view.width;
        randomY = app.view.height + margin + Math.random() * margin;
    } else if (side < 0.6) {
        // Left side
        randomX = -margin - Math.random() * margin;
        randomY = Math.random() * app.view.height;
    } else if (side < 0.8) {
        // Right side
        randomX = app.view.width + margin + Math.random() * margin;
        randomY = Math.random() * app.view.height;
    } else {
        // Corners (evenly distributed)
        let corner = Math.floor(Math.random() * 4);
        switch (corner) {
            case 0: // Top-left
                randomX = -margin - Math.random() * margin;
                randomY = -margin - Math.random() * margin;
                break;
            case 1: // Top-right
                randomX = app.view.width + margin + Math.random() * margin;
                randomY = -margin - Math.random() * margin;
                break;
            case 2: // Bottom-left
                randomX = -margin - Math.random() * margin;
                randomY = app.view.height + margin + Math.random() * margin;
                break;
            case 3: // Bottom-right
                randomX = app.view.width + margin + Math.random() * margin;
                randomY = app.view.height + margin + Math.random() * margin;
                break;
        }
    }

    return [randomX, randomY];
}

function afficherDebug() {
    if (!joueur.debug) {
        debugText.text = "";
        return;
    }

    debugText.text = `
        Joueur X: ${joueur.getX().toFixed(2)}
        Joueur Y: ${joueur.getY().toFixed(2)}
        Vitesse X: ${joueur.getVX().toFixed(2)}
        Vitesse Y: ${joueur.getVY().toFixed(2)}
        HP : ${joueur.currentHP}
        Exp : ${joueur.exp}
        Monstres: ${monstres.length}
        Storage Monsters : ${Monstre.cleanMonstres.length}
        Explosions: ${explosions.length}
        Bullets : ${bullets.length}
        Exp orbs: ${exps.length}
        Epée Active: ${sword.hasSword ? "Oui" : "Non"}
        Gun Active: ${gun.hasGun ? "Oui" : "Non"}
        Cursor X: ${cursorX}
        Cursor Y: ${cursorY}
    `;
}

// Draw the grid background
let grid = drawGridBackground(app);

window.addEventListener('resize', () => {
    app.stage.removeChild(grid);
    app.renderer.resize(window.innerWidth, window.innerHeight);
    grid = drawGridBackground(app); 
    grid.zIndex = 0;
});

function resizeApp() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    app.renderer.resize(width * 0.989, height * 0.98);
}

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);
loader.add("index.html").load(setup);
