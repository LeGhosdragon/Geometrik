import { setupKeyboardControls } from './mouvement.js';
import { Monstre, MonstreNorm } from './monstre.js';
import { drawGridBackground, updateBackgroundColor } from './background.js';
import { faireJoueur, onPlayerCollision } from './joueur.js';
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
let joueur, message, state, ennemiColor = 0x0000ff, xF = 0, yF = 0, monstres = Monstre.monstres, sword, previousSwordPosition, swordAttackSpeed = 1;


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
    joueur = faireJoueur(app);

    // Create the spinning sword with trail
    sword = createSword(app, 10, 100, 0x0000FF, joueur);  // Blue rectangle of 10x80

    // Create monsters at regular intervals
    let i = 0;
    let j = 0;
    setInterval(() => { 
        ajouterMONSTRE(app, 1, "normal", 3 + (i % 5 == 0 ? j++ : j - 1));//////////////////////////////////////////////////////////////
        i++;
    }, 1000);

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
    xF += joueur.vx;
    yF += joueur.vy;

    grid.x -= joueur.vx;
    grid.y -= joueur.vy;

    ennemiColor = updateBackgroundColor(app);

    playSwordSwing(app, joueur, sword, cursorX, cursorY, previousSwordPosition, swordAttackSpeed);

    monstres.forEach(monstre => {
        monstre.bouger(joueur, -(xF - xI), -(yF - yI), ennemiColor);
        if (isSwordCollidingWithMonster(monstre, sword)) {
            onSwordHitEnemy(app, monstre);  
        }
    });

    onPlayerCollision(joueur, monstres, message);
}


function ajouterMONSTRE(app, amount = 1, type = "normal", sides = 3, size = 0.3) {    
    for (let i = 0; i < amount; i++) {
        let rngPos = posRandomExterieur(app);
        const monstre = new MonstreNorm(rngPos[0], rngPos[1], sides, size, type);
        app.stage.addChild(monstre.body);
        monstres.push(monstre);
    }
}

function posRandomExterieur(app) {
    let randomX = Math.random() * app.view.width;
    let randomY = Math.random() * app.view.height;
    
    if(Math.random() < 0.5 ? -1 : 1 == -1) {
        randomX = (((Math.random() > 0.5 ? 1 : -1)) * app.view.width) + Math.random() * app.view.width;
    } else {
        randomY = (((Math.random() > 0.5 ? 1 : -1)) * app.view.height) + Math.random() * app.view.height;
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
