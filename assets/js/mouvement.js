

export function keyboard(keyCode) {
    const key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    key.downHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    key.upHandler = function (event) {
        if (event.keyCode === key.code) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    window.addEventListener("keydown", key.downHandler.bind(key), false);
    window.addEventListener("keyup", key.upHandler.bind(key), false);
    return key;
}

export function setupKeyboardControls(joueur, sword, mstr, gun, exp) {
    console.log("this is working");
    
    // Arrow keys
    const leftArrow = keyboard(37),  // Left arrow
        upArrow = keyboard(38),     // Up arrow
        rightArrow = keyboard(39), // Right arrow 
        downArrow = keyboard(40), // Down arrow
        enableSword = keyboard(81),
        enableText = keyboard(84),
        enableDedBomb = keyboard(66),
        enableDedExp = keyboard(89),
        enableGun = keyboard(71),
        enableDebug = keyboard(186);
    
    // WASD keys
    const leftWASD = keyboard(65),   // 'A' key
        upWASD = keyboard(87),       // 'W' key
        rightWASD = keyboard(68),    // 'D' key
        downWASD = keyboard(83);     // 'S' key

    let moveX = 0, moveY = 0;
    const speed = 3;

    function updateVelocity() {
        if (moveX !== 0 && moveY !== 0) {
            joueur.setVX( (moveX / Math.sqrt(2)) * speed);
            joueur.setVY(  (moveY / Math.sqrt(2)) * speed);
        } else {
            joueur.setVX( moveX * speed);
            joueur.setVY( moveY * speed);
        }
    }

    enableSword.press = () => {
        if(sword.hasSword)
        {
            sword.hasSword = false;

            sword.body.visible = false;
        }
        else{
            sword.hasSword = true;
            sword.body.visible = true;
        }
    }

    enableText.press = () => {
        mstr.showLife = mstr.showLife ?  false : true;
        mstr.monstres.forEach(monstre => {
            if(mstr.showLife)
            {
                monstre.showLife = true;
                monstre.hpText = monstre.createHPText();
            }
            else{
                monstre.showLife = false;
                
            }
        });
    }
    enableDedExp.press = () => {
        if(mstr.dedEXP)
        {
            mstr.dedEXP = false;
            exp.forEach(expb => {
                expb.body.clear();
            });
            exp = [];
        }
        else{
            mstr.dedEXP = true;
        }
    }
    enableDedBomb.press = () => {
        if(mstr.dedExpl)
        {
            mstr.dedExpl = false;
        }
        else{
            mstr.dedExpl = true;
        }
    }
    enableGun.press = () => {
        if(gun.hasGun)
        {
            gun.hasGun = false;
            gun.body.visible = false;
        }
        else{
            gun.hasGun = true;
            gun.body.visible = true;
        }
    }

    enableDebug.press = () => {
        if(joueur.debug)
        {
            joueur.debug = false;
        }
        else{
            joueur.debug = true;
        }
    }

    // Arrow keys press and release
    leftArrow.press = () => { moveX = -joueur.vitesse; updateVelocity(); };
    leftArrow.release = () => { if (moveX === -joueur.vitesse) moveX = 0; updateVelocity(); };

    rightArrow.press = () => { moveX = joueur.vitesse; updateVelocity(); };
    rightArrow.release = () => { if (moveX === joueur.vitesse) moveX = 0; updateVelocity(); };

    upArrow.press = () => { moveY = -joueur.vitesse; updateVelocity(); };
    upArrow.release = () => { if (moveY === -joueur.vitesse) moveY = 0; updateVelocity(); };

    downArrow.press = () => { moveY = joueur.vitesse; updateVelocity(); };
    downArrow.release = () => { if (moveY === joueur.vitesse) moveY = 0; updateVelocity(); };

    // WASD keys press and release
    leftWASD.press = () => { moveX = -joueur.vitesse; updateVelocity(); };
    leftWASD.release = () => { if (moveX === -joueur.vitesse) moveX = 0; updateVelocity(); };

    rightWASD.press = () => { moveX = joueur.vitesse; updateVelocity(); };
    rightWASD.release = () => { if (moveX === joueur.vitesse) moveX = 0; updateVelocity(); };

    upWASD.press = () => { moveY = -joueur.vitesse; updateVelocity(); };
    upWASD.release = () => { if (moveY === -joueur.vitesse) moveY = 0; updateVelocity(); };

    downWASD.press = () => { moveY = joueur.vitesse; updateVelocity(); };
    downWASD.release = () => { if (moveY === joueur.vitesse) moveY = 0; updateVelocity(); };
}
