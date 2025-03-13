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
    
    // Add color picker dialog for the first curve
    const colorInput = prompt("Enter a color for the curve (hex code or color name):", currentDatasetColor);
    if (colorInput !== null) {
      currentDatasetColor = colorInput;
    }
    
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
      // Hide the paste area once an image is loaded.
      document.getElementById('pasteArea').style.display = 'none';
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
  
  // Modified createNewCurve function with color selection
  function createNewCurve() {
    if (currentData.length > 0) {
      dataSets.push({
        datasetName: currentDatasetName,
        name: currentCurveName,
        color: currentDatasetColor,
        data: [...currentData]
      });
      currentData = [];
      const curveNameInput = prompt("Enter a name for the new curve:", `Curve ${curveCounter + 1}`);
      if (curveNameInput === null) {
        dataSets.pop();
        currentData = dataSets[dataSets.length - 1].data;
        return;
      }
      
      // Add color picker dialog for the new curve
      const colorInput = prompt("Enter a color for the curve (hex code or color name):", getRandomColor());
      if (colorInput === null) {
        dataSets.pop();
        currentData = dataSets[dataSets.length - 1].data;
        return;
      }
      
      curveCounter++;
      currentCurveName = curveNameInput.trim() || `Curve ${curveCounter}`;
      document.getElementById('curveName').value = currentCurveName;
      currentDatasetColor = colorInput || getRandomColor();
      updateStatus(`Started new curve: ${currentCurveName} in dataset: ${currentDatasetName}`);
      updateCurveIndicator();
      redrawCanvas();
      updateLiveResults();
    } else {
      currentDatasetName = document.getElementById('datasetName').value;
      currentCurveName = document.getElementById('curveName').value;
      
      // Allow color selection even when no points yet
      const colorInput = prompt("Enter a color for the curve (hex code or color name):", currentDatasetColor);
      if (colorInput !== null) {
        currentDatasetColor = colorInput;
      }
      
      updateCurveIndicator();
      updateStatus(`Ready to digitize: ${currentCurveName} in dataset: ${currentDatasetName}`);
    }
  }
  
  // Restoring the functionality of New Curve, Reset Current, and Export CSV buttons
  document.getElementById('newCurveBtn').onclick = createNewCurve;
  document.getElementById('resetBtn').onclick = () => {
    currentData = [];
    redrawCanvas();
    updateStatus("Current data points cleared. Calibration maintained.");
    updateCurveIndicator();
    updateLiveResults();
  };
  //document.getElementById('exportCSVBtn').onclick = exportCSV;
  document.getElementById('exportJSONBtn').onclick = exportJSON;
  
  document.getElementById('datasetName').addEventListener('input', function() {
    currentDatasetName = this.value;
    updateCurveIndicator();
  });
  document.getElementById('curveName').addEventListener('input', function() {
    currentCurveName = this.value;
    updateCurveIndicator();
  });
  
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

   // Add this to ui.js
  
  // Load JSON button and file input handler
  document.getElementById('loadJSONBtn').onclick = () => {
    document.getElementById('jsonLoader').click();
  };
  
  document.getElementById('jsonLoader').addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = function(event) {
        const jsonContent = event.target.result;
        loadJSONData(jsonContent);
        
        // Reset file input so the same file can be selected again if needed
        document.getElementById('jsonLoader').value = "";
      };
      
      reader.readAsText(file);
    }
  });