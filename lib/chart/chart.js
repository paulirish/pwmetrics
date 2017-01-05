// manual tests are located here:
// https://github.com/samccone/cli-chart/tree/master/test

var Bar = require('./bar');

var defaults = {
  xlabel: null,
  ylabel: null,
  width: 80,
  height: 40,
  step: 4,
  lmargin: 10,
  direction: 'y',
  xmin: 0,
  ymin: 0
};

var Chart = module.exports = function(config) {
  var charm = this.charm = config.charm;
  if (!charm) {
    charm = this.charm = require('charm')(process);
    this.charm.on('^C', process.exit);
  }
  this.xlabel = config.xlabel;
  this.ylabel = config.ylabel;
  this.direction = config.direction || defaults.direction;
  this.width = config.width || defaults.width;
  this.height = config.height || defaults.height;
  this.lmargin = config.lmargin || defaults.lmargin;
  this.step = config.step || defaults.step;
  this.bars = [];
  this.xmin = config.xmin || defaults.xmin;
  this.xmax = config.xmax || this.width;
  this.ymin = config.ymin || defaults.ymin;
  this.ymax = config.ymax || this.height;
  this.max_size = 0;
  this.max_bound = config.maxBound;
};

Chart.prototype.bucketize = function(data, min, max) {
  var numBuckets = 0;
  if (this.direction === 'x') {
    numBuckets = Math.floor(this.height/this.step);
  } else {
    numBuckets = Math.floor(this.width/this.step);
  }
  data.sort(function(a, b) {
    return a - b;
  });
  if (!max) max = data[data.length-1];
  if (!min) min = data[0];
  var bucketWidth = (max - min)/numBuckets;
  var size = 0;
  var bucket_ct = 0;
  var i = 0;
  for (var j = 0; j < numBuckets; j++) {
    while (data[i] < min+bucketWidth*(j+1)) {
      size++;
      i++;
    }
    var opts = {size: size};
    this.addBar(opts);
    size = 0;
  }
};

Chart.prototype.addBar = function(opts) {
  if (arguments.length === 2) {
    opts = {size: arguments[0], color: arguments[1]};
  } else if (typeof opts === 'number') {
    opts = {size: opts};
  }
  if (opts.size > this.max_size) this.max_size = opts.size;
  this.bars.push(new Bar(this, opts));
  return this;
};

Chart.prototype.drawAxes = function() {
  var charm = this.charm;
  var i = 0;
    // draw y axis
  for (i = 0; i < this.height; i++) {
    charm.write('\n');
    charm.right(this.lmargin);
    charm.write('|');
  }

    // At the bottom of the terminal weird things happen with vertical spacing.
    // Scroll a couple lines down then come back up before drawing the bottom axis
  charm.write('\n\n');
  charm.up(2);
  charm.right(this.lmargin+1);
        // The cursor is now at the origin of the graph

    // draw x axis
  charm.push();

  charm.write('\n');
  charm.right(this.lmargin);
  for (i = this.lmargin-1; i < this.width+this.lmargin-1; i++) {
    charm.write('-');
  }
  charm.pop();
};

Chart.prototype.labelAxes = function() {
  var charm = this.charm;
    // label y axis
  if (this.ylabel) {
    charm.push();
    var yminstr = String(this.ymin);
    charm.left(yminstr.length+2);
    charm.write(yminstr);
        // move all the way to the left of the screen on the x axis
    charm.left(this.lmargin-2);

        // move half way up the y axis
    charm.up(this.height/2);
    charm.write(this.ylabel);
    charm.up(this.height/2);

        // move to the top of the y axis
    var ymaxstr = this.direction === 'y' ? String(this.max_size) : String(this.ymax);
    charm.left(ymaxstr.length);
    charm.write(ymaxstr);
    charm.pop();
  }

    // label x axis
  if (this.xlabel) {
    charm.push();
    charm.write('\n\n');
    charm.right(this.lmargin+1);
    charm.write(String(this.xmin));
    charm.right(this.width/2 - String(this.xmin).length);
    charm.write(this.xlabel);
    charm.right(this.width/2 - this.xlabel.length);
    var xmaxstr = this.direction === 'x' ? String(this.max_bound || this.max_size) : String(this.xmax);
    charm.write(xmaxstr);
    charm.pop();
  }
};

Chart.prototype.drawBars = function() {
    // set scale based on max_size
  if (this.direction === 'x') {
    this.scale = this.width/(this.max_bound || this.max_size);
  } else {
    this.scale = this.height/(this.max_bound || this.max_size);
  }

  var charm = this.charm;
  for (var i = 0; i < this.bars.length; i++) {
    if (this.direction === 'x') {
      if (i !== 0) charm.up(this.step);
    } else if (i !== 0) charm.right(this.step);
    charm.push();
    this.bars[i].draw(this.scale);
    charm.pop();
  }
  if (this.direction === 'x') charm.down(this.step*this.bars.length+1);
  charm.write('\n\n\n');
  if (this.direction === 'y') charm.write('\n');
};

Chart.prototype.draw = function() {
  this.drawAxes();
  this.labelAxes();
  this.drawBars();
  this.charm.write('\n\n');
};
