// Global variables to store the sliced portion and canvas context
let slicedCanvas = null;
let slicedCtx = null;
let isSlicingEnabled = false; // Prevent multiple slicing loops

// Slice the Background Image
document.getElementById('sliceBackgroundButton').addEventListener('click', () => {
    const imageBInput = document.getElementById('imageB');
    const canvas = document.getElementById('canvas');

    if (!imageBInput.files[0]) {
        alert("Please upload a background image to slice.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        const imgB = new Image();
        imgB.onload = function() {
            canvas.width = imgB.width;
            canvas.height = imgB.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgB, 0, 0);

            enableSlicing(canvas, imgB);
        };
        imgB.src = event.target.result;
    };
    reader.readAsDataURL(imageBInput.files[0]);
});

// Enable Slicing Functionality (prevents duplicate listeners)
function enableSlicing(canvas, imgB) {
    const ctx = canvas.getContext('2d');

    // Clear previous listeners to prevent duplication
    if (isSlicingEnabled) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
    }

    // Add slicing functionality
    let startX, startY, isDrawing = false;

    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        isDrawing = true;
    }

    function handleMouseMove(e) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Temporary visual rectangle for user feedback
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgB, 0, 0); // Redraw the original image
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
    }

    function handleMouseUp(e) {
        isDrawing = false;

        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const sliceWidth = endX - startX;
        const sliceHeight = endY - startY;

        // Create a new canvas for the sliced portion
        slicedCanvas = document.createElement('canvas');
        slicedCanvas.width = sliceWidth;
        slicedCanvas.height = sliceHeight;
        slicedCtx = slicedCanvas.getContext('2d');

        // Extract the sliced portion directly from the original image
        slicedCtx.drawImage(
            imgB,
            startX, startY, sliceWidth, sliceHeight, // Source rectangle
            0, 0, sliceWidth, sliceHeight            // Destination rectangle
        );

        // Clear the main canvas to remove the red outline
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgB, 0, 0); // Redraw the original image without the rectangle

        // Update combine button and message
        const combineButton = document.getElementById('combineButton');
        combineButton.disabled = false;
        combineButton.textContent = "Combine Sliced Background with Image A";
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.textContent = "Background image sliced successfully!";
        statusMessage.style.color = "green";
    }

    // Attach new listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Mark slicing as enabled to prevent duplicate listeners
    isSlicingEnabled = true;
}

// Combine Sliced Background with Image A
document.getElementById('combineButton').addEventListener('click', () => {
    const imageAInput = document.getElementById('imageA');
    const transparencyInput = document.getElementById('transparency');
    const canvas = document.getElementById('canvas');
    const downloadLink = document.getElementById('downloadLink');

    if (!imageAInput.files[0] || !slicedCanvas) {
        alert("Please upload Image A and slice the background image first.");
        return;
    }

    const transparency = parseInt(transparencyInput.value, 10) / 100;

    const readerA = new FileReader();
    readerA.onload = function(eventA) {
        const imgA = new Image();
        imgA.onload = function() {
            // Set canvas dimensions to match the sliced background
            canvas.width = slicedCanvas.width;
            canvas.height = slicedCanvas.height;

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

            // Draw the sliced background image
            ctx.drawImage(slicedCanvas, 0, 0);

            // Draw Image A (overlay) with transparency
            ctx.globalAlpha = transparency;
            ctx.drawImage(imgA, 0, 0, slicedCanvas.width, slicedCanvas.height);
            ctx.globalAlpha = 1.0; // Reset transparency

            // Show canvas and download link
            canvas.style.display = 'block';
            downloadLink.style.display = 'block';
            downloadLink.href = canvas.toDataURL();
            downloadLink.download = 'combined-image.png';
            downloadLink.textContent = 'Download Combined Image';
        };
        imgA.src = eventA.target.result;
    };
    readerA.readAsDataURL(imageAInput.files[0]);
});