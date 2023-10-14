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

// Carregar imagem
imageLoader.addEventListener('change', handleImage, false);

function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        targetImage.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

targetImage.addEventListener('dragstart', function(e) {
    e.preventDefault();
});

// Exibir coordenadas
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

// Seleção de área
let isSelecting = false;
let initialX, initialY;

imageContainer.addEventListener('mousedown', function(e) {
    if (e.target === captureButton) {
        return; // Se o botão de captura for clicado, não faça nada.
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

imageContainer.addEventListener('mouseup', function() {
    isSelecting = false;
});

imageContainer.addEventListener('click', function(e) {
    const rect = imageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Criar uma div para exibir as coordenadas
    const coordDiv = document.createElement('div');
    coordDiv.classList.add('clicked-coordinate');
    coordDiv.textContent = `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;

    // Posicionar a div no local do clique
    coordDiv.style.left = x + 'px';
    coordDiv.style.top = y + 'px';

    // Adicionar a div ao imageContainer
    imageContainer.appendChild(coordDiv);
});


// Salvar seleção como PNG
captureButton.addEventListener('click', function() {
    const rect = targetImage.getBoundingClientRect();
    const selectionRect = selectionBox.getBoundingClientRect();

    const x = Math.max(0, selectionRect.left - rect.left);
    const y = Math.max(0, selectionRect.top - rect.top);
    const width = Math.min(rect.right, selectionRect.right) - Math.max(rect.left, selectionRect.left);
    const height = Math.min(rect.bottom, selectionRect.bottom) - Math.max(rect.top, selectionRect.top);

    if (width <= 0 || height <= 0) {
        alert('Please select a valid area.');
        return;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetImage.width;
    tempCanvas.height = targetImage.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.drawImage(targetImage, 0, 0, targetImage.width, targetImage.height);
    
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = height;
    const finalCtx = finalCanvas.getContext('2d');
    
    finalCtx.drawImage(tempCanvas, x, y, width, height, 0, 0, width, height);

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
