/**
 * La classe Event gère les événements dynamique du jeu. Elle définit 
 * les comportements des vagues d'ennemis (type, fréquence d'apparition,
 * difficutlé etc.)
 */
export class Event{
    static events = [];
    static Music = null;
    static Monstre = null;
    static MonstreNormal = null;
    static MonstreRunner = null;
    static MonstreTank = null;
    static MonstreExp = null;
    static MonstreGunner = null;
    static BossNormal = null;
    static BossRunner = null;
    static BossTank = null;
    static BossGunner = null;
    static MilkMan = null;
    static BossBunny = null;
    static Err404 = null;
    static monstres = null;
    static app = null;
    static gun = null;
    static Joueur = null;
    static milkMode = null;
    static joueur = null;
    static difficultyDegree = 1;
    static currentEventName = "normal";
    static currentEvent = null;
    static ennemiDifficultee = 1;
    static eventNameList = ["normal", "horde", "ambush", "fort", "guns"];
    static musicList = null;
    static currentMusic = null;
    static nextSong = false;
    static nextSongIs = null;
    static lastSong = false;
    static boss = {"bossNormal":null, "bossRunner":null, "bossTank":null, "bossGunner":null, "milkMan":null, "err404":null, "bossBunny":null};
    static lastMin = 0;

    constructor(type)
    {
        this.type = type;
        this.state = true; 
        this.comeBacks = true;
        this.timeElapsed = 0;
        Event.events.push(this);
    }

    static updateEvents(delta, min)
    {
        let num = null;
        let bossChoose = false;
        Event.events.forEach(event => {   
            event.timeElapsed += 1;     
            if(event.type == " ") {
                min % 2 == 0 ? this.lastMin != min ? event.ajouterMONSTRE(Math.ceil(delta), "expBall", 3): 0 : 0;
                min % 2 == 0 ? this.lastMin != min ? Event.updateDifficultee() : 0 : "";
                //min % 2 == 0 ? this.lastMin != min ? bossChoose = true: 0 : 0;
                this.lastMin = min;
                let compteur = 0;

                if(Event.boss["bossRunner"] == null){
                    event.ajouterMONSTRE(1, "bossRunner", 2 + Event.difficultyDegree, "boss"); 
                }


                while(bossChoose && compteur < 100)
                {
                    num = Math.floor(Math.random() * 7);
                    switch (num) {
                        case 0:
                            if(Event.boss["bossNormal"] != null) {compteur++;}
                            else {
                                event.ajouterMONSTRE(1, "bossNormal", 2 + Event.difficultyDegree, "boss");
                                Event.currentMusic.stop();
                                Event.nextSong = true;
                                Event.nextSongIs = "boss";
                                bossChoose = false;
                                Event.updateMusic(); 
                         
                            }
                            break;
                        case 1:
                            if(Event.boss["err404"] != null) { compteur++; }
                            else {
                                event.ajouterMONSTRE(1, "err404", 2 + Event.difficultyDegree, "boss");
                                Event.currentMusic.stop();
                                Event.nextSong = true;
                                Event.nextSongIs = "404Boss";
                                bossChoose = false;
                                Event.updateMusic(); 
                               
                            }
                            break;
                        case 2:
                            if(Event.boss["bossGunner"] != null) {compteur++;}
                            else {
                                event.ajouterMONSTRE(1, "bossGunner", 2 + Event.difficultyDegree, "boss"); 
                                Event.currentMusic.stop();
                                Event.nextSong = true; 
                                Event.nextSongIs = "kim";
                                bossChoose = false;
                                Event.updateMusic(); 
                              
                            }
                            break;
                        case 3:
                            if(Event.boss["bossTank"] != null) {compteur++;}
                            else {
                                event.ajouterMONSTRE(1, "bossTank", 2 + Event.difficultyDegree, "boss"); 
                                Event.currentMusic.stop();
                                Event.nextSong = true; 
                                Event.nextSongIs = "difficulty";
                                bossChoose = false;
                                Event.updateMusic(); 
                            }
                            break;
                        case 4:
                        if(Event.boss["milkMan"] != null) {compteur++;}
                            else {
                                event.ajouterMONSTRE(1, "milkMan", 2 + Event.difficultyDegree, "boss"); 
                                Event.currentMusic.stop();
                                Event.nextSong = true; 
                                Event.nextSongIs = "milkMan";
                                bossChoose = false;
                                Event.updateMusic(); 
              
                                Event.milkMode(Event.app, Event.joueur, 0, Event.Monstre, Event.gun, 0, Event.Joueur, Event, true);    
                            }
                            break;
                        case 5:
                            if(Event.boss["bossBunny"] != null) { compteur++; }
                            else {
                                event.ajouterMONSTRE(1, "bossBunny", 2 + Event.difficultyDegree, "boss");
                                Event.currentMusic.stop();
                                Event.nextSong = true;
                                Event.nextSongIs = "bossBunny"; // Vous pouvez définir une musique spécifique pour BossBunny si vous le souhaitez
                                bossChoose = false;
                                compteur = 0;
                            }
                            break;
                        case 6:
                            if(Event.boss["bossRunner"] != null) { compteur++; }
                            else {
                                event.ajouterMONSTRE(1, "bossRunner", 2 + Event.difficultyDegree, "boss");
                                Event.currentMusic.stop();
                                Event.nextSong = true;
                                Event.nextSongIs = "bossRunner"; // Vous pouvez définir une musique spécifique pour BossBunny si vous le souhaitez
                                bossChoose = false;
                                compteur = 0;
                            }
                            break;
                        default:
                            break;
                    }
                }
                


                if (Event.boss["bossNormal"] != null) { event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( 1, "normal", 2 + Event.difficultyDegree, "normal") :0;}
                if (Event.boss["bossBunny"] != null) { event.timeElapsed%300 == 0 ? Event.boss["bossBunny"].activatePower():0;}
            } 
            if(event.type == "normal") {
               // Update the music based on the current event

                Event.nextSongIs = "space2";
                event.timeElapsed % Math.round(40 / Event.difficultyDegree) == 0 ? event.ajouterMONSTRE(Math.ceil(delta), "normal", 2 + Event.difficultyDegree) : 0;
                Event.difficultyDegree >= 2 ? event.timeElapsed % Math.round(50 / Event.difficultyDegree) == 0 ? event.ajouterMONSTRE(Math.ceil(delta), "runner", 4 + Event.difficultyDegree) : 0 : 0;
                Event.difficultyDegree >= 2 ? event.timeElapsed % Math.round(30 / Event.difficultyDegree) == 0 ? event.ajouterMONSTRE(Math.ceil(delta), "tank", 5 + Event.difficultyDegree) : 0 : 0;
                event.state = !(event.timeElapsed >= 3600) && event.state;
            }
            if (event.type == "horde") {
                Event.nextSongIs = "space";
                event.timeElapsed % Math.round(40 / Event.difficultyDegree) == 0 ? event.ajouterMONSTRE(Math.ceil(delta), "normal", 2 + Event.difficultyDegree) : 0;
                event.state = !(event.timeElapsed >= 1800) && event.state;
            }
            if(event.type == "ambush")// ennemis runner circulent autour du joueur pour un petit instant
            {
                Event.nextSongIs = "speed";
                event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta), "runner", 3 + Event.difficultyDegree) :0;
                event.state = !(event.timeElapsed >= 1800) && event.state;
            }
            if(event.type == "fort") // ennemis tank  cirulent autour du joueur pour un petit instant
            {
                Event.nextSongIs = "difficulty2";
                event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta),  "tank",  4 + Event.difficultyDegree) :0;
                event.state = !(event.timeElapsed >= 1800) && event.state;
            }
            if(event.type == "guns") // ennemis tank  cirulent autour du joueur pour un petit instant
            {
                Event.nextSongIs = "normalIntense";
                event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta),  "gunner",  4 + Event.difficultyDegree) :0;
                event.state = !(event.timeElapsed >= 1800) && event.state;
            }
            if (!event.state) {
                let index = Event.events.indexOf(event);
                if (index > -1) {
                    Event.events.splice(index, 1);
                }
                Event.ennemiDifficultee *= 1.1;
                Event.currentEvent = new Event(Event.getNewEventName());
            }
            
        });
        Event.updateMusic(); 
    }

    static getNewEventName()
    {
        let event = Math.floor(Math.random() * 5);
        return Event.eventNameList[event];
    }

    static updateMusic() {
        if (Event.currentMusic != null ) {
            // Check if the current song is finished or if we need to play the next song
            if ((Event.currentMusic.audio.currentTime >= (Event.currentMusic.audio.duration - 1) || Event.nextSong)&& !Event.lastSong) {
                // Stop current music
                Event.currentMusic.stop();

                if (Event.nextSong) {
                    Event.currentMusic = Event.musicList[Event.nextSongIs];
                    Event.nextSong = false; 
                    Event.currentMusic.play();
                } else {

                    let num = Math.round(Math.random() * 3);
                    switch (num) {
                        case 1:
                            Event.currentMusic = Event.musicList["difficulty2"];
                            break;
                        case 2:
                            Event.currentMusic = Event.musicList["space2"];
                            break;
                        case 3:
                            Event.currentMusic = Event.musicList["space3"];
                            break;
                        default:
                            break;
                    }
                    Event.currentMusic.play(); // Play the selected music
                    Event.currentMusic.audio.currentTime = 0;
                }
                console.log(Event.currentMusic.nom);
                if(Event.currentMusic.nom == "404Boss")
                {
                    Event.currentMusic.audio.currentTime = 44;
                }
                if(Event.currentMusic.nom == "gameOver")
                {
                    Event.lastSong = true;
                }
            }
            else{
                //Event.currentMusic.stop();
            }
 
        }
        
    }
    

    static updateDifficultee()
    {
        Event.difficultyDegree = Event.difficultyDegree < 10 ? Event.difficultyDegree + 1 : Event.difficultyDegree;
    }




    // Méthode qui ajoute un certain nb de monstres avec le nb de coôtés donné
    ajouterMONSTRE(amount = 1, type = "normal", sides = 3, code = "") { 
        // si le nb de monstres actifs est inf a la limite -> ajouter
        if((Event.Monstre.cleanMonstres.length < 10 || !this.comeBacks) && Event.monstres.length < 100 * Math.min(Event.difficultyDegree, 6) && code == "")
        {
            for (let i = 0; i < amount; i++) {
                let rngPos = Event.posRandomExterieur();
         
                let monstre;          
                if(type == "normal") { 
                    monstre = new Event.MonstreNormal( rngPos[0], rngPos[1], sides, Event.ennemiDifficultee);}
                    // ligne de debug à Antoine pour tester les ennemis:
                    //monstre = new Event.MonstreGunner( rngPos[0], rngPos[1], sides, Event.ennemiDifficultee);}
                else if(type == "runner") {
                    monstre = new Event.MonstreRunner( rngPos[0], rngPos[1], sides,Event.ennemiDifficultee);}
                else if(type == "tank") {
                    monstre = new Event.MonstreTank( rngPos[0], rngPos[1], sides,Event.ennemiDifficultee);}
                else if(type == "expBall") {
                    monstre = new Event.MonstreExp( rngPos[0], rngPos[1], sides,Event.ennemiDifficultee);}
                else if(type == "gunner"){
                    monstre = new Event.MonstreGunner( rngPos[0], rngPos[1], sides,Event.ennemiDifficultee);}
                Event.app.stage.addChild(monstre.body);
                Event.monstres.push(monstre);
            }
        }
        else{
            this.placeOldOnes();
        }
        let rngPos = Event.posRandomExterieur();
        let monstre;
        if(type == "bossNormal"){
            monstre = new Event.BossNormal( rngPos[0], rngPos[1], sides,Event.ennemiDifficultee);
            Event.boss[type] = monstre;
            Event.app.stage.addChild(monstre.body);
            Event.monstres.push(monstre);}
        if(type == "bossRunner"){
            monstre = new Event.BossRunner( rngPos[0], rngPos[1], sides, Event.ennemiDifficultee);
            Event.boss[type] = monstre;
            Event.app.stage.addChild(monstre.body);
            Event.monstres.push(monstre);}
        if(type == "bossTank"){
            monstre = new Event.BossTank( rngPos[0], rngPos[1], sides,Event.ennemiDifficultee);
            Event.boss[type] = monstre;
            Event.app.stage.addChild(monstre.body);
            Event.monstres.push(monstre);}
        if(type == "bossGunner"){
            monstre = new Event.BossGunner( rngPos[0], rngPos[1], sides, Event.ennemiDifficultee);
            Event.boss[type] = monstre;
            Event.app.stage.addChild(monstre.body);
            Event.monstres.push(monstre);}
        if(type == "err404"){
            monstre = new Event.Err404( rngPos[0], rngPos[1], sides,Event.ennemiDifficultee);
            Event.boss[type] = monstre;
            Event.app.stage.addChild(monstre.body);
            Event.monstres.push(monstre);}
        if(type == "milkMan"){
            monstre = new Event.MilkMan( rngPos[0], rngPos[1], sides, Event.ennemiDifficultee);
            Event.boss[type] = monstre;
            Event.app.stage.addChild(monstre.body);
            Event.monstres.push(monstre);}
        if(type == "bossBunny"){
            monstre = new Event.BossBunny(rngPos[0], rngPos[1], sides, Event.ennemiDifficultee);
            Event.boss[type] = monstre;
            Event.app.stage.addChild(monstre.body);
            Event.monstres.push(monstre);}            
        else if(code == "normal"){
            monstre = new Event.MonstreNormal( Event.boss["bossNormal"].getX(), Event.boss["bossNormal"].getY(), sides, Event.ennemiDifficultee);
            Event.app.stage.addChild(monstre.body);
            Event.monstres.push(monstre);
        }
    }

    // Méthode qui remplace les monstres existants qui ne sont plus actifs et
    // les repositionne aléatoirement off-screen
    placeOldOnes()
    {
        Event.Monstre.cleanMonstres.forEach(monstre => {
            if (!monstre.isIn) {
                //console.log("ITS IN");
                monstre.isIn = true;
                Event.Monstre.monstres.push(monstre);

                let index = Event.Monstre.cleanMonstres.indexOf(monstre);
                if (index !== -1) {
                    Event.Monstre.cleanMonstres.splice(index, 1);
                }
            }        
            let rngPos = Event.posRandomExterieur();

            monstre.setX(rngPos[0]);
            monstre.setY(rngPos[1]);
        });
    }

    // génère une position aléatoire off-screen et retourne les coordonnées x,y
    static posRandomExterieur() {
        let margin = Math.min(Event.app.view.width, Event.app.view.height) * 0.2; // Thin area around the screen
        let randomX, randomY;

        let side = Math.random();

        if (side < 0.2) {
            // Top side
            randomX = Math.random() * Event.app.view.width;
            randomY = -margin - Math.random() * margin;
        } else if (side < 0.4) {
            // Bottom side
            randomX = Math.random() * Event.app.view.width;
            randomY = Event.app.view.height + margin + Math.random() * margin;
        } else if (side < 0.6) {
            // Left side
            randomX = -margin - Math.random() * margin;
            randomY = Math.random() * Event.app.view.height;
        } else if (side < 0.8) {
            // Right side
            randomX = Event.app.view.width + margin + Math.random() * margin;
            randomY = Math.random() * Event.app.view.height;
        } else {
            // Corners (evenly distributed)
            let corner = Math.floor(Math.random() * 4);
            switch (corner) {
                case 0: // Top-left
                    randomX = -margin - Math.random() * margin;
                    randomY = -margin - Math.random() * margin;
                    break;
                case 1: // Top-right
                    randomX = Event.app.view.width + margin + Math.random() * margin;
                    randomY = -margin - Math.random() * margin;
                    break;
                case 2: // Bottom-left
                    randomX = -margin - Math.random() * margin;
                    randomY = Event.app.view.height + margin + Math.random() * margin;
                    break;
                case 3: // Bottom-right
                    randomX = Event.app.view.width + margin + Math.random() * margin;
                    randomY = Event.app.view.height + margin + Math.random() * margin;
                    break;
            }
        }

        return [randomX, randomY];
    }

    // génère une position aléatoire off-screen et retourne les coordonnées x,y
    static posRandomInterieur() {
        let w = Event.app.view.width; 
        let h = Event.app.view.height;
        let randomX, randomY;

        randomX = Math.random() * w;
        randomY = Math.random() * h;

        return [randomX, randomY];
    }

    // ajoute une réf aux différents type de monstres
    static addMonstres(monstresInput,m2,m3,m4,m5,m6,m7,m8,m9,m10,m11,m12,m13)
    {
        Event.Monstre = monstresInput;
        Event.monstres = Event.Monstre.monstres;
        Event.MonstreNormal = m2;
        Event.MonstreRunner = m3;
        Event.MonstreTank = m4;
        Event.MonstreExp = m5;
        Event.MonstreGunner = m6;
        Event.BossNormal = m7;
        Event.BossRunner = m8;
        Event.BossTank = m9;
        Event.BossGunner = m10;
        Event.Err404 = m11;
        Event.MilkMan = m12;
        Event.BossBunny = m13;
    }
    // ajoute une réf a l'app PIXI
    static addApp(appInput) {
        Event.app = appInput;
    }
    static addMilk(milkInput, J, gun) {
        Event.milkMode = milkInput;
        Event.Joueur =  J;
        Event.gun = gun;
    }
    // ajoute un réf au joueur
    static addJoueur(joueurInput) {
        Event.joueur = joueurInput;
    }
    // ajoute un réf au musiques
    static addMusic(musicInput) {
        Event.Music = musicInput;

        Event.musicList = {
            "kim": new Event.Music("kim"),
            "space": new Event.Music("space"),
            "space2": new Event.Music("space2"),
            "space3": new Event.Music("space3"),
            "normalIntense": new Event.Music("normalIntense"),
            "difficulty": new Event.Music("difficulty"),
            "difficulty2": new Event.Music("difficulty2"),
            "boss": new Event.Music("boss"),
            "404Boss": new Event.Music("404Boss"),
            "milkMan": new Event.Music("milkMan"),
            "speed": new Event.Music("speed"),
            "gameOver": new Event.Music("gameOver"),
            "bossBunny": new Event.Music("bossBunny")
        };
        Event.currentMusic = new Event.Music("space2");
    }
}