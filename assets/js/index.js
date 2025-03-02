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
//window.addEventListener("resize", resizeApp)

const app = new Application({
    width: 900,
    height: 900,
    antialias: true,
    transparent: false,
    resolution: 1,
    backgroundColor: backColor = 0x000000
});

document.body.appendChild(app.view);

function drawGridBackground() {
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x00000, 0.3); // Line style: grey color, width of 1px

    // Determine the size of the grid based on the screen size and a large enough margin.
    const gridSize = 1000000; // The grid's maximum size (way beyond the player's movement range)
    const step = 40; // The step size for each grid line

    // Draw vertical lines
    for (let x = -gridSize; x < gridSize; x += step) {
        grid.moveTo(x, -gridSize);
        grid.lineTo(x, gridSize);
    }

    // Draw horizontal lines
    for (let y = -gridSize; y < gridSize; y += step) {
        grid.moveTo(-gridSize, y);
        grid.lineTo(gridSize, y);
    }

    // Add the grid to the stage
    app.stage.addChild(grid);
    return grid; // Return the grid object so it can be manipulated later
}


// Draw the grid background
grid = drawGridBackground();

// Resize event to update grid background when window is resized
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.removeChildren(); // Remove previous grid
    drawGridBackground(); // Redraw the grid with new dimensions
});

function resizeApp()
{
    let width = window.innerWidth;
    let height = window.innerHeight;
    app.renderer.resize(width*0.989, height*0.98);
}

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loader.add("-").load(setup);

// Define any variables that are used in more than one function
let joueur, message, state, triangle, red = 0xff0000, green = 0x00ff00, ennemiColor = 0x0000ff,
xF = 0, yF = 0,
before = 0, before2 = 0;
monstres = [];

let r = 0, g = 0, b = 0;

// Control the speed of the pulse (larger values make it pulse slower)
const pulseSpeed = 0.00001; // Change this for faster/slower pulses

// Function to extract RGB from a hex color code
function hexToRgb(hex) {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return { r, g, b };
}

// Function to get the contrasting (complementary) color
function getContrastingColor(r, g, b) {
    // Simply invert the RGB values for a contrasting color
    const contrastR = 255 - r;
    const contrastG = 255 - g;
    const contrastB = 255 - b;

    // Return the RGB color for the contrasting color
    return { r: contrastR, g: contrastG, b: contrastB };
}

// The function to update the background color to pulse through the rainbow
function updateBackgroundColor(delta) {
    // Update the RGB components using sine waves to cycle through colors
    r = Math.floor((Math.sin(pulseSpeed * app.ticker.lastTime + 0) + 1) * 128); // Sinusoidal for red
    g = Math.floor((Math.sin(pulseSpeed * app.ticker.lastTime + Math.PI * 2 / 3) + 1) * 128); // Sinusoidal for green
    b = Math.floor((Math.sin(pulseSpeed * app.ticker.lastTime + Math.PI * 4 / 3) + 1) * 128); // Sinusoidal for blue

    // Recombine the RGB components into a hex color code
    const backColor = (r << 16) | (g << 8) | b;

    // Apply the new background color to the renderer
    app.renderer.backgroundColor = backColor;

    // Get the RGB components from the backColor
    const { r: bgR, g: bgG, b: bgB } = hexToRgb(backColor);

    // Get the contrasting color
    const { r: contrastR, g: contrastG, b: contrastB } = getContrastingColor(bgR, bgG, bgB);
    ennemiColor = (contrastR << 16) | (contrastG << 8) | contrastB;
}


function setup() {

    resizeApp();
    

    // Create monsters every 
    setInterval(() => { 
      ajouterMonstre(app, 20);//////////////////////////////////////////////////////////////
    }, 1000);

    // Create the `joueur` sprite
    joueur = faireJoueur(app);

    // Capture the keyboard arrow keys
    const left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    // Define movement variables
    let moveX = 0;
    let moveY = 0;
    const speed = 3; // Base speed

    function updateVelocity() {
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            joueur.vx = (moveX / Math.sqrt(2)) * speed;
            joueur.vy = (moveY / Math.sqrt(2)) * speed;
        } else {
            joueur.vx = moveX * speed;
            joueur.vy = moveY * speed;
        }
    }

    // Left arrow key
    left.press = function () { moveX = -1; updateVelocity(); };
    left.release = function () { if (moveX === -1) moveX = 0; updateVelocity(); };

    // Right arrow key
    right.press = function () { moveX = 1; updateVelocity(); };
    right.release = function () { if (moveX === 1) moveX = 0; updateVelocity(); };

    // Up arrow key
    up.press = function () { moveY = -1; updateVelocity(); };
    up.release = function () { if (moveY === -1) moveY = 0; updateVelocity(); };

    // Down arrow key
    down.press = function () { moveY = 1; updateVelocity(); };
    down.release = function () { if (moveY === 1) moveY = 0; updateVelocity(); };


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

// Modify the game loop to call this function
function play(delta) {
  // Use the joueur's velocity to make it move
  
  xI = xF;
  yI = yF;
  xF += joueur.vx;
  yF += joueur.vy;

  grid.x -= joueur.vx; // Move the grid horizontally in the opposite direction
  grid.y -= joueur.vy; // Move the grid vertically in the opposite direction


 updateBackgroundColor(); // Update the background color
  monstres.forEach(monstre => {
      bouger(joueur, monstre, 1,-(xF - xI ), -(yF - yI), 3);///////////////////////////////////
  });

  
  // Check if the player collides with any monsters
  onPlayerCollision(joueur, monstres);
}

function onPlayerCollision(player, monsters) {
    let collidedMonsters = [];

    monsters.forEach(monster => {
        // Check for collision between player and each monster
        if (hitTestCircle(player, monster)) {
            console.log('Player touched an enemy!');
            message.text = "Player hit an enemy!";
            monster.tint += 0x9966FF; // Change monster color upon collision (optional)
            collidedMonsters.push(monster); // Store the collided monster
        }
    });

    // Remove collided monsters from the main array
    collidedMonsters.forEach(monster => {
        let index = monsters.indexOf(monster);
        if (index !== -1) {
            monster.clear();
            monsters.splice(index, 1);
        }
    });
}


// Collision detection based on circle (using radius)
function hitTestCircle(r1, r2) {
    // Define the distance between the centers of the two objects
    let dx = r1.x + r1.width/2 - r2.x;
    let dy = r1.y + r1.height/2 - r2.y;

    // Calculate the distance between the centers
    let distance = Math.sqrt(dx * dx*0.9 + dy * dy*0.9);

    // Get the radius of the joueur and the box (consider box as circle for collision)
    let r1Radius = r1.width / 2;
    let r2Radius = r2.width / 2;

    // Check for a collision
    if (distance < r1Radius + r2Radius) {
        return true; // There's a collision
    }
    return false; // No collision
}

// Helper function to calculate the vector for moving the enemy toward the player
function vecteurVersLeJoueur(joueur, ennemi, vitesse) {
    let dx = joueur.x + joueur.width / 2 - ennemi.x;
    let dy = joueur.y + joueur.height / 2 - ennemi.y;
    let magnitude = Math.sqrt(dx * dx + dy * dy);
  
    return { x: vitesse * dx / magnitude, y: vitesse * dy / magnitude };
}

function bouger(joueur, ennemi, vitesse, distx, disty, sides) {
    let moveVector = vecteurVersLeJoueur(joueur, ennemi, vitesse);
    ennemi.x += moveVector.x + distx;
    ennemi.y += moveVector.y + disty;
    ennemi.rotation += 0.02;
    size = 1;
    // Call the avoid collision function for all monsters
    avoidMonsterCollision(ennemi, monstres, size);
    //oscillateTrig(ennemi, size * 0.3);
    //oscillateSquare(ennemi, size * 0.3);
    oscillatePolygon(ennemi, sides, size * 0.3);
}


function oscillatePolygon(ennemi, sides, size = 1) {
    if (sides < 3) return; // A polygon must have at least 3 sides

    ennemi.elapsed += 3;
    let newSize = size + 0.05 * Math.cos(ennemi.elapsed / 50.0);
    ennemi.clear();
    ennemi.beginFill(ennemiColor); // Red color

    const radius = newSize * 50; // Adjust size scaling
    const angleStep = (2 * Math.PI) / sides;

    ennemi.moveTo(radius * Math.cos(0), radius * Math.sin(0));

    for (let i = 1; i <= sides; i++) {
        let angle = i * angleStep;
        let x = radius * Math.cos(angle);
        let y = radius * Math.sin(angle);
        ennemi.lineTo(x, y);
    }

    ennemi.closePath();
    ennemi.endFill();
}

// Function to check and handle collision avoidance between monsters
function avoidMonsterCollision(monstre, monstres, size = 1) {
    const minDistance = 25; // Minimum distance between monsters to avoid collision
    const avoidFactor = 1.4; // Smaller value for less avoidance movement

    monstres.forEach(otherMonstre => {
        // Skip self-collision check (monstre vs. itself)
        if (monstre === otherMonstre) return;

        let dx = monstre.x - otherMonstre.x;
        let dy = monstre.y - otherMonstre.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
            // Apply smaller avoidance: move the monster away by a smaller factor
            let angle = Math.atan2(dy, dx);
            let avoidX = Math.cos(angle) * avoidFactor; // Smaller movement to avoid collision
            let avoidY = Math.sin(angle) * avoidFactor;

            // Move the monster slightly away from the other monster
            monstre.x += avoidX;
            monstre.y += avoidY;
        }
    });
}

// Function to create the player (joueur)
function faireJoueur(app) {
    const joueur = new PIXI.Graphics();
    joueur.beginFill(0x9966FF);

    let radius = 16;
    joueur.drawCircle(radius, radius, radius);

    joueur.endFill();
    
    joueur.x = window.innerWidth/2.25;
    joueur.y = window.innerHeight/2.25;
    joueur.vx = 0;
    joueur.vy = 0;

    app.stage.addChild(joueur);
    return joueur;
}

function createShape(x = 0, y = 0) {
    const shape = new PIXI.Graphics();

    shape.x = x;
    shape.y = y;
    shape.elapsed = 0;
    // Set pivot to the center of the shape
    shape.pivot.set(0, 0);

    return shape;
}

// Function to add monsters (as polygons visually, but handled as circles)
function ajouterMonstre(app, amount = 1) {
    for (let i = 0; i < amount; i++) {

        let randomX = Math.random() * app.view.width;
        let randomY = Math.random() * app.view.height;

        if(number = Math.random() < 0.5 ? -1 : 1 == -1){
            randomX = (((Math.random() > 0.5 ? 1 : -1)) *app.view.width) + Math.random() * app.view.width;
        }
        else
        {
            randomY = (((Math.random() > 0.5 ? 1 : -1)) *app.view.height) + Math.random() * app.view.height;
        }

        // Create a monster at the random position
        const poly = createShape(randomX, randomY);

        // Add the monster to the stage and store it in the monstres array
        app.stage.addChild(poly);
        monstres.push(poly);
    }
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



class monstre {
    static monstres = [];

    constructor(x, y, sides, size, type, vitesse = 1, hp = 100, dmg = 1, elapsedTime = 0, couleur = 0xff0000) {
        this.size = size;
        this.vitesse = vitesse;
        this.couleur = couleur;
        this.sides = sides;
        this.type = type
        this.hp = hp;
        this.dmg = dmg;
        this.body = this.createShape(x, y);
        this.elapsedTime = elapsedTime;
        monstres.push(this);
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
      
        return { x: vitesse * dx / magnitude, y: vitesse * dy / magnitude };
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
    setCouleur(couleur) {
        this.couleur = couleur;
        
        this.body.endFill();
    }    

}

class monstreNorm extends monstre {
    constructor(x, y, sides = 0.3, size, type = "normal") {
        super(x, y, sides, size, type);
    }

    bouger(joueur, deltaX, deltaY) {
        let moveVector = vecteurVersLeJoueur(joueur);
        this.setX(getX() + moveVector.x + deltaX);
        this.setY(getY() + moveVector.y + deltaY);
        this.body.rotation += 0.02;


        // Call the avoid collision function for all monsters
        avoidMonsterCollision();

        oscillatePolygon(this.size);
    }
    
    oscillatePolygon(size) {
        if (sides < 3) return; // A polygon must have at least 3 sides
    
        this.elapsed += 3;
        let newSize = size + 0.05 * Math.cos(this.elapsed / 50.0);
        this.body.clear();
        this.body.beginFill(ennemiColor);
    
        const radius = newSize * 50; // Adjust size scaling
        const angleStep = (2 * Math.PI) / sides;
    
        this.body.moveTo(radius * Math.cos(0), radius * Math.sin(0));
    
        for (let i = 1; i <= sides; i++) {
            let angle = i * angleStep;
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            this.body.lineTo(x, y);
        }
    
        this.body.closePath();
        this.body.endFill();
    }

    // Function to check and handle collision avoidance between monsters
    avoidMonsterCollision() {
        const minDistance = 25; // Minimum distance between monsters to avoid collision
        const avoidFactor = 1.4; // Smaller value for less avoidance movement

        monstres.forEach(otherMonstre => {
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
}