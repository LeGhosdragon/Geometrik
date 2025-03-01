

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
    const left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);

    let moveX = 0, moveY = 0;
    const speed = 3;

    function updateVelocity() {
        if (moveX !== 0 && moveY !== 0) {
            joueur.vx = (moveX / Math.sqrt(2)) * speed;
            joueur.vy = (moveY / Math.sqrt(2)) * speed;
        } else {
            joueur.vx = moveX * speed;
            joueur.vy = moveY * speed;
        }
    }

    left.press = () => { moveX = -1; updateVelocity(); };
    left.release = () => { if (moveX === -1) moveX = 0; updateVelocity(); };

    right.press = () => { moveX = 1; updateVelocity(); };
    right.release = () => { if (moveX === 1) moveX = 0; updateVelocity(); };

    up.press = () => { moveY = -1; updateVelocity(); };
    up.release = () => { if (moveY === -1) moveY = 0; updateVelocity(); };

    down.press = () => { moveY = 1; updateVelocity(); };
    down.release = () => { if (moveY === 1) moveY = 0; updateVelocity(); };
}
