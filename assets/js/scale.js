document.getElementById('scaleButton').addEventListener('click', () => {
    const imageInput = document.getElementById('imageInput');
    const scaleInput = document.getElementById('scaleInput');
    const canvas = document.getElementById('canvas');
    const downloadLink = document.getElementById('downloadLink');

    if (!imageInput.files[0]) {
        alert("Please upload an image first!");
        return;
    }

    const scale = parseInt(scaleInput.value, 10) / 100;
    if (scale <= 0 || scale > 1) {
        alert("Scale should be between 1% and 100%.");
        return;
    }

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const ctx = canvas.getContext('2d');
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

            // Show canvas and download link
            canvas.style.display = 'block';
            downloadLink.style.display = 'block';
            downloadLink.href = canvas.toDataURL();
            downloadLink.download = 'scaled-image.png';
            downloadLink.textContent = 'Download Scaled Image';
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});