"use strict";
(function() {

  function Point (inX, inY){

    function isNumber(numb) {
      return numb !== null && typeof numb === "number" && !isNaN(numb) && numb !== Infinity;
    }

    var x = inX;
    var y = inY;

    if(inX instanceof Object){
      x = inX.x;
      y = inX.y;
    }

    if (!isNumber(x) || !isNumber(y)) {
      throw new Error('invalid input parameter');
    }

    this.x = x;
    this.y = y;
  }

  Point.prototype.toString = function() {
    var coord = this.getCoord();
    return '(' + coord.x + ',' + coord.y + ')';
  };

  Point.prototype.isSVG = function() {
    function inSVG(numb) {
      return numb >= 0 && numb <= 400;
    }
    return inSVG(this.x) && inSVG(this.y);
  };

  Point.prototype.equal = function(point) {
    if (!(point instanceof Point)){
      throw new Error ('input parameter is not Point');
    }
    return point.x === this.x && point.y === this.y;
  };

  Point.prototype.getCoord = function() {
    return { x: Math.round(this.x), y: Math.round(this.y) };
  };

  Point.prototype.onSegment = function(segment) {
    if(!(segment instanceof Segment)) {
      throw new Error('input parameter is not Segment');
    }
    var start = segment.s;
    var end = segment.e;
    var from = this;

    function dist2(v, w) {
      return Math.pow((v.x - w.x), 2) + Math.pow((v.y - w.y), 2)
    }

    function distToSegmentSquared(pnt, strt, fnsh) {
      var dst2 = dist2(strt, fnsh);
      if (dst2 === 0) {
        return dist2(pnt, strt);
      }
      var t = ((pnt.x - strt.x) * (fnsh.x - strt.x) + (pnt.y - strt.y) * (fnsh.y - strt.y)) / dst2;
      t = Math.max(0, Math.min(1, t));
      return dist2(pnt, { x: strt.x + t * (fnsh.x - strt.x),
                          y: strt.y + t * (fnsh.y - strt.y) });
    }

    var precision = Math.pow(10, -3);
    var distance = Math.sqrt(distToSegmentSquared(from, start, end)) ;

    return distance < precision;
  };

  function Segment(start, end) {
    if(!(start instanceof Point) || !(end instanceof Point)){
      throw new Error ('input parameter is not Point');
    }
    if(start.equal(end)){
      throw new Error ('start is the same with end');
    }
    this.s = start;
    this.e = end;
  }

  Segment.prototype.toString = function() {
    return '[' + this.s + ',' + this.e + ']';
  };

  Segment.prototype.getCoords = function() {
    return { s: this.s.getCoord(), e: this.e.getCoord() };
  };

  Segment.prototype.intersect = function(segment){
    if(!(segment instanceof Segment)) {
      throw new Error('input parameter is not Segment');
    }

    var s1 = this;
    var s2 = segment;

    var n = ((s2.e.y - s2.s.y) * (s1.e.x - s1.s.x) - (s2.e.x - s2.s.x) * (s1.e.y - s1.s.y));
    if (n === 0) {
      return null;
    }

    var m = ((s2.e.x - s2.s.x) * (s1.s.y - s2.s.y) - (s2.e.y - s2.s.y) * (s1.s.x - s2.s.x));
    var Ua = m / n;

    var x = s1.s.x + Ua * (s1.e.x - s1.s.x);
    var y = s1.s.y + Ua * (s1.e.y - s1.s.y);
    var intPoint = new Point(x, y);

    //if (s1._hasPoint(intPoint) && s2._hasPoint(intPoint)) {
    //  return intPoint;
    //}

    if (intPoint.onSegment(s1) && intPoint.onSegment(s2)) {
      return intPoint;
    }

    return null;

  };

  Segment.prototype.onSegment = function(segment){
    if(!(segment instanceof Segment)) {
      throw new Error('input parameter is not Segment');
    }
    return this.s.onSegment(segment) && this.e.onSegment(segment);
  };

  Segment.prototype.getMidPoint = function(){
    var x = (this.s.x + this.e.x) / 2;
    var y = (this.s.y + this.e.y) / 2;
    return new Point(x, y);
  };

  Segment.prototype.getNextSegment = function(segments){
    if (segments.some(segm => !(segm instanceof Segment))) {
      throw new Error('input parameter is not Segment');
    }
    var resSegment = segments.filter(segm => this.e.equal(segm.s) || this.e.equal(segm.e));
    if (resSegment.length === 0) {
      return null;
    }
    resSegment = segments.splice(segments.indexOf(resSegment[0]), 1)[0];
    if (!resSegment.s.equal(this.e)) {
      resSegment = new Segment(resSegment.e, resSegment.s);
    }
    return resSegment;
  };

  function Polygon(arrayPointsOrSegments){
    var input = arrayPointsOrSegments;
    if (input === null || !(input instanceof Array)) {
      throw new Error('invalid input parameter');
    }
    if (input.some(el => el === null)) {
      throw new Error('empty input parameter');
    }
    var isPoints = input.every(el => el instanceof Point);
    var isSegments = input.every(el => el instanceof Segment);
    if (!isPoints && !isSegments) {
      throw new Error('input is not a Point or Segment');
    }

    if (isPoints) {
      this.points = input;
      this.createSegments();
    }

    if (isSegments) {
      this.segments = input;
      var until = this.segments.length;
      for(var i = 0; i < until; i++){
        if(!this.segments[i].e.equal(this.segments[ (i < until - 1) ? (i + 1) : 0].s)){
          throw new Error('polygon is not closed');
        }
      }
      this.points = input.map(segm => segm.s);
    }

    if (this.points.length < 3){
      throw new Error('points should be more than two');
    }

    if (!this.points.every(point => point.isSVG())){
      throw new Error('the Point is not SVG point');
    }
  }

  Polygon.prototype.createSegments = function() {
    this.segments = this.points.reduce((result, point, i, array) => {
      result.push(new Segment(point, array[i < array.length-1 ? i+1 : 0]));
      return result;
    } , []);
  };

  Polygon.prototype.getCoords = function() {
    return this.points.map(el => el.getCoord());
  };

  Polygon.prototype.intersects = function(polygon) {
    if (!(polygon instanceof Polygon)) {
      throw new Error('input parameter is not Polygon');
    }

    var f = this;
    var s = polygon;

    var intersPoints = f.getIntersectPoints(s);
    if (!intersPoints) {
      if (f.hasPolygon(s)) {
        return [s.getCoords()];
      }
      if (s.hasPolygon(f)) {
        return [f.getCoords()];
      }
      return [];
    }

    var polygons = f.getInnerPolygons(s);

    return polygons.map(pol => pol.getCoords());

  };

  Polygon.prototype.intersectWithoutTouch = function(segment) {
    if (!(segment instanceof Segment)) {
      throw new Error('input parameter is not Segment');
    }
    var intersectWithSegm = this.segments.filter(segm => segm.intersect(segment));
    if (intersectWithSegm.length === 0) {
      return false;
    }
    var startOnBorder = intersectWithSegm.some(segm => segment.s.onSegment(segm));
    var endOnBorder = intersectWithSegm.some(segm => segment.e.onSegment(segm));
    var result = !startOnBorder && !endOnBorder;
    return !startOnBorder && !endOnBorder;
  };

  Polygon.prototype.hasOnBorder = function(segment) {
    if (!(segment instanceof Segment)) {
      throw new Error('input parameter is not Segment');
    }
    return this.segments.some(segm => segment.onSegment(segm));
  };

  Polygon.prototype.hasPoint = function(point) {
    var basePoint1 = new Point(-1, -10);
    var basePoint2 = new Point(-10, -1);
    var newPoint = point;
    if(!(point instanceof Point)){
      throw new Error('input parameter is not Point');
    }
    if (!point.isSVG()) {
      throw new Error ('the point is not SVG Point');
    }
    if (this.segments.some(segm => point.onSegment(segm))) {
      return true;
    }

    var newSegment1 = new Segment(basePoint1, newPoint);
    var newSegment2 = new Segment(basePoint2, newPoint);
    var intersects1 = this.segments.map(segm => segm.intersect(newSegment1)).filter(el => el);
    var intersects2 = this.segments.map(segm => segm.intersect(newSegment2)).filter(el => el);
    var intersectCount1 = intersects1.length === 0 ? 0 : new PolygonPointsBuilder(intersects1).getUniquePoints().length;
    var intersectCount2 = intersects2.length === 0 ? 0 : new PolygonPointsBuilder(intersects2).getUniquePoints().length;
    return (intersectCount1 % 2 !== 0) || (intersectCount2 % 2 !== 0);
  };

  Polygon.prototype.hasPolygon = function(polygon) {
    if(!(polygon instanceof Point)){
      throw new Error ('invalid input parameter');
    }
    return polygon.points.every(point => this.hasPoint(point));
  };

  Polygon.prototype.getIntersectPoints = function(polygon) {
    if (!(polygon instanceof Polygon)) {
      throw new Error('input parameter is not Polygon');
    }



    var intersects = [];
    var firsts = this.segments;
    var seconds = polygon.segments;

    for(var i = 0; i < firsts.length; i++){
      for(var j = 0; j < seconds.length; j++){
        var intersPoint = firsts[i].intersect(seconds[j]);
        if (intersPoint) {
          intersects.push(intersPoint);
        }
      }
    }

    intersects = new PolygonPointsBuilder(intersects).getUniquePoints();

    if (intersects.length > 1) {
      return intersects;
    }

    return null;
  };

  Polygon.prototype.getPointsIn = function(polygon) {
    if (!(polygon instanceof Polygon)) {
      throw new Error('input parameter is not Polygon');
    }
    return this.points.filter(point => polygon.hasPoint(point));
  };

  Polygon.prototype.getSegmentsWith = function(points, polygon) {
    if (points.some(point => !(point instanceof Point))) {
      throw new Error('input parameter is not Polygon');
    }
    if (!(polygon instanceof Polygon)) {
      throw new Error('input parameter is not Polygon');
    }
    var first = this;
    var second = polygon;
    var newSegments = [];

    for (var i = 0; i < points.length; i++) {
      for (var j = i+1; j < points.length; j++) {
        var segm = new Segment(points[i], points[j]);
        if (first.hasOnBorder(segm) && second.hasPoint(segm.getMidPoint()) && !first.intersectWithoutTouch(segm)) {
          newSegments.push(segm);
        }
      }
    }
    return newSegments;
  };

  Polygon.prototype.getInnerPolygons = function(polygon) {
    if (!(polygon instanceof Polygon)) {
      throw new Error('input parameter is not Polygon');
    }
    var polygons = [];

    var first = this;
    var second = polygon;

    var intersPoints = first.getIntersectPoints(second);
    var firstInSecond = first.getPointsIn(second);
    var secondInFirst = second.getPointsIn(first);

    var firstPoints = new PolygonPointsBuilder(intersPoints.concat(firstInSecond)).getUniquePoints();
    var secondPoints = new PolygonPointsBuilder(intersPoints.concat(secondInFirst)).getUniquePoints();

    var firstSegments = first.getSegmentsWith(firstPoints, second);
    var secondSegments = second.getSegmentsWith(secondPoints, first);

    var newSegments = firstSegments.concat(secondSegments);

    while (newSegments.length > 0) {
      var buildPolygon = new PolygonSegmentsBuilder(newSegments);
      polygons.push(buildPolygon.getPolygon());
    }

    return polygons;
  };

  function PolygonSegmentsBuilder(segments) {
    if (!segments.every(el => el instanceof Segment)) {
      throw new Error('input is not a Segment');
    }

    this.segmentsBuffer = [];

    var start = segments.shift();
    this.segmentsBuffer.push(start);

    var current = start.getNextSegment(segments);
    while(current) {
      this.segmentsBuffer.push(current);
      current = current.getNextSegment(segments);
    }
  }

  PolygonSegmentsBuilder.prototype.getPolygon = function() {
    return new Polygon(this.segmentsBuffer);
  };

  function PolygonPointsBuilder(points) {
    if (!points.every(el => el instanceof Point)) {
      throw new Error('input is not a Point');
    }

    function deleteDuplicate(points) {
      var result = [];
      while(points.length > 0) {
        var point = points.pop();
        if (!points.some(el => el.equal(point))) {
          result.push(point)
        }
      }
      return result;
    }
    this.points = deleteDuplicate(points);

  }

  PolygonPointsBuilder.prototype.getUniquePoints = function() {
    return this.points;
  };

  PolygonPointsBuilder.prototype.getPolygon = function() {
    return new Polygon(this.points);
  };

  function intersects(fig1, fig2) {
    var first = new Polygon(fig1.map(el => new Point(el)));
    var second = new Polygon(fig2.map(el => new Point(el)));
    return first.intersects(second);
  }

  window.intersects = intersects;
})();






/*
[
  [
    { x: 60,  y: 240 },
    { x: 90,  y: 240 },
    { x: 120, y: 180 },
    { x: 90,  y: 90  },
    { x: 60,  y: 150 },
  ],
  [
    { x: 270, y: 240 },
    { x: 300, y: 240 },
    { x: 300, y: 150 },
    { x: 270, y: 90  },
    { x: 240, y: 180 },
  ],
  [
    { x: 150, y: 180 },
    { x: 180, y: 240 },
    { x: 210, y: 180 },
    { x: 210, y: 90  },
    { x: 180, y: 60  },
    { x: 150, y: 90  }
  ]
]*/
