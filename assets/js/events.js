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
    static monstres = null;
    static app = null;
    static joueur = null;
    static difficultyDegree = 1;
    static currentEventName = "normal";
    static currentEvent = null;
    static ennemiDifficultee = 1;
    static eventNameList = ["normal", "horde", "ambush", "fort", "guns"];
    static musicList = null;
    static currentMusic = null;
    static boss = false;
    static nextSong = false;
    static nextSongIs = null;

    constructor(type)
    {
        this.type = type;
        this.state = true; 
        this.comeBacks = true;
        this.timeElapsed = 0;
        Event.events.push(this);
    }

    // Méthode qui met à jour les événements actifs en fct du temps écoulé
    static updateEvents(delta)
    {
        //console.log(Event.events);
        Event.events.forEach(event => {   
            event.timeElapsed += 1;     
            if(event.type == " ")// Ajoute le monstre Exp et incrémente la rapidité du spawning des ennemis
            {
                event.timeElapsed%7200 == 0 ? event.ajouterMONSTRE( Math.ceil(delta), "expBall",  3 ) :0;
                event.timeElapsed%7200 == 0 ? Event.updateDifficultee() : "";
            } 
            if(event.type == "normal") // Les ennemis apparaissent a une rythmr normal sans rien de particulier
            {
                if(Event.currentMusic == null)
                {
                    Event.currentMusic = this.musicList["space3"];
                    Event.currentMusic.play();
                    Event.currentMusic.setAutoPlay(true);
                }
                if(Event.nextSongIs != "difficulty"){
                    Event.nextSong = true;
                }
                Event.nextSongIs = "difficulty";
                event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta), "normal", 2 + Event.difficultyDegree) :0;
                Event.difficultyDegree >=2 ? event.timeElapsed%Math.round(50/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta), "runner", 4 + Event.difficultyDegree) :0 : 0;
                Event.difficultyDegree >=2 ? event.timeElapsed%Math.round(30/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta), "tank",   5 + Event.difficultyDegree) :0 : 0;
                event.state = !(event.timeElapsed >= 3600) && event.state;
            }
            if(event.type == "horde") // ennemis normal circulent autour du joueur pour un bout de temps
            {
                if(Event.nextSongIs != "space2"){
                    Event.nextSong = true;
                }
                Event.nextSongIs = "space2";
                event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta), "normal", 2 + Event.difficultyDegree) :0;
                event.state = !(event.timeElapsed >= 1800) && event.state;
            }
            if(event.type == "ambush")// ennemis runner circulent autour du joueur pour un petit instant
            {
                if(Event.nextSongIs != "speed"){
                    Event.nextSong = true;
                }
                Event.nextSongIs = "speed";
                event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta), "runner", 3 + Event.difficultyDegree) :0;
                event.state = !(event.timeElapsed >= 1800) && event.state;
            }
            if(event.type == "fort") // ennemis tank  cirulent autour du joueur pour un petit instant
            {
                if(Event.nextSongIs != "difficulty2"){
                    Event.nextSong = true;
                }
                Event.nextSongIs = "difficulty2";
                event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta),  "tank",  4 + Event.difficultyDegree) :0;
                event.state = !(event.timeElapsed >= 1800) && event.state;
            }
            if(event.type == "guns") // ennemis tank  cirulent autour du joueur pour un petit instant
            {
                if(Event.nextSongIs != "normalIntense"){
                    Event.nextSong = true;
                }
                Event.nextSongIs = "normalIntense";
                event.timeElapsed%Math.round(40/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.ceil(delta),  "gunner",  4 + Event.difficultyDegree) :0;
                event.state = !(event.timeElapsed >= 1800) && event.state;
            }
            if(event.type == "boss")// milkMan?
            {
                
            } 
            if (!event.state) {
                let index = Event.events.indexOf(event);
                if (index > -1) {
                    Event.events.splice(index, 1);
                }
                Event.ennemiDifficultee *= 1.1;
                Event.currentEvent = new Event(Event.getNewEvent());
            }
            
        });
    }

    // Méthode sélectionne un nouveau event aléatoire et met à jour
    // la propriété du current Event
    static getNewEvent()
    {
        let name = Event.eventNameList[Math.floor(Math.random() * Event.eventNameList.length)];
        console.log(name + " : new event");
        Event.currentEventName = name;
        return name;
    }

    static updateMusic() {
        if (Event.currentMusic != null) {
            if (Event.currentMusic.audio.currentTime >= (Event.currentMusic.audio.duration) || Event.boss || Event.nextSong) {
                // Arrête la musique actuelle
                Event.currentMusic.stop();
                

                if (false) { return; } // DEBUG; MUTER LA MUSIQUE POUR LE DÉVELOPPEMENT.


                // Change pour la nouvelle musique
                if(!Event.boss && !Event.nextSong)
                {
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
                }
                else if(Event.nextSong)
                {
                    Event.currentMusic = Event.musicList[Event.nextSongIs];
                    Event.nextSong = false;
                }
                if (Event.currentMusic) {
                    
                    Event.currentMusic.play();
                    console.log("Switched to " + Event.currentMusic.nom);
                } else {
                    console.warn("Music "+ Event.currentMusic.nom +" not found.");
                }

            }
        }
    }
    


    static updateDifficultee()
    {
        Event.difficultyDegree = Event.difficultyDegree < 10 ? Event.difficultyDegree + 1 : Event.difficultyDegree;
    }

    // Méthode qui ajoute un certain nb de monstres avec le nb de coôtés donné
    ajouterMONSTRE(amount = 1, type = "normal", sides = 3) { 



        // si le nb de monstres actifs est inf a la limite -> ajouter
        if((Event.Monstre.cleanMonstres.length < 10 || !this.comeBacks) && Event.monstres.length < 100 * Event.difficultyDegree)
        {
            //console.log(amount);
            for (let i = 0; i < amount; i++) {
                //console.oglog("2");
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
            //console.log("4");
            this.placeOldOnes();
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

    // ajoute une réf aux différents type de monstres
    static addMonstres(monstresInput,m2,m3,m4,m5,m6)
    {
        Event.Monstre = monstresInput;
        Event.monstres = Event.Monstre.monstres;
        Event.MonstreNormal = m2;
        Event.MonstreRunner = m3;
        Event.MonstreTank = m4;
        Event.MonstreExp = m5;
        Event.MonstreGunner = m6;
    }
    // ajoute une réf a l'app PIXI
    static addApp(appInput) {
        Event.app = appInput;
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
            "speed": new Event.Music("speed")
        };
    }
}