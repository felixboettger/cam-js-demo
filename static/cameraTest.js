const cameraSelect = document.getElementById("camera-select");
const videoCanvas = document.getElementById("video-canvas");
const videoHTML = document.getElementById("video-input");
const camera = new Cam(cameraSelect, videoCanvas, videoHTML);
camera.detectCameras();

const snapshotButton = document.getElementById('snapshot-button');
const resumeButton = document.getElementById('resume-button');

snapshotButton.addEventListener('click', () => {
    camera.takeSnapshot();
});

resumeButton.addEventListener('click', () => {
    camera.resumeVideo();
});