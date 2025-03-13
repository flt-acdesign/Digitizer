// Screenshot Selection and Capture

let isSelecting = false;
let selectionBox = null;
let startX, startY, endX, endY;

const startSelectionBtn = document.getElementById('start-selection-btn');
const screenshotPreview = document.getElementById('screenshotPreview');

startSelectionBtn.addEventListener('click', () => {
  isSelecting = true;
  startSelectionBtn.style.display = 'none';
  updateStatus("Drag on the page to select an area for screenshot.");
});

document.addEventListener('mousedown', (e) => {
  if (isSelecting && e.button === 0) {
    startX = e.clientX;
    startY = e.clientY;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
});

function onMouseMove(e) {
  if (isSelecting) {
    endX = e.clientX;
    endY = e.clientY;
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    createSelectionBox(
      Math.min(startX, endX),
      Math.min(startY, endY),
      width,
      height
    );
  }
}

function onMouseUp() {
  if (isSelecting) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (selectionBox) {
      const rect = selectionBox.getBoundingClientRect();
      html2canvas(document.body, {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        screenshotPreview.src = imgData;
        screenshotPreview.style.display = 'block';
        selectionBox.remove();
        selectionBox = null;
        isSelecting = false;
        startSelectionBtn.style.display = 'inline-block';
        updateStatus("Screenshot captured! Digitizing mode is active again.");
      });
    } else {
      isSelecting = false;
      startSelectionBtn.style.display = 'inline-block';
      updateStatus("No area selected. Please try again.");
    }
  }
}

function createSelectionBox(x, y, width, height) {
  if (selectionBox) {
    selectionBox.remove();
  }
  selectionBox = document.createElement('div');
  selectionBox.className = 'selection-box';
  selectionBox.style.left = x + 'px';
  selectionBox.style.top = y + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
  document.body.appendChild(selectionBox);
}
