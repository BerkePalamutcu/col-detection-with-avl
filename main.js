const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.style.position = 'fixed';
window.addEventListener('resize', resize);
document.addEventListener('click', addPoint);
document.body.style.margin = 0;
resize();

var polygonOnLeft = new Polygon('right'); // right projecion, left position
var polygonOnRight = new Polygon('left');
var minDist = Number.MAX_VALUE;
var counter = 0;
var bestLine = [-1, -1, -1, -1];
let polygonsData = null;

function addPoint(e) {
    if (!polygonOnLeft.addPoint(e.clientX, e.clientY)) {
        if (!polygonOnRight.addPoint(e.clientX, e.clientY)) {
            solve();
        }
    }
}

function solve() {
    polygonOnLeft.intervalEdges.sort(IntervalEdge.compare);
    polygonOnLeft.counter = 0;
    polygonOnRight.intervalEdges.sort(IntervalEdge.compare);
    polygonOnRight.counter = 0;

    let findProjectionsOnLeft = setInterval(() => {
        let finishOnLeft = polygonOnLeft.visibleIntervals();
        if (finishOnLeft) {
            clearInterval(findProjectionsOnLeft);
            let findProjectionsOnRight = setInterval(() => {
                let finishOnRight = polygonOnRight.visibleIntervals();
                if (finishOnRight) {
                    clearInterval(findProjectionsOnRight);
                    // return;
                    polygonsData = context.getImageData(0, 0, canvas.width, canvas.height);
                    let checkLinesFromLeft = setInterval(() => {
                        let finishLeft = checkLines(polygonOnLeft, polygonOnRight);
                        if (finishLeft) {
                            clearInterval(checkLinesFromLeft);
                            counter = 0;
                            let checkLinesFromRight = setInterval(() => {
                                let finishRight = checkLines(polygonOnRight, polygonOnLeft);
                                if (finishRight) {
                                    clearInterval(checkLinesFromRight);
                                    counter = 0;
                                    let final = setInterval(() => {
                                        finalDrawing();
                                        clearInterval(final);
                                    }, 1000);

                                }
                            }, 1000 * WAIT_SHORTER_TIME);
                        }
                    }, 1000 * WAIT_SHORTER_TIME);
                }
            }, 1000 * WAIT_TIME);
        }
    }, 1000 * WAIT_TIME);
}

function checkLines(polygon1, polygon2) {
    let line = polygon1.polygonLines[counter];
    let interval = polygon2.findInterval(line.startY);
    checkRes(line, interval);
    counter = counter + 1;
    return counter >= polygon1.polygonLines.length;
}

function checkRes(line, interval) {
    context.putImageData(polygonsData, 0, 0);
    drawLine(bestLine[0], bestLine[1], bestLine[2], bestLine[3], 'green');
    drawPoint(bestLine[0], bestLine[1], 'green');

    if (interval == null) {
        let borderX = canvas.width;
        if(line.projection.getProjection() === 'left') {
            borderX = 0;
        }
        drawLine(line.startX, line.startY, borderX, line.startY, 'blue');
        drawPoint(line.startX, line.startY, 'blue');
        return;
    }

    let x = interval.getParent().getXForY(line.startY);
    let dist = Math.abs(x - line.startX);

    drawLine(line.startX, line.startY, x, line.startY, 'blue');
    drawPoint(line.startX, line.startY, 'blue');

    if (dist < minDist) {
        minDist = dist;
        bestLine[0] = line.startX;
        bestLine[1] = line.startY;
        bestLine[2] = x;
        bestLine[3] = line.startY;
    }
}

function drawPoint(x, y, color = 'black') {
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.arc(x, y, 3, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
    context.stroke();
}

function finalDrawing() {
    context.putImageData(polygonsData, 0, 0);
    if(bestLine[0] !== -1) {
        drawLine(bestLine[0], bestLine[1], bestLine[2], bestLine[3], 'green');
        drawPoint(bestLine[0], bestLine[1], 'green');
        return;
    }
    console.log("*** BRAVO, NEMA KOLIZIJE ***");
}

function drawLine(x0, y0, x1, y1, color = 'black') {
    context.beginPath();
    context.lineWidth = 3;
    context.strokeStyle = color;
    context.translate(.5, .5);
    context.moveTo(x0, y0); // from
    context.lineTo(x1, y1); // to

    context.stroke(); // draw it!
    context.setTransform(1, 0, 0, 1, 0, 0);
    // context.translate(-0.5, -0.5);
}

// resize canvas
function resize() {
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;
}
