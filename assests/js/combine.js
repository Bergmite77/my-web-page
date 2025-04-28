document.getElementById('combineButton').addEventListener('click', () => {
    const imageAInput = document.getElementById('imageA');
    const imageBInput = document.getElementById('imageB');
    const transparencyInput = document.getElementById('transparency');
    const canvas = document.getElementById('canvas');
    const downloadLink = document.getElementById('downloadLink');

    if (!imageAInput.files[0] || !imageBInput.files[0]) {
        alert("Please upload both Image A and Image B.");
        return;
    }

    const transparency = parseInt(transparencyInput.value, 10) / 100;

    const readerA = new FileReader();
    const readerB = new FileReader();

    readerA.onload = function(eventA) {
        const imgA = new Image();
        imgA.onload = function() {
            readerB.onload = function(eventB) {
                const imgB = new Image();
                imgB.onload = function() {
                    // Set canvas dimensions to match Image B
                    canvas.width = imgB.width;
                    canvas.height = imgB.height;

                    const ctx = canvas.getContext('2d');

                    // Draw Image B (background)
                    ctx.drawImage(imgB, 0, 0);

                    // Draw Image A (overlay) with transparency
                    ctx.globalAlpha = transparency;
                    ctx.drawImage(imgA, 0, 0, imgB.width, imgB.height);
                    ctx.globalAlpha = 1.0; // Reset transparency

                    // Show canvas and download link
                    canvas.style.display = 'block';
                    downloadLink.style.display = 'block';
                    downloadLink.href = canvas.toDataURL();
                    downloadLink.download = 'combined-image.png';
                    downloadLink.textContent = 'Download Combined Image';
                };
                imgB.src = eventB.target.result;
            };
            readerB.readAsDataURL(imageBInput.files[0]);
        };
        imgA.src = eventA.target.result;
    };
    readerA.readAsDataURL(imageAInput.files[0]);
});

let startX, startY, isDrawing = false;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Redraw the canvas with the selected slice rectangle
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgB, 0, 0); // Redraw Image B
    ctx.drawImage(imgA, 0, 0, imgB.width, imgB.height); // Redraw Image A with transparency
    ctx.strokeStyle = 'red';
    ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
});

canvas.addEventListener('mouseup', (e) => {
    isDrawing = false;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const sliceWidth = endX - startX;
    const sliceHeight = endY - startY;

    // Slice the canvas
    const ctx = canvas.getContext('2d');
    const slicedImage = ctx.getImageData(startX, startY, sliceWidth, sliceHeight);

    // Create a new canvas for the sliced image
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = sliceWidth;
    sliceCanvas.height = sliceHeight;
    const sliceCtx = sliceCanvas.getContext('2d');
    sliceCtx.putImageData(slicedImage, 0, 0);

    // Update download link for the sliced image
    downloadLink.href = sliceCanvas.toDataURL();
    downloadLink.download = 'sliced-image.png';
    downloadLink.textContent = 'Download Sliced Image';
});