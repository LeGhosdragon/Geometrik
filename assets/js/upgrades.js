export class Upgrade
{

    static app = null;
    static joueur = null;
    static Monstre = null;
    static Sword = null;
    static Gun = null;
    static sword = null;
    static gun = null;
    static Grid = null;

    gunCode = "gun";
    swordCode = "sword";
    bombCode = "explosion";

    boiteGun = [
        [   //Bullet pierce
            new Upg(() => Upgrade.gun.pierce,(val) => Upgrade.gun.pierce = val,
                "+",1,
                "Pierce","Description","../images/Pierce.gif",
                true
            )//, insert more
        ],
        [   // Gun damage
            new Upg(() => Upgrade.gun.baseDMG, (val) => Upgrade.gun.baseDMG = val, 
                "x",1.2, 
                "DMG","Description","../images/Dmg.gif",
                true
            )//, insert more
        ],
        [   // Gun cooldown
            new Upg(() => Upgrade.gun.cooldown, (val) => Upgrade.gun.cooldown = val, 
                "x", 0.8, 
                "Cooldown","Description","../images/Cooldown.gif",
                true
            )//, insert more 
        ],
        [   // Bullet size
            new Upg(() => Upgrade.gun.bulletSize, (val) => Upgrade.gun.bulletSize = val, 
                "+",3, 
                "Bullet Size","Description","../images/bulletSize.gif",
                true
            )//, insert more
        ],
        [   // Gun knockback
            new Upg(() => Upgrade.gun.knockback, (val) => Upgrade.gun.knockback = val, 
                "+",2, 
                "Bullet Knockback","Description","../images/Knockback.gif",
                true
            )//, insert more
        ]
                        
    ];
    boiteSword = [
        [   //Sword width
            new Upg(() => Upgrade.sword.wideness,(val) => Upgrade.sword.wideness = val,
                "x",1.2,
                "Cleave Width","Description","../images/SwordWidth.gif",
                true
            ),//, insert more
        ],
        [   // Sword damage
            new Upg(() => Upgrade.sword.baseDMG, (val) => Upgrade.sword.baseDMG = val, 
                "x",1.1, 
                "DMG","Description","../images/Dmg.gif",
                true
            )//, insert more
        ],
        [   // Swing cooldown
            new Upg(() => Upgrade.sword.cooldown, (val) => Upgrade.sword.cooldown = val, 
                "x", 1.5, 
                "Cooldown","Description","../images/Cooldown.gif",
                true
            )//, insert more 
        ],
        [   // Sword length
            new Upg(() => Upgrade.sword.length, (val) => Upgrade.sword.length = val, 
                "x",1.5, 
                "Sword Length","Description","../images/bulletSize.gif",
                true
            )//, insert more
        ],
        [   // Sword knockback
            new Upg(() => Upgrade.sword.knockback, (val) => Upgrade.sword.knockback = val, 
                "+",2, 
                "Sword Knockback","Description","../images/Knockback.gif",
                true
            )//, insert more
        ]
    ];
    boiteJoueur = [
        [   //Player speed
            new Upg(() => Upgrade.joueur.vitesse,(val) => Upgrade.joueur.vitesse = val,
                "+",0.2, 
                "Player speed","Description","../images/MovementSpeed.gif",
                true
            )//, insert more
        ],
        [   //Player collection area
            new Upg(() => Upgrade.joueur.distanceDattraction ,(val) => Upgrade.joueur.distanceDattraction = val,
                "x",1.5, 
                "Attraction Area","Description","../images/Magnet.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.distanceDattraction ,(val) => Upgrade.joueur.distanceDattraction = val,
                "x",1.5, 
                "Attraction Area","Description","../images/Magnet.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.distanceDattraction ,(val) => Upgrade.joueur.distanceDattraction = val,
                "x",1.5, 
                "Attraction Area","Description","../images/Magnet.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.distanceDattraction ,(val) => Upgrade.joueur.distanceDattraction = val,
                "x",1.5, 
                "Attraction Area","Description","../images/Magnet.gif",
                false
            )//, insert more
        ],
        [   //Player health
            new Upg(() => Upgrade.joueur.baseHP,(val) => {Upgrade.joueur.currentHP = val; Upgrade.joueur.baseHP = val;},
                "x",1.5, 
                "Player Health","Description","../images/Health.gif",
                true
            )//, insert more
        ],
        [   //Player Explosion
            new Upg(() => Upgrade.joueur.upgExplosion,(val) => Upgrade.joueur.upgExplosion = val,
                "bool",true, 
                "Player Explosion","Description","../images/PlayerBoom.gif",
                false
            ),
            new Upg(() => Upgrade.joueur.explRadius,(val) => Upgrade.joueur.explRadius = val,
                "x",1.3, 
                "Player Explosion","Description","../images/PlayerBoom.gif",
                true
            )
        ],
    ];
    boite = [];



    attackSpeed = []

    constructor(weapon){
        this.weapon = weapon;
        this.description = "description";
        this.boite = this.weapon == "gun" ? this.boiteGun.concat(this.boiteJoueur) :  this.boiteSword.concat(this.boiteJoueur);
    }


    //plusieurs catégories, chaque cat a un niv qui spécifie sont niv prochain

    //so list de liste, si tu prend la liste tu prends le upgrade, pis tu remove l'upgrade utilisé pour accèder au prochain.

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
            
            const title = document.createElement("h3");
            title.textContent = upgrade.title;
            title.style.marginBottom = "10px";
            
            const icon = document.createElement("img"); // Change div to img
            icon.src = upgrade.icon; // Assuming upgrade.icon is a GIF URL
            icon.style.width = "100px";
            icon.style.height = "100px";
            icon.style.display = "block";
            icon.style.margin = "0 auto";
            
            const description = document.createElement("p");
            description.textContent = upgrade.description;
            description.style.fontSize = "14px";
            
            card.appendChild(icon); // Append the image instead of a div
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
    static addWeapons(sword, gun, instSword, instGun ) {
        Upgrade.Sword = sword;
        Upgrade.Gun = gun;
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
        this.description = description;
        this.title = title;
        this.icon = icon;
    }

    apply() {
        let currentValue = this.getParam(); 

        if (this.type == "+") {
            currentValue += this.augment;
        } else if (this.type == "-") {
            currentValue -= this.augment;
        } else if (this.type == "x") {
            currentValue *= this.augment;
        }
        else if(this.type == "bool")
        {
            currentValue = this.augment;
        }
        console.log(this.description + " :", this.getParam() + " => " +  this.setParam(currentValue));  
         
        //console.log("Updated Value:", this.getParam());
        //console.log("Upgraded => " + this.description);  
    }
}



