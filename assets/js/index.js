import { setupKeyboardControls } from './mouvement.js';
import { Monstre, MonstreNormal, MonstreRunner, MonstreTank, MonstreExp } from './monstre.js';
import { Grid, updateBackgroundColor} from './background.js';
import { Joueur } from './joueur.js';
import { Weapon, Sword, Explosion, Gun } from './weapons.js';
import { Exp } from './experience.js';
import { Upgrade } from './upgrades.js';
import { Event } from './events.js';

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

//DEBUG ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// la touche Q active ou désactive l'épée
// la touche T active ou désactive les textes de vie des ennemis
// la touche Y desactive ou active les exp orbs qui droppent des ennemis
// la touche B active ou désactive les explosions lors de la mort d'ennemis
// la touche ; active debug mode
// la touche G active ou désactive gun
// la touche M active MILK_MODE
// la touche "échap" pause la partie
// la touche L active un très GRAND nombre de lvlUps
//
//
//
//
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




//noComeBacks makes it so the spawner stops to let in the ones that were lost tot the cleansing !
let joueur, state, ennemiColor = 0x0000ff, xF = 0, yF = 0, x = 0, y = 0,
monstres = Monstre.monstres, explosions = Explosion.explosions, exps = Exp.exps, exp = Exp, explosion = Explosion, bullets = Gun.bullets,
sword, gun, hasSword = false,  dedPos = 0, elapsedTime = 0, min = 0, hour = 0, event,
cursorX, cursorY, hold = false;

const app = new Application({
    width: 900,
    height: 900,
    antialias: true,
    transparent: false,
    resolution: 1,
    backgroundColor: 0x000000,
    x: 200
});
app.pause = false;

let debugText = new Text('', {
    fontFamily: 'Arial',
    fontSize: 16,
    fill: 0x000000,
    align: 'left',
    fontWeight: 'bold'
});
debugText.x = 10;
debugText.y = 10;
debugText.zIndex = 1000;


function setup() {
    app.stage.sortableChildren = true;
    Monstre.addApp(app);
    Weapon.addApp(app);
    Weapon.addMonstres(Monstre);
    Joueur.addMonstre(Monstre);
    Joueur.addUpgrade(new Upgrade("gun"));
    joueur = new Joueur(app);
    resizeApp(joueur);
    joueur.updateExpBar();
    Weapon.addJoueur(joueur);
    app.stage.addChild(Grid.grid);
    Exp.addJoueur(joueur);
    Exp.addApp(app);
    Monstre.addExp(exp);
    Monstre.addExplosion(explosion);
    Upgrade.addApp(app);
    Upgrade.addJoueur(joueur);
    Upgrade.addMonstre(Monstre);
    Upgrade.addGrid(Grid);
    Event.addApp(app);
    Event.addMonstres(Monstre, MonstreNormal, MonstreRunner, MonstreTank, MonstreExp);

    new Event("normal");
    //new Event("ambush");
    new Event(" ");

    sword = new Sword(1, joueur.baseDMG, 80, hasSword);  // Blue rectangle of 10x80
    gun = new Gun(1, joueur.baseDMG, 0);
    Upgrade.addWeapons(Sword, Gun, sword, gun);
    

    // setInterval(() => { 
    //     new Exp(joueur.getX()*1.5, joueur.getY()*1.5, 100);
    // }, 10);

    setupKeyboardControls(app, joueur, sword, Monstre, gun, exps);


    // Set the game state
    state = play;
    
    // Start the game loop
    app.ticker.add((delta) => play(delta));
    app.stage.addChild(debugText);
}



function play(delta) {
    resizeApp(joueur);
    if(!app.pause)
    {
        joueur.addExp(0);
        elapsedTime += delta / 60;
        if(elapsedTime >= 60) 
        { 
            elapsedTime -= 60;
            min += 1;
        }
        if(min >= 60)
        {
            min -= 60;
            hour += 1;
        }    

        Event.updateEvents(delta);
        
        let xI = xF;
        let yI = yF;
        xF += joueur.getVX();
        yF += joueur.getVY();

        const deltaX = -(xF - xI) * delta;
        const deltaY = -(yF - yI) * delta;
   
        if(x > 100000)
        {
            Grid.grid.x += 10000;
            x = 0;
            //grid.position.set(0,0);
        }
        if(x < -10000)
        {
            Grid.grid.x -= 10000;
            x = 0;
        }
        if(y > 10000)
        {
            Grid.grid.y += 10000;
            y = 0;
        }
        if(y < -10000)
        {
            Grid.grid.y -= 10000;
            y = 0;
        }

        Grid.grid.x -= joueur.getVX() * delta;
        Grid.grid.y -= joueur.getVY() * delta;  
        
        x += joueur.getVX() * delta;
        y += joueur.getVY() * delta;

        sword.playSwordSwing(delta, cursorX, cursorY);
        
        gun.update(delta, cursorX, cursorY, deltaX, deltaY);
        
        monstres.forEach(monstre => {
            monstre.bouger(joueur,delta, deltaX, deltaY, ennemiColor);
            if(sword.hasSword)
            {
                if (sword.isSwordCollidingWithMonster(monstre)) {
                    //new Explosion(monstre.getX(), monstre.getY(), monstre.body.width*6, 15, 0xFF0000);
                    sword.onSwordHitEnemy(monstre);             
                }
            }
            if(gun.isBulletCollidingWithMonster(monstre))
            {
                gun.onBulletHitEnemy(monstre);
            }
        });
        if(hold)
        {
            gun.shoot();
        }
        
        explosions.forEach(explosion => {
            explosion.updateExplosion(deltaX, deltaY);
            explosion.applyDamage(monstres);
        });

        exps.forEach(exp => {
            let index = exps.indexOf(exp);
            if(Monstre.dedEXP)
            {
                exp.updatePos(deltaX, deltaY);
            }
            else if(exps.length > 0)
            {
                exp.body.clear();
                app.stage.removeChild(exp);
                if (index !== -1) {
                    exps.splice(index, 1);
                }
            }
            
        });
        
        joueur.onPlayerCollision(monstres);
    }
    else{

    }
    ennemiColor = updateBackgroundColor(app, Monstre);
    Monstre.cleanup();
    Exp.cleanup(delta);
    afficherDebug(delta);
}

function afficherDebug(delta) {
    if (!joueur.debug) {
        debugText.text = "";
        return;
    }

    debugText.text = `
        Joueur X : ${x}
        Joueur Y : ${y}
        baseGunDMG: ${gun.baseDMG}
        Vitesse Joueur : ${joueur.vitesse}
        Vitesse X : ${joueur.getVX().toFixed(2)}
        Vitesse Y : ${joueur.getVY().toFixed(2)}
        HP : ${joueur.currentHP}
        Exp : ${joueur.exp} 
        ${joueur.getExpBar()}
        Difficulty degree : ${Event.difficultyDegree}
        Monstres: ${monstres.length}
        Storage Monsters : ${Monstre.cleanMonstres.length}
        Explosions: ${explosions.length}
        Bullets : ${bullets.length}
        BulletPierce : ${gun.pierce}
        Exp orbs: ${exps.length}
        ExpBuildup: ${Exp.expBuildUp}
        Epée Active: ${sword.hasSword ? "Oui" : "Non"}
        Gun Active: ${gun.hasGun ? "Oui" : "Non"}
        MILK : ${Monstre.dedMilkMan}
        Cursor X: ${cursorX}
        Cursor Y: ${cursorY}
        Elapsed time: ${hour<=0?"":hour + "h"}${min<=0?"":min+ "m"}${elapsedTime.toFixed(2)}s
        FPS : ${app.ticker.FPS.toFixed(0)}
    `;
}




window.addEventListener('resize', () => {
    app.stage.removeChild(Grid.grid);
    app.renderer.resize(window.innerWidth, window.innerHeight);
    Grid.grid = Grid.drawGridBackground(app); 
    Grid.grid.zIndex = 0;
});
const EXP_BAR = document.getElementById('expBar');


function updateExpBar(joueur) {
    let height = window.innerHeight;
    let width = window.innerWidth;
    let expRatio = joueur.exp / joueur.expReq;

    EXP_BAR.style.height = `${expRatio * height}px`;
    EXP_BAR.style.width = `${width}px`;
}

function resizeApp(joueur) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    app.renderer.resize(width * 0.98, height * 0.98);
    app.view.style.position = "absolute"; // Ensure positioning works
    joueur.body.x = width/2;
    joueur.body.y = height/2;
    app.view.style.bottom = "0";
    app.view.style.transform = "translateX(0.5%)";
    updateExpBar(joueur);
}
// Update cursor position on mouse move
document.addEventListener("mousemove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
});

document.addEventListener("mousedown", (event) =>
{
    hold = true;
});

document.addEventListener("mouseup", (event) =>
{
    hold = false;
});
document.addEventListener('contextmenu', (event) =>{
    event.preventDefault();
});

document.addEventListener('keydown', event =>
{
    if(event.key == 'Escape')
    {
        
        if(!app.upg)
        {
            Grid.pauseGrid(app);
            app.pause = !app.pause;
        }
        //afficherMenu();
    }
});

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);
loader.add("index.html").load(setup);
