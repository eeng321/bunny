var canvas;
var gl;
var program;
var height = 0.0;
var vBuffer;
var mBuffer;
var VERTEX_SIZE = 3;
var TRANSLATE_SPEED = 800;

//transformations
var scale;
var rotation;
var trans;
var Z_LIMIT = 6;
var Z_CHANGE = 0.5;
var xPos = 0, yPos = 0, zPos = 0;
var curX, curY, tempX, tempY;

//translation
{
    addEventListener("mousedown", function (event) {

        if (event.which == 1) {
            tempX = event.pageX;
            tempY = event.pageY;
        }
    });

    addEventListener("mousemove", function (event) {
        if (event.which == 1) {
            curX = event.pageX;
            curY = event.pageY;
            xPos = (curX - tempX) / TRANSLATE_SPEED;
            yPos = (tempY - curY) / TRANSLATE_SPEED;
        }
    });


    addEventListener("wheel", function (event) {

        if (event.deltaY < 0 && zPos < Z_LIMIT) {
            zPos += Z_CHANGE;
        }
        if (event.deltaY > 0 && zPos > -Z_LIMIT) {
            zPos -= Z_CHANGE;
        }
    });
}

addEventListener("keydown", function (event){
    switch (event.key){
        case 'r':
            reset();
            break;
    }
});

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

    var vertices = get_vertices();
    var faces = get_faces();
    var bunny = [];

    for (var i = 0; i < faces.length; i++) {
        for (var j = 0; j < VERTEX_SIZE; j++) {
            bunny.push(vertices[faces[i][j] - 1]);
        }
    }

    var model = gl.getUniformLocation(program, "model");

    scale = scalem(0.25, 0.25, 0.25);
    trans = translate(xPos, yPos, zPos);
    rotation = rotate(0, [0, 0, 1]);
    var transform = mult(mult(scale, rotation), trans);

    gl.uniformMatrix4fv(model, false, flatten(transform));
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bunny), gl.STATIC_DRAW);

    // Clearing the buffer and drawing the bunny
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);


    gl.drawArrays(gl.TRIANGLES, 0, bunny.length);
    window.requestAnimFrame(render);
}

function reset(){
    document.location.reload();
}
