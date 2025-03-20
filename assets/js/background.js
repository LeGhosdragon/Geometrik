let r = 0, g = 0, b = 0, backColor = 0x000000;

let vitesseCouleur = 0.00001;

export class Grid{

static grid = this.drawGridBackground(0.5);

 static drawGridBackground(gridThickness) {
    const grid = new PIXI.Graphics();
    grid.lineStyle(gridThickness, getContrastingColor(hexToRgb(backColor)), 0.5);
    const gridSize = 1000000;
    const step = 100; 
    for (let i = - gridSize; i < gridSize; i += step) {
        grid.moveTo(i, -gridSize);
        grid.lineTo(i, gridSize);
    }

    for (let j = - gridSize; j < gridSize; j += step) {
        grid.moveTo(-gridSize, j);
        grid.lineTo(gridSize, j);
    }

    grid.position.set(900, 400);
    return grid; 
}

static pauseGrid(app)
{
    Grid.grid.clear();
    app.stage.removeChild(Grid.grid);
    Grid.grid = Grid.drawGridBackground(!app.pause ? 100 : 0.5);
    app.stage.addChild(Grid.grid);
}

}


// The function to update the background color to pulse through the rainbow
export function updateBackgroundColor(app, mstr, grid) {
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
  
    // Recombine the RGB components into a hex color code
    backColor = (r << 16) | (g << 8) | b;

    // Apply the new background color to the renderer
    app.renderer.backgroundColor = backColor;

    // Get the RGB components from the backColor
    let { r: bgR, g: bgG, b: bgB } = hexToRgb(backColor);
    if(mstr.dedMilkMan)
    {
        bgR = 0;
        bgG = 0;
        bgB = 0;
    }


    // Get the contrasting color
    const { r: contrastR, g: contrastG, b: contrastB } = getContrastingColor(bgR, bgG, bgB);
    return (contrastR << 16) | (contrastG << 8) | contrastB;
}
// Function to get the contrasting (complementary) color
function getContrastingColor(r, g, b) {
    // Simply invert the RGB values for a contrasting color
    const contrastR = 255 - r;
    const contrastG = 255 - g;
    const contrastB = 255 - b;

    // Return the RGB color for the contrasting color
    return { r: contrastR, g: contrastG, b: contrastB };
}
// Function to extract RGB from a hex color code
function hexToRgb(hex) {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return { r, g, b };
}