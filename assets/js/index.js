import { setupKeyboardControls } from './mouvement.js';
import { Monstre, MonstreNormal, MonstreRunner, MonstreTank } from './monstre.js';
import { drawGridBackground, updateBackgroundColor } from './background.js';
import { Joueur } from './joueur.js';
import { createSword, isSwordCollidingWithMonster, onSwordHitEnemy, playSwordSwing} from './weapons.js';


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

// Create a Pixi Application

//CHANGE THE SWING OF THE SWORD SO THAT IT STARTS WHERE THE PLAYER HAS HIS CURSOR BUT DOESNT FOLLOW WHEN ITS SWINGING

//noComeBacks makes it so the spawner stops to let in the ones that were lost tot the cleansing !
let joueur, message, state, ennemiColor = 0x0000ff, xF = 0, yF = 0, monstres = Monstre.monstres, sword, previousSwordPosition, swordAttackSpeed = 1, hasSword = true, areaSize = 2, noComeBacks = false;


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
    // Create the `joueur` sprite
    Monstre.addApp(app);
    joueur = new Joueur(app);



    if(hasSword){
        // Create the spinning sword with trail
        sword = createSword(app, monstres, areaSize/12 + 0.7, 100 * areaSize, 0x0000FF, joueur);  // Blue rectangle of 10x80
    }
    // Create monsters at regular intervals
    let i = 0;
    let j = 0;
    let k = 0;
    let l = 0;
    setInterval(() => { 
        ajouterMONSTRE( 3, "normal", 3 + (i % 60 == 0 ? j++ : j - 1));//////////////////////////////////////////////////////////////
        i++;
    }, 1000);
    setInterval(() => { 
        ajouterMONSTRE( 3, "runner", 4);//////////////////////////////////////////////////////////////
    }, 1000);
    setInterval(() => { 
        ajouterMONSTRE( 3, "tank", 6 + (k % 60 == 0 ? l++ : l - 1));//////////////////////////////////////////////////////////////
        k++;
    }, 1000);

    // setInterval(() => { 
    //    placeOldOnes();
    // }, 1000);

    setInterval(() => {
        Monstre.cleanup();
    });

    setupKeyboardControls(joueur);

    // Create the text sprite
    const style = new TextStyle({fontFamily: "sans-serif", fontSize: 18, fill: "white"});
    message = new Text("No collision...", style);
    message.position.set(8, 8);
    app.stage.addChild(message);

    // Set the game state
    state = play;
    // Start the game loop
    app.ticker.add((delta) => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}



let cursorX = app.view.width / 2;
let cursorY = app.view.height / 2;


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

    if(hasSword){
        playSwordSwing(app, joueur, sword, cursorX, cursorY, previousSwordPosition, swordAttackSpeed);
    }
    monstres.forEach(monstre => {
        monstre.bouger(joueur, -(xF - xI), -(yF - yI), ennemiColor);
        if(hasSword)
        {
            if (isSwordCollidingWithMonster(monstre, sword)) {
                onSwordHitEnemy(app, monstre);  
            }
        }
    });

    joueur.onPlayerCollision(monstres, message);
}


function ajouterMONSTRE(amount = 1, type = "normal", sides = 3) {  
    console.log(Monstre.monstres.length);
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
