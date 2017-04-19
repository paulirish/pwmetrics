'use strict';

const defaults = {
  color: 'blue'
};

const Bar = module.exports = function(chart, opts) {
  this.chart = chart;
  this.size = opts.size;
  this.color = opts.color || defaults.color;
  this.label = opts.label;
  this.barLabel = opts.barLabel;
};

Bar.prototype.draw = function(scale) {
  const charm = this.chart.charm;
  const dir = this.chart.direction;
  if (dir === 'x' && this.label) {
    charm.push(true);
    charm.left(this.label.length+2);
    charm.write(this.label);
    charm.pop(true);
  }
  charm.background(this.color);
  for (let i = 0; i < Math.round(this.size*scale); i++) {
    if (dir === 'x') {
      charm.write(' ');
    } else {
      charm.write(' ');
      charm.left(1);
      charm.up(1);
    }
  }
  charm.display('reset');

  if (this.barLabel) {
    charm.write(' ' + this.barLabel);
  }
};
