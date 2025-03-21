export class Event{
    static events = [];
    static Monstre = null;
    static MonstreNormal = null;
    static MonstreRunner = null;
    static MonstreTank = null;
    static MonstreExp = null;
    static monstres = null;
    static app = null;
    static joueur = null;
    static difficultyDegree = 1;


    constructor(type)
    {
        this.type = type;
        this.state = true; 
        this.comeBacks = true;
        this.timeElapsed = 0;
        Event.events.push(this);
    }

    static updateEvents(delta)
    {

        Event.events.forEach(event => {   
            event.timeElapsed += 1;      
            if(event.type == "normal") // ennemies are spawning at a regular interval without anything special
            {
                event.timeElapsed%Math.round(60/Event.difficultyDegree)   == 0 ? event.ajouterMONSTRE( Math.round(delta), "normal",   3 + Event.difficultyDegree) :0;
                event.timeElapsed%Math.round(50/Event.difficultyDegree)   == 0 ? event.ajouterMONSTRE( Math.round(delta), "runner",   5 + Event.difficultyDegree) :0;
                event.timeElapsed%Math.round(30/Event.difficultyDegree)   == 0 ? event.ajouterMONSTRE( Math.round(delta), "tank",     6 + Event.difficultyDegree) :0;
                event.state = !(event.timeElapsed >= 3600);
            }
            if(event.type == "ambush") // runner ennemies start circling the player for short while
            {
                event.timeElapsed%Math.round(20/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.round(delta), "runner", 5 + Event.difficultyDegree ) :0;
                event.state = !(event.timeElapsed >= 1800);
            }
            if(event.type == "fort")// ennemies of a same type appear in a direction and move past the player, ie they move in a straight line
            {
                event.timeElapsed%Math.round(20/Event.difficultyDegree) == 0 ? event.ajouterMONSTRE( Math.round(delta), "tank", 5+ Event.difficultyDegree ) :0;
                event.state = !(event.timeElapsed >= 1800);
            }
            if(event.type == " ")// ennemies start circling the player for short while
            {
                event.timeElapsed%3600 == 0 ? event.ajouterMONSTRE( Math.round(delta), "expBall",  3 ) :0;
                event.timeElapsed%7200 == 0 ? Event.updateDifficultee() : "";
            }
            if(event.type == "")// ennemies start circling the player for short while
            {

            }
            if(event.type == "boss")// milkMan?
            {
                
            } 
            if (!event.state) {
                let index = Event.events.indexOf(event);
                if (index > -1) {
                    Event.events.splice(index, 1);
                }
            }
            
        });
    }


    static updateDifficultee()
    {
        Event.difficultyDegree = Event.difficultyDegree < 10 ? Event.difficultyDegree + 1 : Event.difficultyDegree;
    }


    ajouterMONSTRE(amount = 1, type = "normal", sides = 3) {  
        
        if((Event.Monstre.cleanMonstres.length < 10 || !this.comeBacks) && Event.monstres.length < 100 * Event.difficultyDegree)
        {
            for (let i = 0; i < amount; i++) {

                let rngPos = this.posRandomExterieur();

                let monstre;
                if(type == "normal") { 
                    monstre = new Event.MonstreNormal( rngPos[0], rngPos[1], sides);}            
                else if(type == "runner") {
                    monstre = new Event.MonstreRunner( rngPos[0], rngPos[1], sides);}
                else if(type == "tank") {
                    monstre = new Event.MonstreTank( rngPos[0], rngPos[1], sides);}
                else if(type == "expBall") {
                    monstre = new Event.MonstreExp( rngPos[0], rngPos[1], sides);}
                Event.app.stage.addChild(monstre.body);
                Event.monstres.push(monstre);
            }
        }
        else{
            this.placeOldOnes();
        }

    }


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
            let rngPos = this.posRandomExterieur();

            monstre.setX(rngPos[0]);
            monstre.setY(rngPos[1]);
        });
    }


    posRandomExterieur() {
        let margin = Math.min(Event.app.view.width, Event.app.view.height) * 0.1; // Thin area around the screen
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

    static addMonstres(monstresInput,m2,m3,m4,m5)
    {
        Event.Monstre = monstresInput;
        Event.monstres = Event.Monstre.monstres;
        Event.MonstreNormal = m2;
        Event.MonstreRunner = m3;
        Event.MonstreTank = m4;
        Event.MonstreExp = m5;
    }
    static addApp(appInput) {
        Event.app = appInput;
    }
    static addJoueur(joueurInput) {
        Event.joueur = joueurInput;
    }
}