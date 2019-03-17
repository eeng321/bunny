var canvas;
var gl;
var program;
var height = 0.0;
var vBuffer;
var VERTEX_SIZE = 3;


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Creating the vertex buffer
    vBuffer = gl.createBuffer();
    // Binding the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    
    
    render();
};

function render() {
    // Associate our shader variables with our data buffer
    
    var model = gl.getUniformLocation(program, "model");

    var vertices = get_vertices();
    var faces = get_faces();
    var bunny = [];

    for (var i = 0; i < faces.length; i++) {
        for (var j = 0; j < VERTEX_SIZE; j++) {
            bunny.push(vertices[faces[i][j] - 1]);
        }
    }
    
    model = scalem(0.5,0.5,0.5);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(bunny), gl.DYNAMIC_DRAW);
    
    // Clearing the buffer and drawing the bunny
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    
    gl.drawArrays(gl.TRIANGLES, 0, bunny.length);
    window.requestAnimFrame(render);
}
