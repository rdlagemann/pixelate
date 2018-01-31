"use strict";

(function(){
  let filename = "pixelateTest.png";
  let canvas = document.getElementById('c');

  const config = {
    image: '',
    pixelRatio: document.getElementById('pixelRatio'),
    pixelHeight: document.getElementById('pixelHeight'),
    pixelWidth: document.getElementById('pixelWidth')
  }

  // load default
  let stormtroopers = new Image();
  stormtroopers.src = 'stormtroopers.jpg';
  console.log(stormtroopers);
  stormtroopers.onload = function() {
    config.image = stormtroopers;
    render(config);
  }
  
  
  // FILE OPEN AND SAVE CONFIG AREA
  document.getElementById('fileInput').addEventListener('change', function() {
    readURL(this, config);
    
  });

  document.getElementById('saveLink').addEventListener('click', function() {
    this.download = filename;
  });

  // PIXEL CONFIG AREA
  document.getElementById('propBox').addEventListener('change', function(){
    document.getElementById('proportionalConfig').classList.toggle('disabled');
    document.getElementById('pixelSizeConfig').classList.toggle('disabled');
  });

  document.getElementById('pixelRatio').addEventListener('change', function(){
    config.pixelHeight.value = config.pixelWidth.value = config.pixelRatio.value = parseFloat(Math.abs(this.value));
    render(config);
  });

  document.getElementById('pixelHeight').addEventListener('change', function() {
    config.pixelHeight.value = parseFloat(Math.abs(this.value));
    render(config);

  });

  document.getElementById('pixelWidth').addEventListener('change', function() {  
    config.pixelWidth.value = parseFloat(Math.abs(this.value));
    render(config);

  });

})()

function readURL(input, config) {
  if (input.files && input.files[0]) {
      var reader = new FileReader();
      var imageFile;

      reader.addEventListener('load', function(e) {
        imageFile = prepareImageForRender(e.target.result);
        config.image = imageFile; // set global current working image
        document.getElementById('c').width = imageFile.width;

        imageFile.onload = function() {
          render(config);
        }       
      })

      reader.readAsDataURL(input.files[0]);
  }
}

function prepareImageForRender(img) {
  var image = new Image();
  image.crossOrigin='Access-Control-Allow-Origin';
  image.src = img;
  return image;
}



function render(config) {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("c");
  var gl = canvas.getContext("webgl");
  var image = config.image;
  canvas.width = image.width;
  canvas.height = image.height;
  // important to be able to call toDataUrl() and save the image
  gl.getContextAttributes().preserveDrawingBuffer = true;

  if (!gl) {
    return;
  }
 
  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, image.width, image.height);

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
  ]), gl.STATIC_DRAW);

  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  var pixel_h = gl.getUniformLocation(program, "pixel_h");
  var pixel_w = gl.getUniformLocation(program, "pixel_w");

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset)

  // Turn on the teccord attribute
  gl.enableVertexAttribArray(texcoordLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset)

  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  // set the size of the image
  gl.uniform2f(textureSizeLocation, image.width, image.height);

   // set the size of pixel
   gl.uniform1f(pixel_w, config.pixelWidth.value);
   gl.uniform1f(pixel_h, config.pixelHeight.value);
   

  // Draw the rectangle.
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
  

  setDownloadLink('saveLink', canvas.toDataURL('image/png'));
  
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

function setDownloadLink(linkId, image, filename) {
  let link = document.getElementById(linkId);
  link.href = image;
  link.donwload = filename;
}
