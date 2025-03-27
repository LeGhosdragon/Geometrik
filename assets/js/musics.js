export class Music {
    constructor(nom) {
        this.nom = nom;
        this.path = this.getAudioPath(nom);
        this.audio = new Audio(this.path);
        this.duration = 0; // Initialement 0

        // Vérifie si le chemin est valide
        if (!this.path) {
            console.error(`Audio path for '${nom}' not found.`);
            return;
        }

        // Écoute l'événement pour obtenir la durée une fois chargé
        this.audio.addEventListener("loadedmetadata", () => {
            this.duration = this.audio.duration;
            //console.log(`Duration of ${nom}: ${this.duration}s`);
        });

        // Gestion des erreurs de chargement
        this.audio.addEventListener("error", (e) => {
            console.error(`Error loading audio '${nom}':`, e);
        });
    }

    getAudioPath(nom) {
        switch (nom) {
            case "speed":
                return "../musics/fast-chiptune-instrumental-2-minute-boss-fight-254040.mp3";
            case "kim":
                return "../musics/kim-lightyear-legends-109307.mp3";
            case "space":
                return "../musics/space-station-247790.mp3";
            case "space2":
                return "../musics/neon-gaming-128925.mp3";
            case "space3":
                return "../musics/jungle-ish-beat-for-video-games-314073.mp3";
            case "normalIntense":
                return "../musics/fun-with-my-8-bit-game-301278.mp3";
            case "difficulty":
                return "../musics/level-iii-medium-294426.mp3";
            case "difficulty2":
                return "../musics/difficultyllup.mp3";
            case "boss":
                return "../musics/glitch-in-the-dark-306765.mp3";
            case "404Boss":
                return "../musics/mold-250080.mp3";
            case "milkMan":
                return "../musics/panic-182769.mp3";
            default:
                return null;
        }
    }

    play() {
        if (this.audio.readyState >= 3) { // Vérifie que l'audio est prêt
            console.log(`Playing: ${this.nom}`);
            this.audio.play().catch(err => console.error("Play error:", err));
        } else {
            console.warn(`Audio not ready yet: ${this.nom}`);
        }
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            //console.log(`Stopped: ${this.nom}`);
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
            //console.log(`Paused: ${this.nom}`);
        }
    }

    setAutoPlay(bool) {
        if (this.audio) {
            this.audio.autoplay = bool;
        }
    }
}
