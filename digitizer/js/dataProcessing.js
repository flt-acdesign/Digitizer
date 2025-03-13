// Live Plot Updating using Plotly and CSV Export

function updateLiveResults() {
    const allData = [...dataSets];
    if (currentData.length > 0) {
      allData.push({
        datasetName: currentDatasetName,
        name: currentCurveName,
        color: currentDatasetColor,
        data: [...currentData]
      });
    }
    if (allData.length === 0) return;
    let plotData = allData.map(dataset => {
      return {
        x: dataset.data.map(pt => pt.x),
        y: dataset.data.map(pt => pt.y),
        mode: 'lines+markers',
        name: dataset.datasetName ? `${dataset.datasetName}: ${dataset.name}` : (dataset.name || "Unnamed"),
        line: { color: dataset.color },
        marker: { color: dataset.color }
      };
    });
    Plotly.newPlot('liveResultsPlot', plotData, {
      title: 'Live Digitized Results',
      xaxis: { title: 'X' },
      yaxis: { title: 'Y' },
      margin: { t: 30, r: 30, b: 40, l: 50 },
      legend: { x: 0, y: 1 }
    });
  }
  
  function exportCSV() {
    if (dataSets.length === 0 && currentData.length === 0) {
      updateStatus("No data to export!");
      return;
    }
    const tempDataSets = [...dataSets];
    if (currentData.length > 0) {
      tempDataSets.push({
        datasetName: document.getElementById('datasetName').value || currentDatasetName,
        name: document.getElementById('curveName').value || currentCurveName,
        color: currentDatasetColor,
        data: [...currentData]
      });
    }
    let csvContent = "dataset,curve,x,y\n";
    tempDataSets.forEach(dataset => {
      const datasetName = dataset.datasetName || "Unnamed Dataset";
      const curveName = dataset.name || "Unnamed Curve";
      dataset.data.forEach(point => {
        csvContent += `"${datasetName}","${curveName}",${point.x},${point.y}\n`;
      });
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    link.setAttribute('href', url);
    link.setAttribute('download', `digitized_data_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    updateStatus("CSV file exported!");
  }

 


// This should be added or replaced in the dataProcessing.js file

function exportJSON() {
    if (dataSets.length === 0 && currentData.length === 0) {
      updateStatus("No data to export!");
      return;
    }
    
    const tempDataSets = [...dataSets];
    if (currentData.length > 0) {
      tempDataSets.push({
        datasetName: document.getElementById('datasetName').value || currentDatasetName,
        name: document.getElementById('curveName').value || currentCurveName,
        color: currentDatasetColor,
        data: [...currentData]
      });
    }
    
    // Format the data for JSON export
    const formattedData = tempDataSets.map(dataset => {
      return {
        dataset: dataset.datasetName || "Unnamed Dataset",
        curve: dataset.name || "Unnamed Curve",
        color: dataset.color,
        points: dataset.data.map(point => ({
          x: point.x,
          y: point.y
        }))
      };
    });
    
    // Create the JSON file
    const jsonContent = JSON.stringify(formattedData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    link.setAttribute('href', url);
    link.setAttribute('download', `digitized_data_${timestamp}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    updateStatus("JSON file exported!");
  }
  
  // Make sure the button is connected correctly in ui.js
  // Add this to ui.js if it's not already there:
  document.getElementById('exportJSONBtn').onclick = exportJSON;


  
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
      curveCounter++;
      currentCurveName = curveNameInput.trim() || `Curve ${curveCounter}`;
      document.getElementById('curveName').value = currentCurveName;
      currentDatasetColor = getRandomColor();
      updateStatus(`Started new curve: ${currentCurveName} in dataset: ${currentDatasetName}`);
      updateCurveIndicator();
      redrawCanvas();
      updateLiveResults();
    } else {
      currentDatasetName = document.getElementById('datasetName').value;
      currentCurveName = document.getElementById('curveName').value;
      updateCurveIndicator();
      updateStatus(`Ready to digitize: ${currentCurveName} in dataset: ${currentDatasetName}`);
    }
  }
  
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  function resetView() {
    if (img) {
      const imgRatio = img.width / img.height;
      const canvasRatio = canvasWidth / canvasHeight;
      let fitScale;
      if (imgRatio > canvasRatio) {
        fitScale = (canvasWidth / img.width) * 0.9;
      } else {
        fitScale = (canvasHeight / img.height) * 0.9;
      }
      zoomLevel = fitScale;
      offsetX = (canvasWidth / zoomLevel - img.width) / 2;
      offsetY = (canvasHeight / zoomLevel - img.height) / 2;
    } else {
      zoomLevel = 1;
      offsetX = 0;
      offsetY = 0;
    }
    redrawCanvas();
  }
  