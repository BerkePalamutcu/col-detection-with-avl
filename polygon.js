const MIN_DISTANCE = 10;
const WAIT_TIME = 1;
const WAIT_SHORTER_TIME = 2;
const COLOR_ACTIVE = '#00ff00';
const COLOR_HEAP_MIN = '#ff9900';
const COLOR_VISIBLE = '#ff3300';
const COLOR_REGULAR = '#000000';
const COLOR_PROCESED = '#a6a6a6';

class Polygon {

    constructor(projection) {
        this.projection = projection;
        this.startX = -1;
        this.startY = -1;
        this.lastX = -1;
        this.lastY = -1;
        this.polygonLines = []; // array of polygonLines
        this.intervalEdges = []; // array of intervalEdges
        this.visibleProjections = []; // array of intervals
        this.isClosed = false;
        this.heap = new AvlTree(Interval.compare);
    }

    addLine(x1, y1, x2, y2) {
        let polygonLine = new PolygonLine(x1, y1, x2, y2, this);
        this.polygonLines.push(polygonLine);
        this.intervalEdges.push(polygonLine.getProjection().getStart());
        this.intervalEdges.push(polygonLine.getProjection().getEnd());
        drawLine(x1, y1, x2, y2);
    }

    addPoint(x, y) {
        if (this.isClosed) {
            return false;
        }
        if (this.startX === -1 && this.startY === -1) {
            this.startX = x;
            this.startY = y;
            this.lastX = this.startX;
            this.lastY = this.startY;
            drawPoint(x, y);
            return true;
        }
        if (Polygon.distanceBetweenPoints(this.lastX, this.lastY, x, y) < MIN_DISTANCE) return true;
        if (Polygon.distanceBetweenPoints(this.startX, this.startY, x, y) < MIN_DISTANCE) {
            this.isClosed = true;
            x = this.startX;
            y = this.startY;
        }
        drawPoint(x, y);
        this.addLine(this.lastX, this.lastY, x, y);
        this.lastX = x;
        this.lastY = y;
        if (this.isClosed) {
            console.log("Closed");
            console.log(this.polygonLines);
        }
        return true;
    }

    static distanceBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    }

    getOrijentation() {
        return this.projection;
    }

    visibleIntervals() {
        let intervalEdge = this.intervalEdges[this.counter];
        intervalEdge.getInterval().getParent().setActive(true);
        let currPos = intervalEdge.getPosition();
        console.log("TRENUTNO:");
        console.log(intervalEdge);
        let minimumLine = null;
        if (!this.heap.isEmpty()) {
            minimumLine = this.heap.findMinimum().getParent();
        }

        let lastVisibleLine = null;
        if (this.visibleProjections.length > 0) {
            lastVisibleLine = this.visibleProjections[this.visibleProjections.length - 1].getParent();
        }

        console.log("minimumLine: ");
        console.log(minimumLine);
        console.log("lastVisibleLine: ");
        console.log(lastVisibleLine);
        console.log("last_interval_end: " + this.last_interval_end);

        if (minimumLine !== null && minimumLine === lastVisibleLine) {
            this.visibleProjections[this.visibleProjections.length - 1].getEnd().setPosition(currPos);
        } else if (this.last_interval_end != null &&
                    Math.abs(this.last_interval_end - intervalEdge.getPosition()) > Number.EPSILON) {
            this.visibleProjections.push(new Interval(this.last_interval_end, currPos, minimumLine));
        }

        if (intervalEdge.getType() === 'start') {
            this.heap.insert(intervalEdge.getInterval(), intervalEdge.getInterval());
        } else {
            this.heap.delete(intervalEdge.getInterval());
            intervalEdge.getInterval().getParent().setActive(false);
            intervalEdge.getInterval().getParent().setProcesed(true);
        }
        try {
            this.last_interval_end = this.visibleProjections[this.visibleProjections.length - 1].getEnd().getPosition();
        } catch (e) {
            this.last_interval_end = intervalEdge.getPosition();
        }
        this.counter = this.counter + 1;
        this.repaint();
        if (this.counter < this.intervalEdges.length) {
            console.log("CEKAAAAM");
            return false;
        }
        return true;
    }

    repaint() {
        this._repaintLines();
        this._repaintVisibleIntervals();
        this._repaintPoints();
    }

    _repaintLines() {
        let color = '';
        this.polygonLines.forEach((line) => {
            if (line.isActive()) {
                color = COLOR_ACTIVE;
            } else {
                if (line.isProcesed()) {
                    color = COLOR_PROCESED;
                } else {
                    color = COLOR_REGULAR;
                }
            }
            if (!this.heap.isEmpty() && line === this.heap.findMinimum().getParent()) {
                color = COLOR_HEAP_MIN;
            }
            drawLine(line.startX, line.startY, line.endX, line.endY, color);
        });
    }

    _repaintVisibleIntervals() {
        this.visibleProjections.forEach((line) => {
            drawLine(line.parent.getXForY(line.start.getPosition()), line.start.getPosition(),
                line.parent.getXForY(line.end.getPosition()), line.end.getPosition(),
                COLOR_VISIBLE);
        });
    }

    _repaintPoints() {
        this._repaintLastActivePoint();
        if (this.counter < this.intervalEdges.length) {
            this.drawIntervalEdge(this.intervalEdges[this.counter], COLOR_ACTIVE);
        }
    }

    _repaintLastActivePoint() {
        if (this.counter === 0) return;
        let lastIntervalEdge = this.intervalEdges[this.counter - 1];
        this.drawIntervalEdge(lastIntervalEdge, COLOR_PROCESED);
    }

    drawIntervalEdge(intervalEdge, color = 'black') {
        let polygonLine = intervalEdge.getInterval().getParent();
        let x = -1, y = -1;
        if (intervalEdge.position === polygonLine.startY) {
            x = polygonLine.startX;
            y = polygonLine.startY;
        } else {
            x = polygonLine.endX;
            y = polygonLine.endY;
        }
        drawPoint(x, y, color);
    }

    findInterval(y) {
        if (this.visibleProjections.length === 0) return null;
        var top = 0;
        var bottom = this.visibleProjections.length - 1;
        while (top <= bottom) {
            let mid = Math.round((bottom + top) / 2);
            let currentInterval = this.visibleProjections[mid];
            let result = currentInterval.contains(y);
            if (result === 0) return currentInterval;
            if (result < 0) {
                bottom = mid - 1; // u gornjoj polovini
            } else {
                top = mid + 1; // u donjoj polovini
            }
        }
        return null;
    }
}
