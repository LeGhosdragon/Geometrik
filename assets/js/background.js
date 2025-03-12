let r = 0, g = 0, b = 0, backColor = 0x000000;

const vitesseCouleur = 0.00001; // Change this for faster/slower pulses

export function drawGridBackground(app) {
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0x00000, 0.3); // Line style: grey color, width of 1px

    // Determine the size of the grid based on the screen size and a large enough margin.
    const gridSize = 1000000; // The grid's maximum size (way beyond the player's movement range)
    const step = 40; // The step size for each grid line

    // Draw vertical lines
    for (let x = -gridSize; x < gridSize; x += step) {
        grid.moveTo(x, -gridSize);
        grid.lineTo(x, gridSize);
    }

    // Draw horizontal lines
    for (let y = -gridSize; y < gridSize; y += step) {
        grid.moveTo(-gridSize, y);
        grid.lineTo(gridSize, y);
    }

    // Add the grid to the stage
    app.stage.addChild(grid);
    return grid; // Return the grid object so it can be manipulated later
}

// The function to update the background color to pulse through the rainbow
export function updateBackgroundColor(app, mstr) {
    // Update the RGB components using sine waves to cycle through colors
    r = Math.floor((Math.sin(vitesseCouleur * app.ticker.lastTime + 0) + 1) * 128); // Sinusoidal for red
    g = Math.floor((Math.sin(vitesseCouleur * app.ticker.lastTime + Math.PI * 2 / 3) + 1) * 128); // Sinusoidal for green
    b = Math.floor((Math.sin(vitesseCouleur * app.ticker.lastTime + Math.PI * 4 / 3) + 1) * 128); // Sinusoidal for blue

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

