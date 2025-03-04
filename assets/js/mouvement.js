

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

export function setupKeyboardControls(joueur) {
    console.log("this is working");
    
    // Arrow keys
    const leftArrow = keyboard(37),  // Left arrow
        upArrow = keyboard(38),     // Up arrow
        rightArrow = keyboard(39), // Right arrow 
        downArrow = keyboard(40); // Down arrow
    
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

    // Arrow keys press and release
    leftArrow.press = () => { moveX = -1; updateVelocity(); };
    leftArrow.release = () => { if (moveX === -1) moveX = 0; updateVelocity(); };

    rightArrow.press = () => { moveX = 1; updateVelocity(); };
    rightArrow.release = () => { if (moveX === 1) moveX = 0; updateVelocity(); };

    upArrow.press = () => { moveY = -1; updateVelocity(); };
    upArrow.release = () => { if (moveY === -1) moveY = 0; updateVelocity(); };

    downArrow.press = () => { moveY = 1; updateVelocity(); };
    downArrow.release = () => { if (moveY === 1) moveY = 0; updateVelocity(); };

    // WASD keys press and release
    leftWASD.press = () => { moveX = -1; updateVelocity(); };
    leftWASD.release = () => { if (moveX === -1) moveX = 0; updateVelocity(); };

    rightWASD.press = () => { moveX = 1; updateVelocity(); };
    rightWASD.release = () => { if (moveX === 1) moveX = 0; updateVelocity(); };

    upWASD.press = () => { moveY = -1; updateVelocity(); };
    upWASD.release = () => { if (moveY === -1) moveY = 0; updateVelocity(); };

    downWASD.press = () => { moveY = 1; updateVelocity(); };
    downWASD.release = () => { if (moveY === 1) moveY = 0; updateVelocity(); };
}
