'use strict';

(function () {
  var config = {
    canvas: document.getElementById('pixelateCanvas'),
    image: new Image(),
    fitCanvas: true,
    uniforms: {
      pixel_h: document.getElementById('pixelWidth').value,
      pixel_w: document.getElementById('pixelHeight').value
    }
  };

  var screenWidth = window.innerWidth 
  || document.documentElement.clientWidth
  || document.body.clientWidth;

  config.image = prepareImageForRender('assets/stormtroopers.jpg');
  config.image.name = 'sample.jpg';
  config.image.onload = function () {
    pixelate(config);
  };

  // FILE OPEN AND SAVE CONFIG AREA
  document.getElementById('fileInput').addEventListener('change', function() {
    readURL(this, config); 
    setDownloadLink();    
  });

  // PIXEL CONFIG AREA
  document.getElementById('propBox').addEventListener('change', function(){
    document.getElementById('proportionalConfig').classList.toggle('disabled');
    document.getElementById('pixelSizeConfig').classList.toggle('disabled');
  });

  document.getElementById('pixelRatio').addEventListener('change', function(){
    config.uniforms.pixel_h = config.uniforms.pixel_w = pixelRatio.value = parseFloat(Math.abs(this.value));
    pixelate(config);    
  });

  document.getElementById('pixelHeight').addEventListener('change', function() {
    config.uniforms.pixel_h = parseFloat(Math.abs(this.value));
    pixelate(config);
    
  });

  document.getElementById('pixelWidth').addEventListener('change', function() {  
    config.uniforms.pixel_w = parseFloat(Math.abs(this.value));
    pixelate(config);
  });

  // FUNCTIONS DEFINITIONS
  function pixelate(config) {
    shaderfy.render('pixelation', config);
    setDownloadLink();
  }
  
  function setDownloadLink() {
    var saveLink = document.getElementById('saveLink');
    saveLink.href = config.canvas.toDataURL('image/png');
    saveLink.download = 'px_' + config.image.name;
  }
  
  function readURL(input, config) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        var imageFile;
  
        reader.addEventListener('load', function(e) {
          imageFile = prepareImageForRender(e.target.result);
          config.image = imageFile;
          config.image.name = input.files[0].name;
          config.canvas.width = imageFile.width;          
  
          imageFile.onload = function() {
            if(imageFile.width > screenWidth) {
              imageFile.height = (imageFile.height * screenWidth) / imageFile.width;
              imageFile.width = screenWidth;            
            }
            pixelate(config);
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

})();



