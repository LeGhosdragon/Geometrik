//import { Sprite } from 'pixi.js';

export function addMonstre(app)
{


    const geometry = new Geometry({
        attributes: {
            aPosition: [-100, -50, 100, -50, 0, 100],
        },
    });

    // Webgl vertex and fragment shader source
    const gl = { vertex, fragment };

    // WebGPU vertex and fragment shader source
    // Here vertex and fragment shader sources are inferred from the same WGSL source
    const gpu = {
        vertex: {
            entryPoint: 'main',
            source,
        },
        fragment: {
            entryPoint: 'main',
            source,
        },
    };

    const shader = Shader.from({
        gl,
        gpu,
    });

    const triangle = new Mesh({
        geometry,
        shader,
    });

    triangle.position.set(400, 300);

    app.stage.addChild(triangle);
}
