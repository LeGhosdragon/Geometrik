export class Music {
    static volume = 0.5; // Default volume (50%)

    constructor(nom) {
        this.nom = nom;
        this.path = this.getAudioPath(nom);
        this.audio = new Audio(this.path);
        this.duration = 0; // Initial duration is 0

        // Check if the path is valid
        if (!this.path) {
            console.error(`Audio path for '${nom}' not found.`);
            return;
        }

        // Listen for metadata to get duration
        this.audio.addEventListener("loadedmetadata", () => {
            this.duration = this.audio.duration;
        });

        // Handle loading errors
        this.audio.addEventListener("error", (e) => {
            console.error(`Error loading audio '${nom}':`, e);
        });

        // Set initial volume
        this.audio.volume = Music.volume;
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
            case "bossBunny" :
                return "../musics/NewJeans-Supernatural-Instrumental.mp3";
            case "gameOver":
                return "../musics/game-over-38511.mp3";
            default:
                return null;
        }
    }

    play() {
        if (this.audio.readyState < 3) { 
            console.warn(`Audio not fully loaded: ${this.nom}. Waiting...`);
            this.audio.addEventListener('canplaythrough', () => {
                this.audio.volume = Music.volume;
                console.log(`Now playing: ${this.nom}`);
                this.audio.play().catch(err => console.error("Play error:", err));
            }, { once: true });
        } else {
            this.audio.volume = Music.volume;
            console.log(`Playing: ${this.nom}`);
            this.audio.play().catch(err => console.error("Play error:", err));
        }
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }

    setAutoPlay(bool) {
        if (this.audio) {
            this.audio.autoplay = bool;
        }
    }

    setVolume(level) {
        if (level < 0) level = 0;
        if (level > 1) level = 1;
        this.audio.volume = level;
        Music.volume = level;
        console.log(`Volume of ${this.nom} set to: ${this.audio.volume}`);
    }
}
