

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
# --runs=n     Does n runs (eg. 3, 5), and reports the median run's numbers.
#              Median run selected by run with the median TTI.
pwmetrics http://example.com/ --runs=3

# --submit     Submits results to a google spreadsheet (requires some setup)
pwmetrics http://goat.com --submit

# --json       Reports json details to stdout.
pwmetrics --json http://example.com/

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

# --config        Defines configurations.

pwmetrics --config
# uses configurations from packages.json

pwmetrics --config=your-own-file.js
# uses path to your own file

# Useful for CI
# --expectations       Expectations from metrics results. Compares Lighthouse metrics with set expectations. Requires config.

pwmetrics --expectations
# uses configurations from packages.json

pwmetrics --expectations --config=your-own-file.js
# uses path to your own file

# Usefull for analytics
# --submit       Flag which allow submit results to sheets. Right now it's just [Google Sheets](https://www.google.com/sheets/about/).

pwmetrics --submit
# uses configurations from packages.json

pwmetrics --submit --config=your-own-file.js
# uses path to your own file

```

### Defining config

```sh
# run pwmetrics with config in package.json
pwmetrics --config
```

`package.json`
```json
...
  "pwmetrics": {
    "url": "http://example.com/",
    "sheets": {
      // sheets configurations
    },
    "expectations": {
      // expectations configurations
    }
  }
...
```

```sh
# run pwmetrics with config in your-own-file.js
pwmetrics --config=your-own-file.js
```

`your-own-file.js`

```js
module.exports = {
  "url": "http://example.com/",
  "sheets": {
    // sheets configurations
  },
  "expectations": {
    // expectations configurations
  }
}
```

### Defining expectations

```sh
# run pwmetrics with config in package.json
pwmetrics --expectations
```

`package.json`
```json
...
  "pwmetrics": {
    "url": "http://example.com/",
    "expectations": {
      "metrics": {
        "ttfmp": {
          "warn": ">=3000",
          "error": ">=5000"
        },
        "psi": {
          "warn": ">=1500",
          "error": ">=3200"
        }
      }
    }
  }
...
```


```sh
# run pwmetrics with config in your-own-file.js
pwmetrics --expectations --config=your-own-file.js
```

`your-own-file.js`
```js
module.exports = {
  url: 'http://example.com/',
  expectations: {
    metrics: {
      ttfmp: {
        warn: '>=3000',
        error: '>=5000'
      },
      psi: {
        warn: '>=1500',
        error: '>=3200'
      }
    }
  }
}

```

### Defining submit

```sh
# run pwmetrics with config in package.json
pwmetrics --submit
```

`package.json`
```json
...
  "pwmetrics": {
    url: 'http://example.com/',
    sheets: {
      type: 'GOOGLE_SHEETS', // sheets service type. Available types: GOOGLE_SHEETS
      options: {
        spreadsheetId: 'sheet-id',
        tableName: 'my-sheeet-table-name',
        clientSecret: {
          // Data object. Can be get by (using everything in step 1 here)[https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name]  
        }
      }
    }
  }
...
```


```sh
# run pwmetrics with config in your-own-file.js
pwmetrics --expectations --config=your-own-file.js
```

`your-own-file.js`
```js
module.exports = {
  url: 'http://example.com/',
  sheets: {
    type: 'GOOGLE_SHEETS', // sheets service type. Available types: GOOGLE_SHEETS
    options: {
      spreadsheetId: 'sheet-id',
      tableName: 'my-sheeet-table-name',
      clientSecret: {
        // Data object. Can be get by (using everything in step 1 here)[https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name]  
      }
    }
  }
}

```


### API

```js
const PWMetrics = require('pwmetrics');

new PWMetrics('http://example.com/', opts);
```


### License

Apache 2.0. Google Inc.
