export class Upgrade
{

    static app = null;
    static joueur = null;
    static Monstre = null;
    static Sword = null;
    static Gun = null;
    static sword = null;
    static gun = null;


    gunCode = "gun";
    swordCode = "sword";
    bombCode = "explosion";

    boiteGun = [
        [   //Player speed
            new Upg(
                () => Upgrade.joueur.vitesse,
                (val) => Upgrade.joueur.vitesse = val,
                0.2, 
                "+",
                "Player speed",
                true
            )//, insert more
        ],
        [   //Bullet pierce
            new Upg(
                () => Upgrade.gun.pierce,
                (val) => Upgrade.gun.pierce = val,
                1, 
                "+",
                "Pierce",
                true
            )//, insert more

        ],
        [   // Gun damage
            new Upg(
                () => Upgrade.gun.baseDMG, 
                (val) => Upgrade.gun.baseDMG = val, 
                1.1, 
                "x", 
                "DMG",
                true
            )//, insert more
        ],
        [   // Gun cooldown
            new Upg(
                () => Upgrade.gun.cooldown, 
                (val) => Upgrade.gun.cooldown = val, 
                0.9, 
                "x", 
                "Cooldown",
                true
            )//, insert more 
        ],
        [   // Bullet size
            new Upg(
                () => Upgrade.gun.bulletSize, 
                (val) => Upgrade.gun.bulletSize = val, 
                1, 
                "+", 
                "Bullet Size",
                true
            )//, insert more
        ]
                        
    ];
    boiteSword = [];
    boiteExplosion = [];
    boite = [];



    attackSpeed = []

    constructor(weapon){
        this.weapon = weapon;
        this.description = "description";
        this.boite = this.weapon == "gun" ? this.boiteGun : boite = this.boiteSword;
    }


//plusieurs catégories, chaque cat a un niv qui spécifie sont niv prochain

//so list de liste, si tu prend la liste tu prends le upgrade, pis tu remove l'upgrade utilisé pour accèder au prochain.


    choisirUpgrade(nbChoix)
    {
        let upgrades = [];
        let numList = [];
        for(let i = 0; i < nbChoix && numList.length <= this.boite.length; i++)
        {
            let num = Math.floor(Math.random() * this.boite.length);
            numList.includes(num) ? i-- : numList[numList.length] = num;
        }
        let numLength = numList.length;
        while(upgrades.length < numLength)
        {
            upgrades[upgrades.length] = this.boite[numList.shift()][0];
        }
        //Upgrade.app.pause = true;
        return upgrades;
    }

    upgradeChoisi(upgrade) {
        let index = -1;
        let foundIn = -1; 

        upgrade.apply();
    
        for (let i = 0; i < this.boite.length; i++) {
            index = this.boite[i].indexOf(upgrade);
            if (index > -1) {
                foundIn = i;
                break; 
            }
        }
        if (foundIn > -1 && !upgrade.exponentiel) {
            //console.log(this.boite[foundIn][index]);
            this.boite[foundIn].splice(index, 1); 
        }
        Upgrade.app.pause = false;
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
    constructor(getParam, setParam, augment, type, description, exponentiel) {
        this.exponentiel = exponentiel;
        this.getParam = getParam; 
        this.setParam = setParam; 
        this.augment = augment;
        this.type = type;
        this.description = description;
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
        console.log(this.description + " :", this.getParam() + " => " +  this.setParam(currentValue));  
         
        //console.log("Updated Value:", this.getParam());
        //console.log("Upgraded => " + this.description);  
    }
}
