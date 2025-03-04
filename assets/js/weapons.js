// weapons.js


let trail = [];  // Array to store trail particles
let swordDmg = 10;
let swingSpeed = 7; // Adjust this value to control swing speed
let swingDirection = 1; // 1 for normal, -1 for inverted
let swingTime = 0;
let swingDuration = 100; // Adjust this value to control swing duration
let wideness = 1.3; // Adjust this value to control swing wideness
let isSwinging = true;
let monstres = null;

export function createSword(app, monstresI, widenessI, height, color, joueur) {
    monstres = monstresI;
    wideness = widenessI;
    const rectangle = new PIXI.Graphics();
    rectangle.beginFill(color);
    rectangle.drawRect(0, 0, 10, height);
    rectangle.endFill();
    rectangle.pivot.set(10 / 2, height + 40);  // Correct the pivot to bottom center
    rectangle.x = joueur.getX() + 15;
    rectangle.y = joueur.getY() + 12;
    app.stage.addChild(rectangle);
    return rectangle;
}

export function updateTrail(app, offset, sword, previousSwordPosition) {
    const swordLength = sword.height;

    if (!sword.visible) {
        trail.forEach((particle, index) => {
            if (particle.alpha > 0) {
                particle.alpha -= 0.02 * (index + 1);
            }
        });
    } else {
        const dx = sword.x - previousSwordPosition.x;
        const dy = sword.y - previousSwordPosition.y;
        const swordSpeed = Math.sqrt(dx * dx + dy * dy);
        const numParticles = Math.max(15, Math.floor(swordLength / 4) + Math.floor(swordSpeed * 5));
        previousSwordPosition.x = sword.x;
        previousSwordPosition.y = sword.y;

        const angle = sword.rotation - Math.PI / 2 + offset;
        const step = swordLength / numParticles;
        const pivotX = sword.x;
        const pivotY = sword.y;

        for (let i = 0; i < numParticles; i++) {
            const distance = i * step;
            const x = pivotX + Math.cos(angle) * (distance + 40);
            const y = pivotY + Math.sin(angle) * (distance + 40);

            const trailParticle = new PIXI.Graphics();
            trailParticle.beginFill(0x0FFFFF, 0.7);  // Blue color
            trailParticle.drawCircle(0, 0, 6);  // Particle size
            trailParticle.endFill();
            trailParticle.x = x;
            trailParticle.y = y;
            trailParticle.zIndex = -1;

            app.stage.addChild(trailParticle);
            trail.push({ particle: trailParticle, age: 0 });
        }
    }

    trail.forEach((trailData, index) => {
        const particle = trailData.particle;
        if (particle.alpha > 0) {
            trailData.age++;
            particle.alpha -= 0.001 * trailData.age;
        }
    });

    for (let i = trail.length - 1; i >= 0; i--) {
        const trailData = trail[i];
        if (trailData.particle.alpha <= 0) {
            app.stage.removeChild(trailData.particle);
            trail.splice(i, 1);
        }
    }

    sword.zIndex = 1;
    app.stage.addChild(sword);
}

export function hideSwordAndParticles(sword, attackSpeed) {
    sword.visible = false;
    setTimeout(() => {
        sword.visible = true;
        isSwinging = true;
        swingTime = 0;
        monstres.forEach(otherMonstre => {
            otherMonstre.setSwordHit(false);
        });
    }, 1000/attackSpeed);
}

export function isSwordCollidingWithMonster(monstre, sword) {
    if (!sword.visible) {
        return false;
    }
    const swordBounds = sword.getBounds();
    const monstreBounds = monstre.body.getBounds();

    return swordBounds.x < monstreBounds.x + monstreBounds.width &&
           swordBounds.x + swordBounds.width > monstreBounds.x &&
           swordBounds.y < monstreBounds.y + monstreBounds.height &&
           swordBounds.y + swordBounds.height > monstreBounds.y;
}

export function onSwordHitEnemy(app, monstre) {
    if(!monstre.getSwordHit())
    {
        const dmg = swordDMG();
        monstre.endommagé(dmg);
        monstre.setSwordHit(true);
        //console.log("sword hit monster!" + monstre.getHP() + " : " + dmg);
        createHitEffect(app, monstre, dmg);
    }
}

function createHitEffect(app, monstre, damage) {
    // Create the damage text
    const damageText = new PIXI.Text(damage, {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xFF0000,
        align: 'center',
        fontWeight: 'bold'
    });

    // Set initial position based on monster's position
    damageText.x = monstre.getX();
    damageText.y = monstre.getY();

    // Add the damage text to the stage
    app.stage.addChild(damageText);

    // Set the initial scale and alpha
    damageText.scale.set(1);
    damageText.alpha = 1;

    // Animation to move the text upwards and fade out
    app.ticker.add(() => {
        damageText.y -= 2;  // Move text upwards
        damageText.alpha -= 0.05;  // Fade out

        // Shrink the text slightly over time
        damageText.scale.x -= 0.01;
        damageText.scale.y -= 0.01;

        // Remove the text once it's fully transparent
        if (damageText.alpha <= 0) {
            app.stage.removeChild(damageText);
        }
    });
}


export function playSwordSwing(app, joueur, sword, cursorX, cursorY, previousSwordPosition, attackSpeed) {

    let dx = cursorX - (joueur.getX() + app.view.offsetLeft);
    let dy = cursorY - (joueur.getY() + app.view.offsetTop);
    let baseAngle = Math.atan2(dy, dx);

    if (isSwinging) {
        swingTime += swingSpeed;
        let swingOffset = Math.cos(swingTime / swingDuration * Math.PI) * wideness * swingDirection;
        sword.rotation = baseAngle + swingOffset + Math.PI / 2;

        if (swingTime >= swingDuration) {
            isSwinging = false;
            hideSwordAndParticles(sword, attackSpeed);
        }
    }

    previousSwordPosition = { x: sword.x, y: sword.y };
    updateTrail(app, 0, sword, previousSwordPosition);
    updateTrail(app, 0.25, sword, previousSwordPosition);
    updateTrail(app, 0.3, sword, previousSwordPosition);
    updateTrail(app, 0.35, sword, previousSwordPosition);
    updateTrail(app, 0.22, sword, previousSwordPosition);
    updateTrail(app, 0.29, sword, previousSwordPosition);
    updateTrail(app, 0.32, sword, previousSwordPosition);
}

function swordDMG() {
    return Math.round(swordDmg + Math.random() * 15);
}
