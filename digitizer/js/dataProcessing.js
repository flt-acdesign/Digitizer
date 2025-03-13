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
    
    // Get current axis labels from input fields
    const xLabel = document.getElementById('xAxisLabel').value || "X";
    const yLabel = document.getElementById('yAxisLabel').value || "Y";
    
    Plotly.newPlot('liveResultsPlot', plotData, {
      title: 'Live Digitized Results',
      xaxis: { title: xLabel },
      yaxis: { title: yLabel },
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
  
  function loadJSONData(jsonContent) {
    try {
      // Parse the JSON content
      const loadedData = JSON.parse(jsonContent);
      
      if (!Array.isArray(loadedData)) {
        updateStatus("Invalid JSON format: data must be an array");
        return false;
      }
      
      // Find maximum dataset and curve counters for proper naming of new items
      let maxDatasetNum = 0;
      let maxCurveNum = 0;
      
      // Process the data
      loadedData.forEach(dataset => {
        // Extract dataset number if it follows the format "Dataset X"
        if (dataset.dataset && dataset.dataset.match(/Dataset\s+(\d+)/)) {
          const num = parseInt(dataset.dataset.match(/Dataset\s+(\d+)/)[1]);
          maxDatasetNum = Math.max(maxDatasetNum, num);
        }
        
        // Extract curve number if it follows the format "Curve X"
        if (dataset.curve && dataset.curve.match(/Curve\s+(\d+)/)) {
          const num = parseInt(dataset.curve.match(/Curve\s+(\d+)/)[1]);
          maxCurveNum = Math.max(maxCurveNum, num);
        }
        
        // Handle points
        if (!Array.isArray(dataset.points)) {
          updateStatus("Warning: Skipping dataset with invalid points format");
          return; // Skip this dataset
        }
        
        // Create dataset entry to add to dataSets array
        const dataEntry = {
          datasetName: dataset.dataset || "Unnamed Dataset",
          name: dataset.curve || "Unnamed Curve",
          color: dataset.color || getRandomColor(),
          data: dataset.points.map(pt => ({
            x: typeof pt.x === 'number' ? pt.x : parseFloat(pt.x),
            y: typeof pt.y === 'number' ? pt.y : parseFloat(pt.y)
          }))
        };
        
        // Add to dataSets array
        dataSets.push(dataEntry);
      });
      
      // Update counters for new datasets/curves
      datasetCounter = maxDatasetNum + 1;
      curveCounter = maxCurveNum + 1;
      
      // Set current dataset/curve to the last one loaded
      if (dataSets.length > 0) {
        const lastDataset = dataSets[dataSets.length - 1];
        currentDatasetName = lastDataset.datasetName;
        currentCurveName = lastDataset.name;
        currentDatasetColor = lastDataset.color;
        document.getElementById('datasetName').value = currentDatasetName;
        document.getElementById('curveName').value = currentCurveName;
        document.getElementById('curveColorPicker').value = currentDatasetColor;
        updateCurveIndicator();
      }
      
      // Update the live results plot
      updateLiveResults();
      
      updateStatus(`Loaded ${loadedData.length} dataset(s) from JSON. Ready to continue adding data.`);
      return true;
      
    } catch (error) {
      console.error("Error loading JSON data:", error);
      updateStatus("Error loading JSON file: " + error.message);
      return false;
    }
  }