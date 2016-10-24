

# pwmetrics

> Progressive web metrics at your fingertipz. 💅

CLI tool and lib to gather performance metrics via [Lighthouse](https://github.com/GoogleChrome/lighthouse/). _IN BETA_.

![image](https://cloud.githubusercontent.com/assets/39191/19417867/7aead922-93af-11e6-88ec-917dad6e89d2.png)

 Documentation on these metrics in the works. If you hit bugs in the metrics collection, report at [Lighthouse issues](https://github.com/GoogleChrome/lighthouse/issues).

### Install [![NPM pwmetrics package](https://img.shields.io/npm/v/pwmetrics.svg)](https://npmjs.org/package/pwmetrics)
```sh
$ npm install --global pwmetrics
# or
$ npm install --save pwmetrics
```


### CLI Usage

```sh
# run pwmetrics with your url
pwmetrics http://goat.com
```

#### Options

```sh
# --runs=n     Does n runs (eg. 3, 5), and reports the median run's numbers.
#              Median run selected by run with the median TTI.
pwmetrics http://goat.com --runs=3


# --json       Reports json details to stdout.
pwmetrics --json http://goat.com

# returns...
# {runs: [{
#   "timings": [
#     {
#       "name": "First Contentful Paint",
#       "value": 289.642
#     },
#     {
#       "name": "First Meaningful Paint",
#       "value": 289.6
#     },
#     ...
```

### API

```js
const PWMetrics = require('pwmetrics');

new PWMetrics('http://bubbles.com', opts);
```


### License

Apache 2.0. Google Inc.
