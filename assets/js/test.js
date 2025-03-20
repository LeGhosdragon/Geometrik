
//Aliases
const Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.Loader.shared,
    resources = PIXI.Loader.shared.resources,
    Graphics = PIXI.Graphics,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle;

//Create a Pixi Application
const app = new Application({ 
    width: 600, 
    height: 600,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

loader.add("../pages/bruh.html").load(setup);

//Define any variables that are used in more than one function
let cat, box, message, state;

function setup() {

    //Create the box
    /*box = new Graphics();
    box.beginFill(0x2222FF);
    box.drawRect(0, 0, 164, 164);
    box.endFill();
    box.x = 10;
    box.y = 96;
    app.stage.addChild(box);*/

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xff0000); // Set fill color (red)
    const size = 30;
    const points = 5;
    graphics.drawStar(200, 200, points, size, size*0.6, 3.1415); // Draw a star
    graphics.endFill();
    app.stage.addChild(graphics);
    graphics.pivot.set(0, 0);

    // Create a Graphics object
    const polygon = new PIXI.Graphics().drawRegularPolygon(50, 50, 50, 6, 0);

    // Add the polygon to the stage
    app.stage.addChild(polygon);



    /*

PIXI.Graphics	
drawRegularPolygon(this: PIXI.Graphics, x: number, y: number, radius: number, sides: number, rotation: number)
Draw a regular polygon where all sides are the same length.

    */

}


