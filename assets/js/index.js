import { setupKeyboardControls } from './mouvement.js';
import { Monstre, MonstreNormal, MonstreRunner, MonstreTank, MonstreExp, MonstreGunner } from './monstre.js';
import { Grid, updateBackgroundColor, Shape3D} from './background.js';
import { Joueur } from './joueur.js';
import { Weapon, Sword, Explosion, Gun } from './weapons.js';
import { Exp } from './experience.js';
import { Upgrade } from './upgrades.js';
import { Event } from './events.js';
import { Music } from './musics.js';


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
// la touche C active ou désactive l'auto-attaque
// la touche P active ou désactive le mode space 
//
//
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




// noComeBacks empêche le spawner de réapparaître pour laisser entrer ceux qui 
// ont été perdus lors du nettoyage !
let joueur, state,  xF = 0, yF = 0, x = 0, y = 0, x2 = 0, y2 = 0,
monstres = Monstre.monstres, explosions = Explosion.explosions, exps = Exp.exps, exp = Exp, explosion = Explosion, bullets = Gun.bullets,
sword, gun, hasSword = false,  dedPos = 0, elapsedTime = 0, min = 0, hour = 0, event, swinging = 0,
cursorX, cursorY;

const app = new Application({
    width: 900,
    height: 900,
    antialias: true,
    transparent: false,
    resolution: 1,
    backgroundColor: 0x000000,
    x: 200
});
app.ennemiColor = 0x0000ff
app.backColor = 0x000000;
app.pause = false;
app.space = false;

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

// fonction qui initialise et configure les éléments nécessaires avant de commencer le jeu
function setup() {
    app.stage.sortableChildren = true;
    Monstre.addApp(app);
    Weapon.addApp(app);
    Weapon.addMonstres(Monstre);
    Joueur.addMonstre(Monstre);
    Joueur.addExplosion(Explosion);
    Joueur.addGrid(Grid);
    joueur = new Joueur(app);
    
    Joueur.addUpgrade(Upgrade);
    resizeApp(joueur);
    joueur.updateExpBar();
    Weapon.addJoueur(joueur);
    app.stage.addChild(Grid.grid);
    Exp.addJoueur(joueur);
    Exp.addApp(app);
    Monstre.addExp(exp);
    Monstre.addJoueur(joueur);
    Monstre.addExplosion(explosion);
    Weapon.addMonstreGunner(MonstreGunner);
    Upgrade.addApp(app);
    Upgrade.addJoueur(joueur);
    Upgrade.addMonstre(Monstre);
    Upgrade.addGrid(Grid);
    Event.addMusic(Music);
    Event.addApp(app);
    Event.addMonstres(Monstre, MonstreNormal, MonstreRunner, MonstreTank, MonstreExp, MonstreGunner);

    new Event("normal");
    //new Event("ambush");
    new Event(" ");

    sword = new Sword(1, joueur.baseDMG, 80, hasSword);  // rectangle bleu de 10x80
    gun = new Gun(1, joueur.baseDMG*1.7, 1);
    Upgrade.addWeapons(Sword, Gun, Explosion, sword, gun);
    joueur.chooseClass();
;




    // setInterval(() => { 
    //     new Exp(joueur.getX()*1.5, joueur.getY()*1.5, 100);
    // }, 10);

    setupKeyboardControls(app, joueur, sword, Monstre, gun, exps, Joueur,Event);


    // Set le statut du jeu
    state = play;

    Grid.pauseGrid(app);
    app.pause = true;
 
    
    // Commencer la boucle du jeu
    app.ticker.add((delta) => play(delta));
    app.stage.addChild(debugText);
}


// La boucle principale du jeu qui est appelée à chaque frame  
function play(delta) {
    resizeApp(joueur);
    if(!app.pause)
    {
        Event.updateEvents(delta);
        if(joueur.currentHP <= Event.ennemiDifficultee*2) joueur.triggerDamageEffect();
        joueur.updatelvl();
        joueur.updateHP();
        elapsedTime += delta / 60;
        joueur.statistics.timePlayed += (delta / 60 )*1000;
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


        
        let xI = xF;
        let yI = yF;
        xF += joueur.getVX();
        yF += joueur.getVY();

        const deltaX = -(xF - xI) * delta;
        const deltaY = -(yF - yI) * delta;
   
        if(x > 10000)
        {
            Grid.grid.x += 10000;
            x = 0;
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
        
        if(x2 > 100 || x2 < -100)
        {
            x2 = 0;
            Shape3D.spawnShapes(Event,app);
        }
        if(y2 > 100 || y2 < -100)
        {
            y2 = 0;
            Shape3D.spawnShapes(Event,app);
        }


        Grid.grid.x -= joueur.getVX() * delta;
        Grid.grid.y -= joueur.getVY() * delta; 

        app.gradientLine.x -= joueur.getVX() * delta;
        app.gradientLine.y -= joueur.getVY() * delta;
        
        x += joueur.getVX() * delta;
        y += joueur.getVY() * delta;
        x2 += joueur.getVX() * delta;
        y2 += joueur.getVY() * delta;

        for (let shape of Shape3D.shapes) {
            shape.updatePosition(deltaX,deltaY, [joueur.getX(), joueur.getY()]);
            shape.draw();
        }

        // Simplified Game Loop
        if ((joueur.hold || joueur.clickLock) && joueur.hasSword || swinging > 0) {
            if (swinging === 0) {
                swinging = Math.max(sword.cooldown, 10);
                sword.body.visible = true;
                sword.hasSword = true;
                sword.isSwinging = true;
                sword.firstSwing = true;

                // Reset hit status for all monsters
                monstres.forEach(monstre => monstre.setSwordHit(false));
            }

            // Decrease swinging time
            swinging = Math.max(0, swinging - delta);
            if (swinging === 0) {
                sword.hasSword = false;
                sword.body.visible = false;
            }

            //console.log(swinging);
            sword.playSwordSwing(delta, cursorX, cursorY);
        }

        
        (gun.cooldownTimeLeft-=delta) <= 0 ? gun.isOnCooldown = false : gun.isOnCooldown = true;
        if(joueur.hold && !gun.isOnCooldown || joueur.clickLock && !gun.isOnCooldown){gun.shoot();}
        if(sword.hasTrail){sword.updateTrail(delta, [0, 0.1, 0.2,0.05, 0.15, 0.25 ,-0.05], deltaX, deltaY);}

        gun.update(delta, cursorX, cursorY, deltaX, deltaY);

        MonstreGunner.updateBullets(delta, deltaX, deltaY, joueur);

        monstres.forEach(monstre => {
            monstre.bouger(joueur,delta, deltaX, deltaY, app.ennemiColor);
            if(sword.hasSword) {if (sword.isSwordCollidingWithMonster(monstre)) sword.onSwordHitEnemy(monstre);}
            if(gun.isBulletCollidingWithMonster(monstre)) gun.onBulletHitEnemy(monstre);
        });
        MonstreGunner.bullets.forEach(bullet => {if(sword.isSwordCollidingWithBullet(bullet)) sword.onSwordHitEnemyBullet(bullet);});

        
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
                if (index !== -1) exps.splice(index, 1);
            }
        });
        
        joueur.onPlayerCollision(monstres);
    }
    
    app.ennemiColor = updateBackgroundColor(app, Monstre);
    Shape3D.shapes.forEach(shape => shape.draw());
    Event.updateMusic();
    Monstre.cleanup();
    Exp.cleanup(delta);
    afficherDebug();
}

// Fonction qui affiche les informations de débogage 
function afficherDebug() {
    if (!joueur.debug) {
        debugText.text = "";
        return;
    }

    debugText.text = `
        Joueur X : ${x}
        Joueur Y : ${y}
        baseGunDMG: ${gun.baseDMG}
        baseSwordDMG: ${sword.baseDMG}
        Crit chance : ${joueur.critChance}%
        Crit DMG : ${joueur.critDMG}
        Vitesse Joueur : ${joueur.vitesse}
        Vitesse X : ${joueur.getVX().toFixed(2)}
        Vitesse Y : ${joueur.getVY().toFixed(2)}
        HP : ${joueur.currentHP}
        Exp : ${joueur.exp} 
        ${joueur.getExpBar()}
        Difficulty degree : ${Event.difficultyDegree}
        MonsterDiff : ${Event.ennemiDifficultee} 
        Monstres: ${monstres.length}
        Storage Monsters : ${Monstre.cleanMonstres.length}
        Explosions: ${explosions.length}
        Bullets : ${bullets.length}
        BulletPierce : ${gun.pierce-1}
        Exp orbs: ${exps.length}
        ExpBuildup: ${Exp.expBuildUp}
        Shapes : ${Shape3D.shapes.length}
        Epée Active: ${sword.hasSword ? "Oui" : "Non"}
        Gun Active: ${gun.hasGun ? "Oui" : "Non"}
        MILK : ${Monstre.dedMilkMan}
        Cursor X: ${cursorX}
        Cursor Y: ${cursorY}
        Elapsed time: ${hour<=0?"":hour + "h"}${min<=0?"":min+ "m"}${elapsedTime.toFixed(2)}s
        Event : ${Event.currentEvent}
        Song : ${Event.currentMusic.nom ? Event.currentMusic.nom : 0}
        FPS : ${app.ticker.FPS.toFixed(0)}







        // la touche Q active ou désactive l'épée
        // la touche T active ou désactive les textes de vie des ennemis
        // la touche Y desactive ou active les exp orbs qui droppent des ennemis
        // la touche B active ou désactive les explosions lors de la mort d'ennemis
        // la touche ; active debug mode
        // la touche G active ou désactive gun
        // la touche M active MILK_MODE
        // la touche "échap" pause la partie
        // la touche L active un très GRAND nombre de lvlUps
        // la touche C active ou désactive l'auto-attaque
        // la touche P active ou désactive le mode space 
        // la touche Backspace commits ded
    `;
    debugText.style.fill = app.ennemiColor;

}

// Gestion du graphique des FPS
function getFpsGraph(app, graphWidth = 100, graphHeight = 50) {
    const fpsHistory = [];
    const maxDataPoints = graphWidth;
    const graph = new PIXI.Graphics();

    app.ticker.add(() => {
        if (fpsHistory.length >= maxDataPoints) {
            fpsHistory.shift();
        }
        fpsHistory.push(app.ticker.FPS);

        graph.clear();
        graph.beginFill(0x000000, 0.5);
        graph.drawRect(0, 0, graphWidth, graphHeight);
        graph.endFill();

        const maxFps = 60;
        graph.lineStyle(2, 0x00FF00);

        fpsHistory.forEach((fps, index) => {
            const x = (index / maxDataPoints) * graphWidth;
            const y = graphHeight - (fps / maxFps) * graphHeight;
            if (index === 0) {
                graph.moveTo(x, y);
            } else {
                graph.lineTo(x, y);
            }
        });
    });
    graph.x = 44;
    graph.y = 585;
    graph.zIndex = 1000;
    return graph;
}
app.graph = getFpsGraph(app);
app.graph.visible = false;
app.stage.addChild(app.graph);


window.addEventListener('resize', () => {
    app.stage.removeChild(Grid.grid);
    app.renderer.resize(window.innerWidth, window.innerHeight);
    Grid.pauseGrid(app);
    app.pause = !app.pause;
    Grid.pauseGrid(app);
    app.pause = !app.pause;
    setTimeout(() => {
    sword.body.x = joueur.getX() + 15;
    sword.body.y = joueur.getY() + 12;
    }, 100);
});
const EXP_BAR = document.getElementById('expBar');

// Mise q jour de la barre d'expérience
function updateExpBar(joueur) {
    let height = window.innerHeight;
    let width = window.innerWidth;
    let expRatio = joueur.exp / joueur.expReq;

    EXP_BAR.style.height = `${expRatio * height}px`;
    EXP_BAR.style.width = `${width}px`;
}

// Adapte la taille de l'app à la fenêtre du navigateur
function resizeApp(joueur) {
    let width = window.innerWidth;
    let height = window.innerHeight;
    app.renderer.resize(width * 0.98, height * 0.98);
    app.view.style.position = "absolute"; // assurer que le positionnement est correct
    joueur.body.x = width/2.08;
    joueur.body.y = height/2.145;
    app.view.style.bottom = "0";
    app.view.style.transform = "translateX(0.5%)";
    updateExpBar(joueur);
}
// Update position du curseur avec le mouvement de la souris
document.addEventListener("mousemove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
});

document.addEventListener("mousedown", (event) =>
{
    joueur.hold = true;
});
document.addEventListener("mouseup", (event) =>
{
    if(!joueur.clickLock)
    {
        joueur.hold = false;
    }
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

// Ajouter le canvas que PIXI a automatiquement créé pour vous au document HTML
document.body.appendChild(app.view);
loader.add("index.html").load(setup);


