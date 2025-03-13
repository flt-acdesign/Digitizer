// p5.js Variables and Settings
let img;
let mode = "none";
let origin, xScalePoint, yScalePoint;
let scaleX, scaleY;
let dataSets = [];
let currentData = [];
let currentDatasetName = "Dataset 1";
let currentCurveName = "Curve 1";
let currentDatasetColor = "#FFA500";
let datasetCounter = 1;
let curveCounter = 1;

// Zoom & pan variables
let zoomLevel = 1;
let offsetX = 0;
let offsetY = 0;
const canvasWidth = 800;
const canvasHeight = 600;

// Panning variables
let isPanning = false;
let panStartX, panStartY;

// New global flag to track vertical flip
let flipVertical = false;

function setup() {
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvasContainer');
  background(220);
  noLoop(); // Manual redraw
  setupCanvasEvents(canvas);

  // Add event listener for the flip button
  document.getElementById('flipVerticalBtn').onclick = () => {
    flipVertical = !flipVertical;
    redrawCanvas();
  };
}

function draw() {
  // p5.js draw loop (unused due to noLoop)
}

function mouseMoved() {
  if (img && !isSelecting && !isPanning) {
    redrawCanvas();
  }
}

function mousePressed() {
  if (isSelecting) return;
  if (!img) return;

  if (mouseButton === LEFT) {
    const imgX = (mouseX / zoomLevel) - offsetX;
    const imgY = (mouseY / zoomLevel) - offsetY;

    if (mode === "origin") {
      origin = createVector(imgX, imgY);
      redrawCanvas();
      drawPoint(origin.x, origin.y, 10, color(255, 0, 0));
      updateStatus("Origin set. Now set X-Scale.");
      mode = "none";
    } else if (mode === "xscale") {
      if (!origin) {
        updateStatus("Please set origin first!");
        return;
      }
      const restrictedY = origin.y;
      xScalePoint = createVector(imgX, restrictedY);
      redrawCanvas();
      drawPoint(origin.x, origin.y, 10, color(255, 0, 0));
      drawLine(origin.x, origin.y, xScalePoint.x, xScalePoint.y, color(0, 255, 0));
      drawPoint(xScalePoint.x, xScalePoint.y, 8, color(0, 255, 0));
      let distPx = Math.abs(xScalePoint.x - origin.x);
      const xUnitValue = parseFloat(document.getElementById('xScaleValue').value) || 1;
      scaleX = xUnitValue / distPx;
      updateStatus(`X-Scale set to ${xUnitValue} units. Now set Y-Scale.`);
      mode = "none";
    } else if (mode === "yscale") {
      if (!origin) {
        updateStatus("Please set origin first!");
        return;
      }
      const restrictedX = origin.x;
      yScalePoint = createVector(restrictedX, imgY);
      redrawCanvas();
      drawPoint(origin.x, origin.y, 10, color(255, 0, 0));
      if (xScalePoint) {
        drawLine(origin.x, origin.y, xScalePoint.x, xScalePoint.y, color(0, 255, 0));
        drawPoint(xScalePoint.x, xScalePoint.y, 8, color(0, 255, 0));
      }
      drawLine(origin.x, origin.y, yScalePoint.x, yScalePoint.y, color(0, 0, 255));
      drawPoint(yScalePoint.x, yScalePoint.y, 8, color(0, 0, 255));
      let distPx = Math.abs(yScalePoint.y - origin.y);
      const yUnitValue = parseFloat(document.getElementById('yScaleValue').value) || 1;
      scaleY = yUnitValue / distPx;
      updateStatus(`Y-Scale set to ${yUnitValue} units. Ready to add data points.`);
      mode = "none";
    } else if (mode === "addpoint") {
      if (!origin || !scaleX || !scaleY) {
        updateStatus("Please set origin and scales first!");
        return;
      }
      if (!keyIsDown(CONTROL)) {
        updateStatus("Hold CTRL key while clicking to add a data point");
        return;
      }
      drawPoint(imgX, imgY, 6, color(currentDatasetColor));
      let dataX = (imgX - origin.x) * scaleX;
      let dataY = (origin.y - imgY) * scaleY;
      currentData.push({ x: dataX, y: dataY });
      updateStatus(`Point added: (${dataX.toFixed(3)}, ${dataY.toFixed(3)}). Total: ${currentData.length}`);
      updateLiveResults();
    }
  }
}

// Drawing Helpers
function drawPoint(x, y, size, clr) {
  push();
  translate(offsetX * zoomLevel, offsetY * zoomLevel);
  scale(zoomLevel);
  fill(clr);
  noStroke();
  ellipse(x, y, size, size);
  pop();
}

function drawLine(x1, y1, x2, y2, clr) {
  push();
  translate(offsetX * zoomLevel, offsetY * zoomLevel);
  scale(zoomLevel);
  stroke(clr);
  strokeWeight(2);
  line(x1, y1, x2, y2);
  pop();
}

function drawCrosshair() {
  push();
  stroke(255, 0, 0, 180);
  strokeWeight(0.5);
  line(0, mouseY, width, mouseY);
  line(mouseX, 0, mouseX, height);
  if (origin) {
    const realMouseX = (mouseX / zoomLevel) - offsetX;
    const realMouseY = (mouseY / zoomLevel) - offsetY;
    if (scaleX) {
      const valueX = ((realMouseX - origin.x) * scaleX).toFixed(2);
      fill(0, 0, 0, 150);
      noStroke();
      textSize(12);
      text(`X: ${valueX}`, mouseX + 5, mouseY - 5);
    }
    if (scaleY) {
      const valueY = ((origin.y - realMouseY) * scaleY).toFixed(2);
      fill(0, 0, 0, 150);
      noStroke();
      textSize(12);
      text(`Y: ${valueY}`, mouseX + 5, mouseY + 15);
    }
  }
  pop();
}

function redrawCanvas() {
  background(220);
  if (img) {
    push();
    translate(offsetX * zoomLevel, offsetY * zoomLevel);
    scale(zoomLevel);
    if (flipVertical) {
      // Flip vertically: translate down by image height then scale Y by -1
      push();
      translate(0, img.height);
      scale(1, -1);
      image(img, 0, 0, img.width, img.height);
      pop();
    } else {
      image(img, 0, 0, img.width, img.height);
    }
    pop();
    if (origin) {
      drawPoint(origin.x, origin.y, 10, color(255, 0, 0));
    }
    if (xScalePoint) {
      drawLine(origin.x, origin.y, xScalePoint.x, xScalePoint.y, color(0, 255, 0));
      drawPoint(xScalePoint.x, xScalePoint.y, 8, color(0, 255, 0));
    }
    if (yScalePoint) {
      drawLine(origin.x, origin.y, yScalePoint.x, yScalePoint.y, color(0, 0, 255));
      drawPoint(yScalePoint.x, yScalePoint.y, 8, color(0, 0, 255));
    }
    if (origin && scaleX && scaleY && currentData.length > 0) {
      for (let point of currentData) {
        let screenX = origin.x + point.x / scaleX;
        let screenY = origin.y - point.y / scaleY;
        drawPoint(screenX, screenY, 6, color(currentDatasetColor));
      }
    }
    drawCrosshair();
  }
}

function setupCanvasEvents(canvas) {
  // Mouse wheel zoom
  canvas.canvas.addEventListener('wheel', function(event) {
    if (isSelecting) return;
    event.preventDefault();
    const rect = this.getBoundingClientRect();
    const mouseXOnCanvas = event.clientX - rect.left;
    const mouseYOnCanvas = event.clientY - rect.top;
    const posXBefore = (mouseXOnCanvas / zoomLevel) - offsetX;
    const posYBefore = (mouseYOnCanvas / zoomLevel) - offsetY;
    if (event.deltaY < 0) {
      zoomLevel *= 1.1;
    } else {
      zoomLevel /= 1.1;
    }
    zoomLevel = constrain(zoomLevel, 0.1, 10);
    const posXAfter = (mouseXOnCanvas / zoomLevel) - offsetX;
    const posYAfter = (mouseYOnCanvas / zoomLevel) - offsetY;
    offsetX += (posXAfter - posXBefore);
    offsetY += (posYAfter - posYBefore);
    redrawCanvas();
  });

  // Right mouse button panning
  canvas.canvas.addEventListener('mousedown', function(event) {
    if (event.button === 2) {
      isPanning = true;
      panStartX = event.clientX;
      panStartY = event.clientY;
    }
  });
  canvas.canvas.addEventListener('mousemove', function(event) {
    if (isPanning) {
      const dx = event.clientX - panStartX;
      const dy = event.clientY - panStartY;
      offsetX += dx / zoomLevel;
      offsetY += dy / zoomLevel;
      panStartX = event.clientX;
      panStartY = event.clientY;
      redrawCanvas();
    }
  });
  canvas.canvas.addEventListener('mouseup', function(event) {
    if (event.button === 2) {
      isPanning = false;
    }
  });
  canvas.canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  });
}
