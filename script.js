const imageLoader = document.getElementById('imageLoader');
const targetImage = document.getElementById('targetImage');
const imageContainer = document.getElementById('imageContainer');
const lineX = document.getElementById('lineX');
const lineY = document.getElementById('lineY');
const lineDiagonal = document.getElementById('lineDiagonal');
const coordinates = document.getElementById('coordinates');
const selectionBox = document.getElementById('selectionBox');
const captureButton = document.getElementById('capture');
const logCoordinates = document.getElementById('logCoordinates');
const pixelColor = document.getElementById('pixelColor');
const zoomLens = document.getElementById('zoomLens');
const colorInput = document.getElementById("color-input");
const checkColor = document.getElementById("check-color");
const sendImg = document.getElementById('send-img');
const inputX = document.getElementById('coordx-input');
const inputY = document.getElementById('coordy-input');

imageLoader.addEventListener('change', handleImage, false);
inputX.addEventListener('input', updateRedDotPosition);
inputY.addEventListener('input', updateRedDotPosition);

function updateRedDotPosition() {
    const x = inputX.value;
    const y = inputY.value;

    // Se ambos os valores estiverem presentes
    if(x && y) {
        const redDot = document.getElementById('red-point');
        redDot.style.left = x + 'px';
        redDot.style.top = y + 'px';
        redDot.style.display = 'block'; // Mostra o ponto vermelho
    }
}


function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        targetImage.src = event.target.result;
        sendImg.classList.remove('send-img');
    };
    reader.readAsDataURL(e.target.files[0]);
}

targetImage.addEventListener('dragstart', function(e) {
    e.preventDefault();
});

targetImage.addEventListener('mousemove', function(e) {
    coordinates.style.display = 'block';
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lineX.style.top = y + 'px';
    lineY.style.left = x + 'px';
    lineDiagonal.style.left = x + 'px';
    lineDiagonal.style.top = (y - 1000) + 'px';

    coordinates.textContent = `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;
});

imageContainer.addEventListener('mouseleave', function() {
    coordinates.style.display = 'none';
});

let isSelecting = false;
let initialX, initialY;

imageContainer.addEventListener('mousedown', function(e) {
    if (e.target === captureButton) {
        return;
    }
    isSelecting = true;
    const rect = imageContainer.getBoundingClientRect();
    initialX = e.clientX - rect.left;
    initialY = e.clientY - rect.top;
    selectionBox.style.left = initialX + 'px';
    selectionBox.style.top = initialY + 'px';
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';
});

imageContainer.addEventListener('mousemove', function(e) {
    if (isSelecting) {
        const rect = imageContainer.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        selectionBox.style.width = Math.abs(currentX - initialX) + 'px';
        selectionBox.style.height = Math.abs(currentY - initialY) + 'px';
        selectionBox.style.left = (currentX - initialX < 0) ? currentX + 'px' : initialX + 'px';
        selectionBox.style.top = (currentY - initialY < 0) ? currentY + 'px' : initialY + 'px';
    }
});

imageContainer.addEventListener('mousemove', function (e) {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const imageSize = targetImage.getBoundingClientRect();
    const lensSize = 100;
    const scale = 2;

    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;

    zoomLens.style.width = lensSize + 'px';
    zoomLens.style.height = lensSize + 'px';
    zoomLens.style.left = lensX + 'px';
    zoomLens.style.top = lensY + 'px';
    zoomLens.style.display = 'block';

    zoomLens.style.backgroundImage = `url('${targetImage.src}')`;
    zoomLens.style.backgroundSize = `${targetImage.width * scale}px ${targetImage.height * scale}px`;

    const backgroundX = -((x / imageSize.width) * (targetImage.width * scale) - lensSize / 2);
    const backgroundY = -((y / imageSize.height) * (targetImage.height * scale) - lensSize / 2);
    zoomLens.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`;
});

imageContainer.addEventListener('mouseleave', function () {
    zoomLens.style.display = 'none';
});

imageContainer.addEventListener('mouseup', function() {
    isSelecting = false;
});

imageContainer.addEventListener('click', function(e) {
    const rect = imageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Arredonda as coordenadas para valores inteiros
    const roundedX = Math.floor(x);
    const roundedY = Math.floor(y);

    const coordDiv = document.createElement('div');
    coordDiv.classList.add('clicked-coordinate');
    coordDiv.textContent = `X: ${roundedX}, Y: ${roundedY}`;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(targetImage, x, y, 1, 1, 0, 0, 1, 1);
    const pixelData = ctx.getImageData(0, 0, 1, 1).data;

    const colorHex = `#${Array.from(pixelData)
        .slice(0, 3)
        .map(value => value.toString(16).padStart(2, '0'))
        .join('')}`;

    coordDiv.innerHTML = `X: <b>${roundedX}</b>, Y: <b>${roundedY}</b><br>Color: <b style="text-transform: uppercase; color: ${colorHex};">${colorHex}</b>`;

    coordDiv.style.left = x + 'px';
    coordDiv.style.top = y + 'px';

    imageContainer.appendChild(coordDiv);

    const logTable = document.getElementById('logClicks');
    const newRow = logTable.insertRow(-1);
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);

    cell1.textContent = `${roundedX}`;
    cell2.textContent = `${roundedY}`;
    cell3.innerHTML = `<span style="color:${colorHex};text-transform: uppercase;">${colorHex}</span>`;
});

captureButton.addEventListener('click', function() {
    const rect = targetImage.getBoundingClientRect();
    const selectionRect = selectionBox.getBoundingClientRect();

    const x = Math.max(0, selectionRect.left - rect.left);
    const y = Math.max(0, selectionRect.top - rect.top);
    const width = Math.min(rect.right, selectionRect.right) - Math.max(rect.left, selectionRect.left);
    const height = Math.min(rect.bottom, selectionRect.bottom) - Math.max(rect.top, selectionRect.top);

    if (width <= 0 || height <= 0 || x + width > targetImage.width || y + height > targetImage.height) {
        alert('Please select a valid area.');
        return;
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = height;
    const finalCtx = finalCanvas.getContext('2d');

    finalCtx.drawImage(targetImage, x, y, width, height, 0, 0, width, height);

    const img = finalCanvas.toDataURL("image/png");

    const link = document.createElement('a');
    link.href = img;
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
    link.download = `selected-image-${formattedDate}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});


colorInput.addEventListener("input", function() {
    checkColor.style.backgroundColor = colorInput.value;
});