class Interval {
  constructor(y1, y2, parent) {
    if (y1 > y2) {
      let pom = y1;
      y1 = y2;
      y2 = pom;
    }
    this.start = new IntervalEdge('start', y1, this);
    this.end = new IntervalEdge('end', y2, this);
    this.parent = parent;
    this.projection = null;
  }

  contains(queryPoint) {
    if (this.start.getPosition() - queryPoint > Number.EPSILON)
      // start is below v
      return -1;
    if (this.end.getPosition() - queryPoint < -Number.EPSILON)
      // end is iznad v
      return 1;
    return 0;
  }

  static compare(a, b) {
    console.log('a');
    console.log(a);
    console.log('b');
    console.log(b);

    if (a === b) {
      console.log('A === B');
      return 0;
    }

    var res1 = 1;
    var res0 = -1;
    var x = -1;
    var deviation = -1;
    if (a.projection === 'left') {
      res1 = -1;
      res0 = 1;
    }

    if (a.contains(b.getStart().getPosition()) === 0) {
      console.log('a sadrzi b.start');
      x = a.parent.getXForY(b.getStart().getPosition());
      deviation = x - b.getParent().getTopx();
      if (deviation < -0.001) {
        console.log(res1 + '**');
        return res1;
      }
      if (deviation > 0.001) {
        console.log(res0 + '**');
        return res0;
      }
    }
    if (a.contains(b.getEnd().getPosition()) === 0) {
      console.log('a sadrzi b.end');
      x = a.parent.getXForY(b.getEnd().getPosition());
      deviation = x - b.getParent().getBottomx();
      if (deviation < -0.001) {
        console.log(res1 + '***');
        return res1;
      }
      if (deviation > 0.001) {
        console.log(res0 + '***');
        return res0;
      }
    }
    if (b.contains(a.getStart().getPosition()) === 0) {
      console.log('b sadrzi a.start');
      x = b.parent.getXForY(a.getStart().getPosition());
      deviation = x - a.getParent().getTopx();
      if (deviation < -0.001) {
        console.log(res0 + '****');
        return res0;
      }
      if (deviation > 0.001) {
        console.log(res1 + '****');
        return res1;
      }
    }
    if (b.contains(a.getEnd().getPosition()) === 0) {
      console.log('b sadrzi a.end');
      x = b.parent.getXForY(a.getEnd().getPosition());
      deviation = x - a.getParent().getBottomx();
      if (deviation < -0.001) {
        console.log(res0 + '*****');
        return res0;
      }
      if (deviation > 0.001) {
        console.log(res1 + '*****');
        return res1;
      }
    }
    if (a.end.getPosition() - b.end.getPosition() > 0.01) {
      console.log(res0 + '-');
      return res0;
    }
    return res1;
  }

  getProjection() {
    return this.projection;
  }

  getParent() {
    return this.parent;
  }

  setProjection(projection) {
    this.projection = projection;
  }

  getStart() {
    return this.start;
  }

  getEnd() {
    return this.end;
  }
}
