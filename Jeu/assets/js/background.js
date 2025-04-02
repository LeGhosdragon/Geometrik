/**
 * Bakcground.js gère l'affichage du fond de la scène dans une
 * application utilisant PIXI.js.
 */
let r = 0, g = 0, b = 0;

let vitesseCouleur = 0.00001;

export class Grid {

    static grid = this.drawGridBackground(1);

    static drawGridBackground(gridThickness, app = null) {
        const grid = new PIXI.Graphics();
        const gridSize = 1000000;
        const step = 100;
        


        if (app != null) {
            if (app.space && gridThickness != 100) {
                grid.lineStyle(gridThickness*1.5, 0xFFFFFF, 1);
            } else if (gridThickness == 100 && app.space) {
                grid.lineStyle(gridThickness, 0x000000, 1);
            } else {
                grid.lineStyle(gridThickness, 0x000000, 0.5);
            }
            

            const gradientTexture = Grid.createSmoothGradientTexture();
            app.gradientLine = new PIXI.TilingSprite(gradientTexture, gridSize * 2, gridSize * 2);
            app.gradientLine.position.set(-gridSize, -gridSize);

            for (let i = -gridSize; i < gridSize; i += step) {
                grid.moveTo(i, -gridSize);
                grid.lineTo(i, gridSize);
            }

            for (let j = -gridSize; j < gridSize; j += step) {
                grid.moveTo(-gridSize, j);
                grid.lineTo(gridSize, j);
            }


            if (app != null && app.space) {
                app.gradientLine.mask = grid;
                app.stage.addChild(app.gradientLine);
            }

            grid.position.set(900, 400);
            if (gridThickness == 100 && app.space) {
                app.gradientLine.visible = false;
            }
        }
        return grid;
    }
    static createSmoothGradientTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
    
        // Create a radial gradient
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,  // Starting circle: center of canvas, radius 0
            canvas.width / 2, canvas.height / 2, canvas.width / 2 // Ending circle: center of canvas, radius to the edge
        );
    
        // Add smooth color stops
        //gradient.addColorStop(0, '#4a0099');  // Dark purple at the center
        gradient.addColorStop(0.3, '#0099ff'); // Light blue
        gradient.addColorStop(0.7, '#4a0099'); // Dark purple again
        gradient.addColorStop(1, '#99005e');  // Deep pink at the edges
        //gradient.addColorStop(1, '#0099ff'); // Light blue
    
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        return PIXI.Texture.from(canvas);
    }
    

    static getDynamicColor() {
        r = (Math.sin(Date.now() * vitesseCouleur) + 1) * 127.5;
        g = (Math.sin(Date.now() * vitesseCouleur + 2) + 1) * 127.5;
        b = (Math.sin(Date.now() * vitesseCouleur + 4) + 1) * 127.5;
        return (r << 16) + (g << 8) + b;
    }

    static pauseGrid(app) {
        Grid.grid.clear();
        app.stage.removeChild(Grid.grid);
        Grid.grid = Grid.drawGridBackground(!app.pause ? 100 : 1, app);
        app.stage.addChild(Grid.grid);
    }
}


// La fonction pour mettre a jour la couleur de fond pour pulser a travers l'arc-en-ciel
export function updateBackgroundColor(app, mstr) {
    if(app.pause)
    {
       vitesseCouleur = 0.001;
    }
    else
    {
        vitesseCouleur = 0.00001;
    }
        r = Math.floor((Math.sin(vitesseCouleur * app.ticker.lastTime + 0) + 1) * 128); 
        g = Math.floor((Math.sin(vitesseCouleur * app.ticker.lastTime + Math.PI * 2 / 3) + 1) * 128);
        b = Math.floor((Math.sin(vitesseCouleur * app.ticker.lastTime + Math.PI * 4 / 3) + 1) * 128); 
    if(mstr.dedMilkMan)
    {
        r = 255;
        g = 255;
        b = 255;
    }
    if(app.space)
    {
        r = 0;
        g = 0;
        b = 0;
    }
  
    // Recombiner les compoosantes du RBG dams un code hex
    app.backColor = (r << 16) | (g << 8) | b;

    // Application de la nouvelle couleur sur le renderer
    app.renderer.backgroundColor = app.backColor;

    // Obtenir les composantes RGB du backcolor
    let { r: bgR, g: bgG, b: bgB } = hexToRgb(app.backColor);
    if(mstr.dedMilkMan)
    {
        bgR = 0;
        bgG = 0;
        bgB = 0;
    }
    if(app.space)
    {
        bgR = 0;
        bgG = 0;
        bgB = 0;
    }


    // Obtenir la couleur de contraste
    const { r: contrastR, g: contrastG, b: contrastB } = getContrastingColor(bgR, bgG, bgB);
    return (contrastR << 16) | (contrastG << 8) | contrastB;

}



// Fonction pour obtenir la couleur de contraste (complémentaire)
function getContrastingColor(r, g, b) {
    // Simplement inverser des valeurs RBG pour avoir une coleur contraste 
    const contrastR = 255 - r;
    const contrastG = 255 - g;
    const contrastB = 255 - b;

    // Retourner la couleur RGB pour la couleur contraste
    return { r: contrastR, g: contrastG, b: contrastB };
}
// Fonction pour extraire le RGB d'un code couleur hex
function hexToRgb(hex) {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return { r, g, b };
}



/**
 * Classe utilisée pour créer, positionner, faire tourner et mettre a jour 
 * des formes 3D pour enrichir le fond de la scène.
 */
export class Shape3D {
    static onStart = true;
    constructor(app, vertices, edges, x, y, z, boss = false) {
        this.app = app;
        this.vertices = vertices;
        this.boss = false;
        this.edges = edges;
        this.angleX = Math.random() * Math.PI * 2;
        this.angleY = Math.random() * Math.PI * 2;
        this.angleZ = Math.random() * Math.PI * 2;
        this.speedX = (Math.random() - 0.2) * 0.002;
        this.speedY = (Math.random() - 0.2) * 0.002;
        this.speedZ = (Math.random() - 0.2) * 0.002;
        this.color = 0xFFFFFF;
        let num = Math.ceil(Math.random() * 3);
        switch (num) {
            case 1:
                !boss ? this.color = '0x0099ff' : this.color = '0xFF0000';
                break;
            case 2:
                !boss ? this.color = '0x4a0099' : this.color = '0x000000';
                
                break;
            case 3:
                !boss ? this.color = '0x99005e' : this.color = '0xFFFFFF';
                
                break;
            default:
                break;
        }
        this.position = { x, y, z }; // Position qui peut être updated
        this.graphics = new PIXI.Graphics();
        this.app.stage.addChild(this.graphics);
    }

    static shapes = [];
    static minDistance = 300;
    static maxAttempts = 1; 
    static maxDistanceFromPlayer = 1500; // Max distance from the player to keep the shape

    // Méthode qui projette un point 3D sur un plan 2D et retourne les coordonnées 
    project3D(point3D) {
        const distance = 400;
        const scale = distance / Math.max(distance + point3D.z, 1);
        const x = point3D.x * scale + this.app.view.width / 2;
        const y = point3D.y * scale + this.app.view.height / 2;
        return { x, y };
    }

    rotate(point) {
        let { x, y, z } = point;

        // Rotation autour de l'axe X
        let y1 = y * Math.cos(this.angleX) - z * Math.sin(this.angleX);
        let z1 = y * Math.sin(this.angleX) + z * Math.cos(this.angleX);

        // Rotation autour de l'axe Y
        let x2 = x * Math.cos(this.angleY) + z1 * Math.sin(this.angleY);
        let z2 = -x * Math.sin(this.angleY) + z1 * Math.cos(this.angleY);

        // Rotation autour de l'axe Z
        let x3 = x2 * Math.cos(this.angleZ) - y1 * Math.sin(this.angleZ);
        let y3 = x2 * Math.sin(this.angleZ) + y1 * Math.cos(this.angleZ);

        return { x: x3, y: y3, z: z2 };
    }

    // 1. Dessiner les formes 3D 
    // 2. Mettre à jour les angles de rotation
    // 3. Trace les arrêtes entre les sommets projetés
    draw(Monstre) {
        this.graphics.clear();

        if(!this.boss) {this.graphics.lineStyle(this.position.z * 1.3, this.app.space || Monstre.dedMilkMan ? this.color : this.app.ennemiColor, 1);}
        else{this.graphics.lineStyle(this.position.z * 2, this.app.space || Monstre.dedMilkMan ? this.color : this.app.ennemiColor, 1);}

        let projected = [];

        for (let v of this.vertices) {
            let rotated = this.rotate(v);
            let projectedPoint = this.project3D(rotated);
            projected.push(projectedPoint);
        }

        // Draw edges
        for (let [i, j] of this.edges) {
            this.graphics.moveTo(projected[i].x + this.position.x, projected[i].y + this.position.y);
            this.graphics.lineTo(projected[j].x + this.position.x, projected[j].y + this.position.y);
        }

        this.angleX += this.speedX;
        this.angleY += this.speedY;
        this.angleZ += this.speedZ;
    }

    // Mettre à jour la position en ajoutant des offsets    
    updatePosition(dx, dy, bossPos = 0) {

        if(!this.boss || !bossPos)
        {
            this.position.x += dx * this.position.z;
            this.position.y += dy * this.position.z;
        }
        else if(bossPos.getX() != null && bossPos.getY() != null){
            this.position.x = bossPos.getX()  - this.app.view.width / 2;
            this.position.y = bossPos.getY()  - this.app.view.height / 2;
        }
        if(!this.boss)
        {
        // Check if the shape is too far from the player, and remove it if so
        const distance = Shape3D.distanceBetweenPoints(0, 0, this.position.x , this.position.y);
        if (distance > Shape3D.maxDistanceFromPlayer) {
            Shape3D.shapes = Shape3D.shapes.filter(shape => shape !== this.graphics);
            this.app.stage.removeChild(this.graphics);
            let index = Shape3D.shapes.indexOf(this);
            if (index !== -1) {
                Shape3D.shapes.splice(index, 1);
            }
        }}
    }

    // Function to calculate distance between two points
    static distanceBetweenPoints(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
    }

    // Fonction pour vérifier si une nouvelle position est trop proche d'une forme existante
    static isTooCloseToExistingShapes(newPos, shapes, minDistance) {
        for (let shape of shapes) {
            const dist = Shape3D.distanceBetweenPoints(newPos.x, newPos.y, shape.position.x, shape.position.y);
            if (dist < minDistance) {
                return true;
            }
        }
        return false;
    }

    // Fonction pour générer des formes sans overlap
    static spawnShapes(Event, app) {
        for (let i = 0; i < 10; i++) {
            const size = Math.random() * 250 + 50;
            let shapeType = Math.floor(Math.random() * 4);
            let vertices, edges;
            switch (shapeType) {
                case 0:
                    ({ vertices, edges } = Shape3D.createCube(size));
                    break;
                case 1:
                    ({ vertices, edges } = Shape3D.createPyramid(size));
                    break;
                case 2:
                    ({ vertices, edges } = Shape3D.createTetrahedron(size));
                    break;
                case 3:
                    ({ vertices, edges } = Shape3D.createOctahedron(size));
                    break;
            }

            let x, y, z;
            let attempts = 0;
            let validPosition = false;
            while (!validPosition && (attempts < Shape3D.maxAttempts || Shape3D.onStart)) {
                [x, y] = Event.posRandomExterieur();
                if(Shape3D.onStart)
                {
                    [x, y] = Event.posRandomInterieur();
                }
                z = Math.random();
                x -= app.view.width / 2;
                y -= app.view.height / 2;
                // Vérifie si la nouvelle position est trop proche d'une forme existante
                if (!Shape3D.isTooCloseToExistingShapes({ x, y, z }, Shape3D.shapes, Shape3D.minDistance)) {
                    validPosition = true;
                } else {
                    // Déplace la forme plus loin avec un facteur aléatoire si la position est invalide
                    let moveFactor = 1 + Math.random() * 2; // Facteur de déplacement entre 1x et 3x
                    x += (Math.random() > 0.5 ? 1 : -1) * moveFactor * Shape3D.minDistance;
                    y += (Math.random() > 0.5 ? 1 : -1) * moveFactor * Shape3D.minDistance;
                    z += (Math.random() > 0.5 ? 1 : -1) * moveFactor * Shape3D.minDistance;
                    attempts++;
                }
            }
            if (validPosition) {
                Shape3D.shapes.push(new Shape3D(app, vertices, edges, x, y, z));
            } else {
                //console.warn("Could not find a valid position after " + Shape3D.maxAttempts + " attempts.");
            }
        }
        Shape3D.onStart = false;
    }
    

    static createCube(size) {
        const d = size / 2;
        const vertices = [
            { x: -d, y: -d, z: -d },
            { x: d, y: -d, z: -d },
            { x: d, y: d, z: -d },
            { x: -d, y: d, z: -d },
            { x: -d, y: -d, z: d },
            { x: d, y: -d, z: d },
            { x: d, y: d, z: d },
            { x: -d, y: d, z: d },
        ];

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        return { vertices, edges };
    }


    static createPyramid(size) {
        const d = size / 2;
        const vertices = [
            { x: 0, y: d, z: 0 },
            { x: -d, y: -d, z: -d },
            { x: d, y: -d, z: -d },
            { x: d, y: -d, z: d },
            { x: -d, y: -d, z: d }
        ];

        const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [1, 2], [2, 3], [3, 4], [4, 1]
        ];

        return { vertices, edges };
    }

    static createTetrahedron(size) {
        const d = size / 2;
        const vertices = [
            { x: 0, y: d, z: 0 },
            { x: -d, y: -d, z: d },
            { x: d, y: -d, z: d },
            { x: 0, y: -d, z: -d }
        ];

        const edges = [
            [0, 1], [0, 2], [0, 3],
            [1, 2], [1, 3], [2, 3]
        ];

        return { vertices, edges };
    }

    static createOctahedron(size) {
        const d = size / 2;
        const vertices = [
            { x: 0, y: d, z: 0 },
            { x: 0, y: -d, z: 0 },
            { x: d, y: 0, z: 0 },
            { x: -d, y: 0, z: 0 },
            { x: 0, y: 0, z: d },
            { x: 0, y: 0, z: -d }
        ];

        const edges = [
            [0, 2], [0, 3], [0, 4], [0, 5],
            [1, 2], [1, 3], [1, 4], [1, 5],
            [2, 4], [2, 5], [3, 4], [3, 5]
        ];

        return { vertices, edges };
    }
}
