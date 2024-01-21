class IntervalEdge {

    constructor(type, position, interval) {
      this.type = type;
      this.position = position;
      this.interval = interval;
    }

    static compare(a, b) {
  		if (a.position - b.position >= Number.EPSILON) return 1;
  		if (Math.abs(a.position - b.position) < Number.EPSILON) {
  			if (a.type === 'start' && b.type === 'end') return -1; // start je manji od kraja, prvo obradjujemo start
  			if (a.type === 'end' && b.type === 'start') return 1; // kraj je veci od pocetka

  			//oba starta ili oba enda
  			if (a.type === 'start') {
  				//oba start i jednaki su
            var x_deviation = a.interval.getParent().getTopx() - b.interval.getParent().getTopx();
  				var x_deviation_end = a.interval.getParent().getBottomx() - b.interval.getParent().getBottomx();
  				var pomres1 = 1;
  				var pomres0 = -1;

  				if (a.interval.getProjection() === 'left')
  				{
  					pomres1 = -1;
  					pomres0 = 1;
  				}
  				if (Math.abs(x_deviation) < Number.EPSILON){
  					//pocetci su jednaki, uporedi krajeve
  					if (x_deviation_end < 0){
  						return pomres0;
  					} else {
  						return pomres1;
  					}
  				} else {
  					if (x_deviation < 0){
  						return pomres0;
  					} else {
  						return pomres1;
  					}
  				}
  			}
  			//oba enda
  			return IntervalEdge.compare(a.interval.getStart(), b.interval.getStart()) * (-1);
  		}
  		return -1;
    }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position = position;
  }

  getType() {
    return this.type;
  }

  getInterval() {
    return this.interval;
  }
}
