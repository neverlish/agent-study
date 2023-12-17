var box = document.getElementById('box');

box.addEventListener('mousedown', mouseDownHandler);
box.addEventListener('mouseup', mouseUpHandler);

function mouseDownHandler(e) {
    box.style.backgroundColor = 'blue';
    box.style.cursor = 'grabbing';

    document.addEventListener('mousemove', mouseMoveHandler);
}

function mouseUpHandler(e) {
    box.style.backgroundColor = 'red';
    box.style.cursor = 'grab';

    document.removeEventListener('mousemove', mouseMoveHandler);
}

function mouseMoveHandler(e) {
    box.style.top = e.clientY + 'px';
    box.style.left = e.clientX + 'px';
}
