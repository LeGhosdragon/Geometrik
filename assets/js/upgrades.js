export class Upgrade
{

    static app = null;
    static joueur = null;
    static Monstre = null;
    static Sword = null;
    static Gun = null;
    static Explosion = null;
    static sword = null;
    static gun = null;
    static Grid = null;
    

    gunCode = "gun";
    swordCode = "sword";
    bombCode = "explosion";

    boiteGun = [
        [   // Bullet pierce
            new Upg(() => Upgrade.gun.pierce, (val) => Upgrade.gun.pierce = val,
                "+", 1,
                "Pierce", () => `Bullets pierce one more enemy! Piercing: ${Upgrade.gun.pierce - 1} => ${Upgrade.gun.pierce}`, "../images/Pierce.gif",
                true
            )//, insert more
        ],
        [   // Gun damage
            new Upg(() => Upgrade.gun.baseDMG, (val) => Upgrade.gun.baseDMG = val,
                "x", 1.2,
                "Gun Damage", () => `More bullet damage! DMG: ${(Upgrade.gun.baseDMG).toFixed(2)}dmg => ${(Upgrade.gun.baseDMG * 1.2).toFixed(2)}dmg`, "../images/Dmg.gif",
                true
            )//, insert more
        ],
        [   // Gun cooldown
            new Upg(() => Upgrade.gun.cooldown, (val) => Upgrade.gun.cooldown = val,
                "x", 0.8,
                "Cooldown", () => `Generate bullets faster! ${(Upgrade.gun.cooldown / 60).toFixed(2)}s => ${(Upgrade.gun.cooldown * 0.8 / 60).toFixed(2)}s`, "../images/Cooldown.gif",
                true
            )//, insert more 
        ],
        [   // Bullet size
            new Upg(() => Upgrade.gun.bulletSize, (val) => Upgrade.gun.bulletSize = val,
                "+", 3,
                "Bullet Size", () => `Bigger bullets! Size: ${(Upgrade.gun.bulletSize).toFixed(2)}px => ${(Upgrade.gun.bulletSize + 3).toFixed(2)}px`, "../images/bulletSize.gif",
                true
            )//, insert more
        ],
        [   // Gun knockback
            new Upg(() => Upgrade.gun.knockback, (val) => Upgrade.gun.knockback = val,
                "+", 2,
                "Bullet Knockback", () => `More knockback! Force: ${(Upgrade.gun.knockback).toFixed(2)} N => ${(Upgrade.gun.knockback + 2).toFixed(2)} N`, "../images/Knockback.gif",
                true
            )//, insert more
        ]
    ];
    
    boiteSword = [
        [   // Sword width
            new Upg(() => Upgrade.sword.wideness, (val) => Upgrade.sword.wideness = val,
                "x", 1.1,
                "Cleave Width", () => `Increase sword cleave width! ${Upgrade.sword.wideness.toFixed(2)} => ${(Upgrade.sword.wideness*1.1).toFixed}`, "../images/SwordWidth.gif",
                true
            )//, insert more
        ],
        [   // Sword damage
            new Upg(() => Upgrade.sword.baseDMG, (val) => Upgrade.sword.baseDMG = val,
                "x", 1.2,
                "Sword Damage", () => `Increase sword damage! DMG: ${(Upgrade.sword.baseDMG).toFixed(2)}dmg => ${(Upgrade.sword.baseDMG * 1.2).toFixed(2)}dmg`, "../images/Dmg.gif",
                true
            )//, insert more
        ],
        [   // Sword cooldown
            new Upg(() => Upgrade.sword.cooldown, (val) => Upgrade.sword.cooldown = val,
                "x", 0.5,
                "Cooldown", () => `Reduce sword cooldown! ${(Upgrade.gun.cooldown / 60).toFixed(2)}s => ${(Upgrade.gun.cooldown * 0.8 / 60).toFixed(2)}s`, "../images/Cooldown.gif",
                true
            )//, insert more 
        ],
        [   // Sword length
            new Upg(() => Upgrade.sword.length, (val) => Upgrade.sword.length = val,
                "+", 30,
                "Sword Length", () => `Increase sword length for greater reach! ${Upgrade.sword.length}px => ${Upgrade.sword.length + 30}px`, "../images/bulletSize.gif",
                true
            )//, insert more
        ],
        [   // Sword knockback
            new Upg(() => Upgrade.sword.knockback, (val) => Upgrade.sword.knockback = val,
                "+", 2,
                "Sword Knockback", () => `More knockback! Force: ${(Upgrade.gun.knockback).toFixed(2)}N => ${(Upgrade.gun.knockback + 2).toFixed(2)}N`, "../images/Knockback.gif",
                true
            )//, insert more
        ]
    ];
    
    boiteJoueur = [
        [   // Player speed
            new Upg(() => Upgrade.joueur.vitesse, (val) => Upgrade.joueur.vitesse = val,
                "+", 0.2,
                "Player Speed", () => `Move faster to avoid enemies! ${Upgrade.joueur.vitesse.toFixed(2)}m/s => ${(Upgrade.joueur.vitesse + 0.2).toFixed(2)}m/s`, "../images/MovementSpeed.gif",
                true
            )//, insert more
        ],
        [   // Player collection area
            new Upg(() => Upgrade.joueur.distanceDattraction, (val) => Upgrade.joueur.distanceDattraction = val,
                "x", 1.3,
                "Attraction Area", () => `Increase area to collect items! ${Upgrade.joueur.distanceDattraction.toFixed(2)}px => ${(Upgrade.joueur.distanceDattraction * 1.3).toFixed(2)}px`, "../images/Magnet.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.distanceDattraction, (val) => Upgrade.joueur.distanceDattraction = val,
                "x", 1.3,
                "Attraction Area", () => `Increase area to collect items! ${Upgrade.joueur.distanceDattraction.toFixed(2)}px => ${(Upgrade.joueur.distanceDattraction * 1.3).toFixed(2)}px`, "../images/Magnet.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.distanceDattraction, (val) => Upgrade.joueur.distanceDattraction = val,
                "x", 1.3,
                "Attraction Area", () => `Increase area to collect items! ${Upgrade.joueur.distanceDattraction.toFixed(2)}px => ${(Upgrade.joueur.distanceDattraction * 1.3).toFixed(2)}px`, "../images/Magnet.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.distanceDattraction, (val) => Upgrade.joueur.distanceDattraction = val,
                "x", 1.3,
                "Attraction Area", () => `Increase area to collect items! ${Upgrade.joueur.distanceDattraction.toFixed(2)}px => ${(Upgrade.joueur.distanceDattraction * 1.3).toFixed(2)}px`, "../images/Magnet.gif",
                false
            )//, insert more
        ],
        [   // Player health
            new Upg(() => Upgrade.joueur.baseHP, (val) => { Upgrade.joueur.currentHP += val; Upgrade.joueur.baseHP += val; Upgrade.joueur.updateHP();},
                "x", 0.2,
                "Player Health", () => `Increase player's max health! HP : ${Upgrade.joueur.currentHP.toFixed(2)} => ${(Upgrade.joueur.currentHP+Upgrade.joueur.baseHP*0.2).toFixed(2)}`, "../images/Health.gif",
                true
            )//, insert more
        ],
        [   // Player explosion
            new Upg(() => Upgrade.joueur.upgExplosion, (val) => Upgrade.joueur.upgExplosion = val,
                "bool", true,
                "Player Explosion", () => `Explode when harmed, damaging and pushing nearby enemies! ${Upgrade.joueur.upgExplosion} => enabled`, "../images/PlayerBoom.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.explRadius, (val) => Upgrade.joueur.explRadius = val,
                "x", 1.3,
                "Explosion Radius", () => `Increase explosion radius for greater impact! ${Upgrade.joueur.explRadius.toFixed(2)} => ${(Upgrade.joueur.explRadius*1.3).toFixed(2)}`, "../images/PlayerBoom.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.explRadius, (val) => Upgrade.joueur.explRadius = val,
                "x", 1.3,
                "Explosion Radius", () => `Increase explosion radius for greater impact! ${Upgrade.joueur.explRadius.toFixed(2)} => ${(Upgrade.joueur.explRadius*1.3).toFixed(2)}`, "../images/PlayerBoom.gif",
                false
            ),
            new Upg(() => Upgrade.Explosion.bodyKnockback, (val) => Upgrade.Explosion.bodyKnockback = val,
                "x", 2,
                "Explosion Impact", () => `Increase explosion impact for greater impact! ${Upgrade.Explosion.bodyKnockback.toFixed(2)} => ${(Upgrade.Explosion.bodyKnockback*2).toFixed(2)}`, "../images/PlayerBoom.gif",
                false
            )//, insert more
        ],
    ];
    
    boite = [];

    constructor(weapon){
        this.weapon = weapon;
        this.description = "description";
        this.boite = this.weapon == "gun" ? this.boiteGun.concat(this.boiteJoueur) :  this.boiteSword.concat(this.boiteJoueur);
    }

    choisirUpgrade(nbChoix) {
        let upgrades = [];
        let availableUpgrades = this.boite.filter(category => category.length > 0); // Only keep non-empty categories

        if (availableUpgrades.length === 0) return upgrades; // No upgrades left

        while (upgrades.length < nbChoix && availableUpgrades.length > 0) {
            let num = Math.floor(Math.random() * availableUpgrades.length);
            let chosenUpgrade = availableUpgrades[num][0]; // Get first available upgrade from the chosen category

            if (!upgrades.includes(chosenUpgrade)) {
                upgrades.push(chosenUpgrade);
            } else {
                continue; // If duplicate, try again
            }

            // Remove empty categories from consideration
            availableUpgrades = availableUpgrades.filter(category => category.length > 0);
        }

        Upgrade.Grid.pauseGrid(Upgrade.app);
        Upgrade.app.pause = true;
        Upgrade.app.upg = true;

        return upgrades;
    }



    upgradeChoisi(upgrade) {
        let index = -1;
        let foundIn = -1; 
    
        upgrade.apply();
        
        // Find the upgrade in the list and remove it if necessary
        for (let i = 0; i < this.boite.length; i++) {
            index = this.boite[i].indexOf(upgrade);
            if (index > -1) {
                foundIn = i;
                break; 
            }
        }
        if (foundIn > -1 && !upgrade.exponentiel) {
            this.boite[foundIn].splice(index, 1); 
        }
    
        // Remove the upgrade UI container from the DOM
        const container = document.getElementById("upgrade-container");
        if (container) {
            container.remove();
        }
    
        // Resume the game
        Upgrade.Grid.pauseGrid(Upgrade.app);
        Upgrade.app.upg = false;
        Upgrade.app.pause = false;
    }
    
    montrerUpgrades(upgrades) {
        const container = document.createElement("div");
        container.id = "upgrade-container";
        container.style.position = "absolute";
        container.style.top = "50%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)"; 
        container.style.display = "flex";
        container.style.gap = "2vw";
        container.style.zIndex = "1000";
        container.style.backgroundColor = "rgba(0, 0, 0, 0.0)";
        
        upgrades.forEach((upgrade) => {
            const card = document.createElement("div");
            card.className = "card";
            card.style.width = "200px";
            card.style.borderRadius = "15px";
            card.style.overflow = "hidden";
            card.style.backgroundColor = "#2a2a2a";
            card.style.color = "white";
            card.style.textAlign = "center";
            card.style.padding = "15px";
            card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
            card.style.cursor = "pointer";
            card.style.userSelect = "none"; // Prevent text highlighting
            
            const title = document.createElement("h3");
            title.style.fontSize = "24px";
            title.textContent = upgrade.title;
            title.style.marginBottom = "10px";
            
            const icon = document.createElement("img"); 
            icon.src = upgrade.icon;
            icon.style.width = "100px";
            icon.style.height = "100px";
            icon.style.display = "block";
            icon.style.margin = "0 auto";
            icon.draggable = false; // Prevent image dragging
            
            const description = document.createElement("p");
            description.textContent = upgrade.getDescription();
            description.style.fontFamily ="courier new";
            description.style.fontSize = "16px";
            description.style.userSelect = "none"; // Prevent text highlighting
            
            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(description);
            
            card.addEventListener("click", () => this.upgradeChoisi(upgrade));
            
            container.appendChild(card);
        });
        
        document.body.appendChild(container);
    }
    
    
    
    

    
    static addGrid(grid)
    {
        Upgrade.Grid = grid;
    }
    static addMonstre(monstresInput)
    {
        Upgrade.Monstre = monstresInput;
    }
    static addApp(appInput) {
        Upgrade.app = appInput;
    }
    static addJoueur(joueurInput) {
        Upgrade.joueur = joueurInput;
    }
    static addWeapons(sword, gun, explosion, instSword, instGun ) {
        Upgrade.Sword = sword;
        Upgrade.Gun = gun;
        Upgrade.Explosion = explosion;
        Upgrade.sword = instSword;
        Upgrade.gun = instGun;
    }
}

class Upg {
    constructor(getParam, setParam, type, augment, title, description, icon, exponentiel) {
        this.exponentiel = exponentiel;
        this.getParam = getParam; 
        this.setParam = setParam; 
        this.augment = augment;
        this.type = type;
        this.description = typeof description === 'function' ? description : () => description;
        this.title = title;
        this.icon = icon;
    }

    getDescription() {
        return this.description(); 
    }

    apply() {
        let currentValue = this.getParam(); 

        if (this.type == "+") {
            currentValue += this.augment;
        } else if (this.type == "-") {
            currentValue -= this.augment;
        } else if (this.type == "x") {
            currentValue *= this.augment;
        }else if(this.type == "bool")
        {
            currentValue = this.augment;
        }
        this.getParam();
        this.setParam(currentValue);  
    }
}



