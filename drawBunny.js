var canvas;
var gl;
var program;
var height = 0.0;
var vBuffer;
var normalBuffer;
var TRANSLATE_SPEED = 600;

//transformations
var scale;
var rotation;
var trans;
var Z_LIMIT = 6;
var Z_CHANGE = 0.5;
var xPos = 0, yPos = 0, zPos = 0;
var curX, curY, tempX, tempY;
var rx = 0, ry = 0; //rotate x and y
var signX = 0, signY = 0; //direction of rotation
var dx = 0, dy = 0; //distance moved in x and y mouse position

var vertices = get_vertices();
var faces = get_faces();
var normals = [];
var bunny = [];

//translation
{
    addEventListener("mousedown", function (event) {

        if (event.which == 1) {
            tempX = event.pageX;
            tempY = event.pageY;
        }
        else if (event.which == 3){
            tempX = event.offsetX;
            tempY = event.offsetY;
        }
    });

    addEventListener("mousemove", function (event) {
        if (event.which == 1) {
            dx = event.pageX - tempX;
            dy = tempY - event.pageY;
            xPos = dx / TRANSLATE_SPEED;
            yPos = dy / TRANSLATE_SPEED;
        }
        else if(event.which == 3){
            dx = event.offsetX - tempX;
            dy = tempY - event.offsetY;
            signX = dx > 0 ? 1 : -1;
            signY = dy < 0 ? 1 : -1;

            rx = event.offsetX * signX;
            ry = event.offsetY * signY;
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

    // Creating the buffers
    vBuffer = gl.createBuffer();
    normalBuffer = gl.createBuffer();

    getBunny();
    getNormals();
    render();
};

function render() {

    // Clearing the buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    setColor();
    transformation();
    fillBuffers();

    gl.drawArrays(gl.TRIANGLES, 0, bunny.length);
    window.requestAnimFrame(render);
}

function reset(){
    document.location.reload();
}

function setColor(){
    var c = [0.8, 0.598039, 0.196078];
    var color = gl.getUniformLocation(program, "color");
    gl.uniform3fv(color, c);
}

function getBunny(){
    //for drawing bunny
    for (var i = 0; i < faces.length; i++) {
        for (var j = 0; j < 3; j++) {
            bunny.push(vertices[faces[i][j] - 1]);
        }
    }
}

function getNormals(){
    var t1, t2;
    for (var i = 2; i < bunny.length; i = i+3) {
        t1 = subtract(bunny[i-1], bunny[i-2]);
        t2 = subtract(bunny[i], bunny[i-2]);
        for(var j = 0; j < 3; j++){
            normals.push(normalize(cross(t1, t2)));
        }
    }
}

function fillBuffers(){
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bunny), gl.STATIC_DRAW);

    var normal = gl.getAttribLocation(program, "normal");
    gl.enableVertexAttribArray(normal);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
}

function transformation(){
    scale = scalem(0.25, 0.25, 0.25);
    trans = translate(xPos, yPos, zPos);
    rotation = mult(rotate(rx, [0, 0, 1]), rotate(ry, [0, 1, 0]));

    var transform = mult(mult(scale, rotation), trans);

    var model = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(model, false, flatten(transform));
}