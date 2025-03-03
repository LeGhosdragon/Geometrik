export function onPlayerCollision(player, monsters, message) {
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
            monster.body.clear();
            monsters.splice(index, 1);
        }
    });
}


// Collision detection based on circle (using radius)
function hitTestCircle(r1, r2) {
    // Define the distance between the centers of the two objects
    let dx = r1.x + r1.width/2 - r2.getX();
    let dy = r1.y + r1.height/2 - r2.getY();

    // Calculate the distance between the centers
    let distance = Math.sqrt(dx * dx*0.9 + dy * dy*0.9);

    // Get the radius of the joueur and the box (consider box as circle for collision)
    let r1Radius = r1.width / 2;
    let r2Radius = r2.body.width / 2;

    // Check for a collision
    if (distance < r1Radius + r2Radius) {
        return true; // There's a collision
    }
    return false; // No collision
}


// Function to create the player (joueur)
export function faireJoueur(app) {
    const joueur = new PIXI.Graphics();
    joueur.beginFill(0x9966FF);

    let radius = 16;
    joueur.drawCircle(radius, radius, radius);

    joueur.endFill();
    
    joueur.x = window.innerWidth/2;
    joueur.y = window.innerHeight/2;
    joueur.vx = 0;
    joueur.vy = 0;

    app.stage.addChild(joueur);
    return joueur;
}