var defaults = {
    color: 'blue'
};

var Bar = module.exports = function(chart, opts) {
    this.chart = chart;
    this.size = opts.size;
    this.color = opts.color || defaults.color;
    this.label = opts.label;
};

Bar.prototype.draw = function(scale) {
    var charm = this.chart.charm;
    var dir = this.chart.direction;
    if (dir === 'x' && this.label) {
	charm.push();
	charm.left(this.label.length+2);
	charm.write(this.label);
	charm.pop();
    }
    charm.background(this.color);
    for (var i = 0; i < Math.round(this.size*scale); i++) {
        if (dir === 'x') {
            charm.write(' ');
        } else {
            charm.write(' ');
            charm.left(1);
            charm.up(1);
        }
    }
    charm.display('reset');
};