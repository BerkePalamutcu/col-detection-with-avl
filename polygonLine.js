class PolygonLine {

    constructor(x1, y1, x2, y2, polygon) {
        this.startX = x1;
        this.startY = y1;
        this.endX = x2;
        this.endY = y2;
        if (y2 < y1) {
            this.topx = x2;
            this.bottomx = x1;
        } else {
            this.topx = x1;
            this.bottomx = x2;
        }
        this.projection = new Interval(this.startY, this.endY, this);
        this.projection.setProjection(polygon.getOrijentation());
        this.active = false;
        this.procesed = false;
    }

    getXForY(y) {
        if (Math.abs(this.startX - this.endX) < Number.EPSILON) {
            return this.startX;
        }
        var k = (this.endY - this.startY) / (this.endX - this.startX);
        var n = this.startY - k * this.startX;
        return (y - n) / k;
    }

    isActive() {
      return this.active;
    }

    setActive(bool) {
      this.active = bool;
    }

    setProcesed(bool) {
      this.procesed = bool;
    }

    isProcesed() {
      return this.procesed;
    }

    getTopx() {
        return this.topx;
    }

    getBottomx() {
        return this.bottomx;
    }

    getProjection() {
        return this.projection;
    }
}
