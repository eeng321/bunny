var canvas;
var gl;
var program;
var height = 0.0;
var vBuffer;
var normalBuffer;
var TRANSLATE_SPEED = 800;

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

var POINT_LIGHT = [5,5,0];
var SPOT_LIGHT = [0,4,2];

//translation
{
    addEventListener("mousedown", function (event) {

        if (event.which == 1 || event.which == 3) {
            tempX = event.pageX;
            tempY = event.pageY;
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
            dx = event.pageX - tempX;
            dy = tempY - event.pageY;
            signX = dx > 0 ? 1 : -1;
            signY = dy < 0 ? 1 : -1;

            rx = dx * signX;
            ry = dy * signY;
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
    gl.clearColor(0.3, 0.3, 0.3, 1);

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
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    setColor();
    setLight();
    setView();
    transformation();
    fillBuffers();

    gl.drawArrays(gl.TRIANGLES, 0, bunny.length);
    window.requestAnimFrame(render);
}

function reset(){
    document.location.reload();
}

function setColor(){
    var c = [0.8, 0.498039, 0.196078];
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

function setLight(){

    var pointLightLocation = gl.getUniformLocation(program, "pointLightPosition");
    //var lightPos = rotate(1,[0,0,1]);
    //lightPos = vec3(lightPos) * POINT_LIGHT;
    gl.uniform3fv(pointLightLocation, vec3(POINT_LIGHT));

    var spotLightLocation = gl.getUniformLocation(program, "spotLightPosition");
    gl.uniform3fv(spotLightLocation, vec3(SPOT_LIGHT));

    var innerLimitLocation = gl.getUniformLocation(program, "innerLimit");
    var innerLimit = degreeToRad(10);
    gl.uniform1f(innerLimitLocation, Math.cos(innerLimit));

    var outerLimitLocation = gl.getUniformLocation(program, "outerLimit");
    var outerLimit = degreeToRad(20);
    gl.uniform1f(outerLimitLocation, Math.cos(outerLimit));

    var lightDirectionLocation = gl.getUniformLocation(program, "lightDirection");
    gl.uniform3fv(lightDirectionLocation, [-1,0,0]);

    var lightLocation = gl.getUniformLocation(program, "light");
    gl.uniform3fv(lightLocation, vec3(-0.5,0,2));
}

function degreeToRad(d){
    return d * Math.PI / 180;
}

function setView(){

    // default origin view 
    var camera =  [1,1,1];

    var viewPosition = gl.getUniformLocation(program, "view");
    gl.uniform3fv(viewPosition, camera);
}

function transformation(){
    scale = scalem(0.35, 0.35, 0.35);
    trans = translate(xPos, yPos, zPos);
    rotation = mult(rotate(rx, [0, 1, 0]), rotate(ry, [1, 0, 0]));

    var transform = mult(mult(scale, rotation), trans);

    var model = gl.getUniformLocation(program, "model");
    gl.uniformMatrix4fv(model, false, flatten(transform));
}