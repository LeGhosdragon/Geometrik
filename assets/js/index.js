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
const app = new Application({
    width: 600,
    height: 600,
    antialias: true,
    transparent: false,
    resolution: 1
});

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loader
    .add("../images/cat.png")
    .load(setup);

// Define any variables that are used in more than one function
let cat, box, message, state, triangle;

function setup() {

    monstres = [];
    // Create the box
    box = new Graphics();
    box.beginFill(0xCCFF99);
    box.drawRect(0, 0, 64, 64);
    box.endFill();
    box.x = 120;
    box.y = 96;

    // Create monsters
    ajouterMonstre(app, 200);

    // Create the `cat` sprite
    cat = faireJoueur(app);

    // Capture the keyboard arrow keys
    const left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    // Left arrow key `press` method
    left.press = function () {
        cat.vx = -5;
        cat.vy = 0;
    };
    left.release = function () {
        if (!right.isDown && cat.vy === 0) {
            cat.vx = 0;
        }
    };

    // Up
    up.press = function () {
        cat.vy = -5;
        cat.vx = 0;
    };
    up.release = function () {
        if (!down.isDown && cat.vx === 0) {
            cat.vy = 0;
        }
    };

    // Right
    right.press = function () {
        cat.vx = 5;
        cat.vy = 0;
    };
    right.release = function () {
        if (!left.isDown && cat.vy === 0) {
            cat.vx = 0;
        }
    };

    // Down
    down.press = function () {
        cat.vy = 5;
        cat.vx = 0;
    };
    down.release = function () {
        if (!up.isDown && cat.vx === 0) {
            cat.vy = 0;
        }
    };

    // Create the text sprite
    const style = new TextStyle({
        fontFamily: "sans-serif",
        fontSize: 18,
        fill: "white",
    });
    message = new Text("No collision...", style);
    message.position.set(8, 8);
    app.stage.addChild(message);

    // Set the game state
    state = play;

    // Start the game loop
    app.ticker.add((delta) => gameLoop(delta));
}

function gameLoop(delta) {
    // Update the current game state:
    state(delta);
}

// GAME LOOP
function play(delta) {
    // Use the cat's velocity to make it move
    cat.x += cat.vx;
    cat.y += cat.vy;

    monstres.forEach(monstre => {
        bouger(cat, monstre, 1);
    });

    // Check for a collision between the cat and the box
    if (hitTestCircle(cat, box)) {
        message.text = "hit!";
        box.tint = 0xff3300;
    } else {
        message.text = "No collision...";
        box.tint = 0xccff99;
    }
}

// Collision detection based on circle (using radius)
function hitTestCircle(r1, r2) {
    // Define the distance between the centers of the two objects
    let dx = r1.x - r2.x;
    let dy = r1.y - r2.y;

    // Calculate the distance between the centers
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Get the radius of the cat and the box (consider box as circle for collision)
    let r1Radius = r1.width / 2;
    let r2Radius = r2.width / 2;

    // Check for a collision
    if (distance < r1Radius + r2Radius) {
        return true; // There's a collision
    }
    return false; // No collision
}

// The `keyboard` helper function
function keyboard(keyCode) {
    const key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    // The `downHandler`
    key.downHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) {
                key.press();
            }
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    // The `upHandler`
    key.upHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) {
                key.release();
            }
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    // Attach event listeners
    window.addEventListener("keydown", key.downHandler.bind(key), false);
    window.addEventListener("keyup", key.upHandler.bind(key), false);
    return key;
}

// Helper function to move the player toward the enemy
function bouger(joueur, ennemi, vitesse) {
    let moveVector = vecteurVersLeJoueur(joueur, ennemi, vitesse);
    ennemi.x += moveVector.x;
    ennemi.y += moveVector.y;
    ennemi.rotation += 0.02;
    oscillateTrig(ennemi, 0.3);
}

// Helper function to calculate the vector for moving the enemy toward the player
function vecteurVersLeJoueur(joueur, ennemi, vitesse) {
    let dx = joueur.x + joueur.width / 2 - ennemi.x;
    let dy = joueur.y + joueur.height / 2 - ennemi.y;
    let magnitude = Math.sqrt(dx * dx + dy * dy);

    return { x: vitesse * dx / magnitude, y: vitesse * dy / magnitude };
}

// Function to oscillate the enemy
let elapsed = 0;
function oscillateTrig(ennemi, size = 1) {
    elapsed += 3;
    let newSize = size + 0.05 * Math.cos(elapsed / 50.0);
    ennemi.clear();
    ennemi.beginFill(0xff0000);
    const sideLength = newSize * 100;
    const height = (Math.sqrt(3) / 2) * sideLength;

    ennemi.moveTo(-sideLength / 2, height / 3);
    ennemi.lineTo(sideLength / 2, height / 3);
    ennemi.lineTo(0, -2 * (height / 3));
    ennemi.closePath();
    ennemi.endFill();
}

// Function to add monsters (as triangles visually, but handled as circles)
function ajouterMonstre(app, amount = 1) {
    for (let i = 0; i < amount; i++) {
        const randomX = Math.random() * app.view.width;
        const randomY = Math.random() * app.view.height;

        // Create a monster at the random position
        const triangle = createTriangle(0.5, randomX, randomY, 0xccff99);

        // Add the monster to the stage and store it in the monstres array
        app.stage.addChild(triangle);
        monstres.push(triangle);
    }
}

// Function to create a triangle visually, but used as a circle for collision detection
function createTriangle(size = 1, x = 0, y = 0, color = 0xff0000) {
    const triangle = new PIXI.Graphics();
    triangle.beginFill(color);

    const sideLength = size * 100;
    const height = (Math.sqrt(3) / 2) * sideLength;

    triangle.moveTo(-sideLength / 2, height / 3);
    triangle.lineTo(sideLength / 2, height / 3);
    triangle.lineTo(0, -2 * (height / 3));
    triangle.closePath();
    triangle.endFill();

    triangle.pivot.set(0, 0);
    triangle.x = x;
    triangle.y = y;

    // Store radius for circular collision detection
    triangle.radius = sideLength / 2;

    return triangle;
}

// Function to create the player (cat)
function faireJoueur(app) {
    const joueur = new PIXI.Graphics();
    joueur.beginFill(0x9966FF);

    let radius = 16;
    joueur.drawCircle(radius, radius, radius);

    joueur.endFill();

    joueur.x = 150;
    joueur.y = 100;
    joueur.vx = 0;
    joueur.vy = 0;

    app.stage.addChild(joueur);
    return joueur;
}
