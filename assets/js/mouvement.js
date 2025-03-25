

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

export function setupKeyboardControls(app, joueur, sword, mstr, gun, exp, Joueur) {
    console.log("this is working");
    
    // Arrow keys
    const leftArrow = keyboard(37),  // Left arrow
        upArrow = keyboard(38),     // Up arrow
        rightArrow = keyboard(39), // Right arrow 
        downArrow = keyboard(40), // Down arrow
        enableSword = keyboard(81),     // 'Q' key
        enableText = keyboard(84),     // 'T' key
        enableDedBomb = keyboard(66), // 'B' key
        enableDedExp = keyboard(89), // 'Y' key
        enableGun = keyboard(71),       // 'G' key
        enableDebug = keyboard(186),   // ';' key
        milk = keyboard(77),          // 'M' key
        space = keyboard(80),        // 'P' key
        lvlUp = keyboard(76),       // 'L' key
        autoAttack = keyboard(67); // 'C' key
    
    // WASD keys
    const leftWASD = keyboard(65),   // 'A' key
        upWASD = keyboard(87),       // 'W' key
        rightWASD = keyboard(68),    // 'D' key
        downWASD = keyboard(83);     // 'S' key

    let moveX = 0, moveY = 0;
    const speed = 3;

    let lastMoveX = 0, lastMoveY = 0;

    function updateVelocity() {
        if (moveX === lastMoveX && moveY === lastMoveY) return;  // Skip if no change
        if (moveX !== 0 && moveY !== 0) {
            joueur.setVX((moveX / Math.sqrt(2)) * speed);
            joueur.setVY((moveY / Math.sqrt(2)) * speed);
        } else {
            joueur.setVX(moveX * speed);
            joueur.setVY(moveY * speed);
        }
        lastMoveX = moveX;
        lastMoveY = moveY;
    }
    

    enableSword.press = () => {
        if(joueur.hasSword)
        {
            joueur.hasSword = false;

            //sword.body.visible = false;
        }
        else{
            joueur.hasSword = true;
            //sword.body.visible = true;
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
    milk.press = () =>
    {
        if(mstr.dedMilkMan)
        {
            joueur.body.clear();
            joueur.body.lineStyle(3, 0x000000, 1);
            joueur.body.beginFill(0xFF0000);
            joueur.body.drawCircle(joueur.size, joueur.size, joueur.size);
            joueur.body.endFill();
            gun.body.lineStyle(3, 0x000000, 1);
            gun.body.beginFill(0x9966FF);
            gun.body.drawRect(0, 0, 10, 15); // Adjust gun size
            gun.body.endFill();
           
            mstr.dedMilkMan = false;
            joueur.updateHealthBar();
        }
        else{
            joueur.body.clear();
            joueur.body.lineStyle(3, 0x000000, 1);
            joueur.body.beginFill(0xFF0000);
            joueur.body.drawCircle(joueur.size, joueur.size, joueur.size);
            joueur.body.endFill();
            gun.body.lineStyle(3, 0x000000, 1);
            gun.body.beginFill(0xFFFFFF);
            gun.body.drawRect(0, 0, 10, 15); // Adjust gun size
            gun.body.endFill();
            
            mstr.dedMilkMan = true;
            joueur.updateHealthBar();
        }
    }

    lvlUp.press = () =>
    {
        joueur.exp += joueur.expReq*1 + 1; 
        joueur.statistics.expGained += joueur.expReq*1 + 1;
    }

    autoAttack.press = () =>
    {
        //joueur.createStatsBoards();
        if(joueur.clickLock)
        {
            joueur.hold = false;
            joueur.clickLock = false;
        }
        else
        {
            joueur.hold = true;
            joueur.clickLock = true;
        }

    }

    space.press = () =>
    {
        //app.space = !app.space;
        if(!app.space)
        {
            app.space = true;
            joueur.body.clear();
            joueur.body.lineStyle(3, 0xFFFFFF, 1);
            joueur.body.beginFill(0xFF0000);
            joueur.body.drawCircle(joueur.size, joueur.size, joueur.size);
            joueur.body.endFill();
            gun.body.lineStyle(3, 0xFFFFFF, 1);
            gun.body.beginFill(0x000000);
            gun.body.drawRect(0, 0, 10, 15); // Adjust gun size
            gun.body.endFill();
            if(!app.pause)
            {   
                Joueur.Grid.pauseGrid(app);
                app.pause = true;
                Joueur.Grid.pauseGrid(app);
                app.pause = false;
            }

           
        }
        else{
            app.space = false;
            joueur.body.clear();
            joueur.body.lineStyle(3, 0x000000, 1);
            joueur.body.beginFill(0xFF0000);
            joueur.body.drawCircle(joueur.size, joueur.size, joueur.size);
            joueur.body.endFill();
            gun.body.lineStyle(3, 0x000000, 1);
            gun.body.beginFill(0x9966FF);
            gun.body.drawRect(0, 0, 10, 15); // Adjust gun size
            gun.body.endFill();
            if(!app.pause)
            {   
                Joueur.Grid.pauseGrid(app);
                app.pause = true;
                Joueur.Grid.pauseGrid(app);
                app.pause = false;
            }
            
          
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
