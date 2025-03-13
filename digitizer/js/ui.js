// File Loading and UI Event Handlers

function loadImageFromFile(file) {
  const datasetNameInput = prompt("Enter a name for this dataset:", `Dataset ${datasetCounter}`);
  if (datasetNameInput === null) return;
  currentDatasetName = datasetNameInput.trim() || `Dataset ${datasetCounter}`;
  document.getElementById('datasetName').value = currentDatasetName;
  
  const curveNameInput = prompt("Enter a name for the first curve:", `Curve ${curveCounter}`);
  if (curveNameInput === null) return;
  currentCurveName = curveNameInput.trim() || `Curve ${curveCounter}`;
  document.getElementById('curveName').value = currentCurveName;
  
  if (currentData.length > 0) {
    dataSets.push({
      datasetName: currentDatasetName,
      name: currentCurveName,
      color: currentDatasetColor,
      data: [...currentData]
    });
  }
  currentData = [];
  origin = null;
  xScalePoint = null;
  yScalePoint = null;
  scaleX = null;
  scaleY = null;
  mode = "none";
  datasetCounter++;
  curveCounter = 1;
  updateCurveIndicator();
  resetView();
  background(220);
  
  let reader = new FileReader();
  reader.onload = function(event) {
    loadImageData(event.target.result);
  };
  reader.readAsDataURL(file);
}

function loadImageData(data) {
  loadImage(data, (loadedImg) => {
    img = loadedImg;
    resetView();
    redrawCanvas();
    updateStatus("Image loaded. Set origin point first.");
  });
}

// File Input and Clipboard Events
document.getElementById('imageLoader').onchange = function(e) {
  if (e.target.files.length > 0) {
    loadImageFromFile(e.target.files[0]);
  }
};

const pasteArea = document.getElementById('pasteArea');
pasteArea.addEventListener('click', function() {
  this.focus();
  updateStatus("Paste image with Ctrl+V");
});
document.addEventListener('paste', function(e) {
  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      loadImageFromFile(blob);
      e.preventDefault();
      return;
    }
  }
  updateStatus("No image found in clipboard!");
});

// Calibration and Data Capture Events
document.getElementById('setOriginBtn').onclick = () => {
  mode = "origin";
  updateStatus("Click on the image to set the origin (0,0)");
};
document.getElementById('setXScaleBtn').onclick = () => {
  mode = "xscale";
  const xValue = document.getElementById('xScaleValue').value;
  updateStatus(`Click on the image to set X-Scale (${xValue} units from origin)`);
};
document.getElementById('setYScaleBtn').onclick = () => {
  mode = "yscale";
  const yValue = document.getElementById('yScaleValue').value;
  updateStatus(`Click on the image to set Y-Scale (${yValue} units from origin)`);
};

document.getElementById('addPointBtn').onclick = () => {
  mode = "addpoint";
  currentDatasetName = document.getElementById('datasetName').value;
  currentCurveName = document.getElementById('curveName').value;
  updateCurveIndicator();
  updateStatus(`Hold CTRL key and click to add data points for "${currentCurveName}" in dataset "${currentDatasetName}"`);
};

document.getElementById('newCurveBtn').onclick = createNewCurve;
document.getElementById('resetBtn').onclick = () => {
  currentData = [];
  redrawCanvas();
  updateStatus("Current data points cleared. Calibration maintained.");
  updateCurveIndicator();
  updateLiveResults();
};
document.getElementById('exportCSVBtn').onclick = exportCSV;

document.getElementById('datasetName').addEventListener('input', function() {
  currentDatasetName = this.value;
  updateCurveIndicator();
});
document.getElementById('curveName').addEventListener('input', function() {
  currentCurveName = this.value;
  updateCurveIndicator();
});

document.getElementById('zoomIn').onclick = () => {
  zoomLevel *= 1.2;
  redrawCanvas();
};
document.getElementById('zoomOut').onclick = () => {
  zoomLevel /= 1.2;
  redrawCanvas();
};
document.getElementById('resetZoom').onclick = () => {
  resetView();
};

// Helper Functions for UI Updates
function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

function updateCurveIndicator() {
  document.getElementById('datasetNameDisplay').textContent = currentDatasetName;
  document.getElementById('curveNameDisplay').textContent = currentCurveName;
  document.getElementById('curveColorDisplay').style.backgroundColor = currentDatasetColor;
  document.getElementById('pointCountDisplay').textContent = currentData.length;
}
