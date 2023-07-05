class Cam {
    _cameraMenu;
    _videoHTML;
    _videoCanvas;
    _streamRunning = false;
    _snapshotImage = null;
  
    constructor(cameraMenu, videoCanvas, videoHTML, debug = true) {
      this._debug = debug;
      this._cameraMenu = cameraMenu;
      this._videoCanvas = videoCanvas;
      this._videoCanvasContext = videoCanvas.getContext("2d");
      this._videoHTML = videoHTML;
      this.handleCameraChange();
    }
  
    detectCameras = async () => {
      this._debug && console.log("Detecting cameras!");
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      const options = videoDevices.map(videoDevice => {
        return `<option value="${videoDevice.deviceId}">CAM ${videoDevice.label}</option>`;
      });
      this._debug && console.log("Detected cameras: ", options)
      this._cameraMenu.innerHTML = `<option value="0" disabled selected>Choose Camera</option>` + options.join('');
  
    };
  
    handleCameraChange() {
      this._cameraMenu.addEventListener("change", event => {
        this.stopMediaTracks();
        this._debug && console.log(`Changed camera to ${this._cameraMenu.value}`);
        if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
          const newConstraints = {
            video: {
              deviceId: {
                exact: this._cameraMenu.value
              }
            }
          };
  
          this.startStream(newConstraints);
  
        } else {
          throw new Error("Camera could not be started");
        }
      })
    }
  
    handleStream = (stream) => {
      this._videoHTML.srcObject = stream;
      this.showVideoOnCanvas(stream);
      this._streamRunning = true;
    };
  
    showVideoOnCanvas(stream) {
      this._debug && console.log("Start showing video on canvas");
      const videoProps = stream.getTracks()[0].getSettings();
      const videoWidth = videoProps.width;
      const videoHeight = videoProps.height;
      this._debug && console.log(`CAM: w: ${videoWidth}, h: ${videoHeight}`);
    
      const ratio = videoWidth / videoHeight;
      const canvasWidth = this._videoCanvas.width;
      const canvasHeight = this._videoCanvas.height;
      let targetWidth, targetHeight, xOffset, yOffset;
    
      if (ratio > 1) {
        targetWidth = canvasWidth;
        targetHeight = canvasWidth / ratio;
        xOffset = 0;
        yOffset = (canvasHeight - targetHeight) / 2;
      } else {
        targetWidth = canvasHeight * ratio;
        targetHeight = canvasHeight;
        xOffset = (canvasWidth - targetWidth) / 2;
        yOffset = 0;
      }
    
      this._debug && console.log(`TARGET: w: ${targetWidth}, h: ${targetHeight}`);
      this._debug && console.log(`CAM: x-Offset: ${xOffset}, y-Offset: ${yOffset}, ratio: ${ratio}`);
    
      const self = this;
    
      this._videoHTML.addEventListener("loadedmetadata", function () {
        self.update();
      });
    
      function drawVideoFrame() {
        self._videoCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
        if (self._snapshotImage === null) {
          self._videoCanvasContext.drawImage(
            self._videoHTML,
            xOffset,
            yOffset,
            targetWidth,
            targetHeight
          );
        } else {
          self._videoCanvasContext.drawImage(
            self._snapshotImage,
            xOffset,
            yOffset,
            targetWidth,
            targetHeight
          );
        }
        requestAnimationFrame(drawVideoFrame);
      }
    
      drawVideoFrame();
    }
    
  
    update = () => {
      this._debug && console.log("Updating canvas");
      const videoProps = this._videoHTML.srcObject.getVideoTracks()[0].getSettings();
      const videoWidth = videoProps.width;
      const videoHeight = videoProps.height;
      const ratio = videoWidth / videoHeight;
      const canvasWidth = this._videoCanvas.width;
      const canvasHeight = this._videoCanvas.height;
      let targetWidth, targetHeight;
  
      if (ratio > 1) {
        targetWidth = canvasWidth;
        targetHeight = canvasWidth / ratio;
      } else {
        targetWidth = canvasHeight * ratio;
        targetHeight = canvasHeight;
      }
  
      const x = (canvasWidth - targetWidth) / 2;
      const y = (canvasHeight - targetHeight) / 2;
  
      this._videoCanvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
      if (this._snapshotImage === null) {
        this._videoCanvasContext.drawImage(
          this._videoHTML,
          x,
          y,
          targetWidth,
          targetHeight
        );
      } else {
        this._videoCanvasContext.drawImage(
          this._snapshotImage,
          x,
          y,
          targetWidth,
          targetHeight
        );
      }
  
      requestAnimationFrame(this.update);
    };
  
    startStream = async (constraints) => {
      console.log("Starting stream");
      navigator.mediaDevices.getUserMedia(constraints).then(stream => this.handleStream(stream));
    };
  
    stopMediaTracks() {
      this._debug && console.log("Video SRC Object: ", this._videoHTML.srcObject)
      if (this._videoHTML.srcObject !== null) {
        this._videoHTML.srcObject.getTracks().forEach(track => {
          track.stop();
        });
      }
    }
  
    takeSnapshot() {
      const snapshotImage = new Image();
      snapshotImage.src = this._videoCanvas.toDataURL("image/png");
  
      this._snapshotImage = snapshotImage;
  
      return snapshotImage;
    }
  
    resumeVideo() {
      this._snapshotImage = null;
    }
  }
  