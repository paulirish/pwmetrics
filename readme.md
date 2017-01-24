

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


# --config        Provide configuration. See _Defining config_ below.
pwmetrics --config=your-own-file.js
pwmetrics --config


##
## CLI options useful for CI
##

# --expectations  Assert metrics results against provides values. See _Defining expectations_ below.
pwmetrics --expectations --config=your-own-file.js
pwmetrics --expectations

##
## CLI options useful for submittiing data to services
##

# --submit       Submit results to Google Sheets. See _Defining submit_ below.
pwmetrics --submit --config=your-own-file.js
pwmetrics --submit


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
  "flags": {
    // submit: true, // submit metrics
    // expectations: true // assert against the provided metric thresholds
  },
  "sheets": {
    // sheets configuration
  },
  "expectations": {
    // expectations configuration
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

*Instructions:*

- Copy [this spreadsheet](https://docs.google.com/spreadsheets/d/1k9ukQrxlnn8H8BB0tIJg5Q-_b4qhgB6dGxgc5d0Ibpo/edit).
- Copy the ID of the spreadsheet into the config as value of `sheets.options.spreadsheetId` property.
- Setup Google Developer project and get credentials. ([everything in step 1 here](https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name))
- Take a `client_secret` and put it into the config as value of `sheets.options.clientSecret` property.


```sh
# run pwmetrics with config in package.json
pwmetrics --submit
```

`package.json`
```json
...
  "pwmetrics": {
    "url": 'http://example.com/',
    "sheets": {
      "type": 'GOOGLE_SHEETS', // sheets service type. Available types: GOOGLE_SHEETS
      "options": {
        "spreadsheetId": "sheet-id",
        "tableName": "my-sheeet-table-name",
        "clientSecret": {
          // Data object. Can be get by (using everything in step 1 here)[https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name]
        }
      }
    }
  }
...
```


```sh
# run pwmetrics with config in your-own-file.js
pwmetrics --submit --config=your-own-file.js
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
        // Follow step 1 of https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name
        // Then paste resulting JSON payload as this clientSecret value
      }
    }
  }
}
```

#### Available metrics: 

 - `ttfcp` - First Contentful Paint
 - `ttfmp` - First Meaningful Paint
 - `psi` - Perceptual Speed Index
 - `fv` - First Visual Change
 - `vc` - Visually Complete 100%
 - `tti` - Time to Interactive
 - `vc85` - Visually Complete 85%


### Default Lighthouse options

 - `disableCpuThrottling` is set `false` by default. It means that CPU throttling `5x` is enabled. To turn it off, run `pwmetrcis http:example.com --disableCpuThrottling`


### API

```js
const PWMetrics = require('pwmetrics');

const pwMetrics = new PWMetrics('http://example.com/', opts);
pwMetrics.start(); // returns Promise

```

#### Options Parameter

**flags** [Object]

Feature flags. These are equal to CLI options. 
For example, if you want to get result in json format.

```js
const PWMetrics = require('pwmetrics');

const pwMetrics = new PWMetrics('http://example.com/', { flags: { json: true } });
pwMetrics.start();

```
 
*Default*: `{ disableCpuThrottling: false }`


**expectations** [Object]

Example: 

```js
const PWMetrics = require('pwmetrics');

const pwMetrics = new PWMetrics('http://example.com/', { 
  expectations: { 
    // expecations data 
  } 
});
pwMetrics.start();
```

See [Defining expectations](#defining-expectations) above.

*Default*: `{}`


**sheets** [Object]

Example: 

```js
const PWMetrics = require('pwmetrics');

const pwMetrics = new PWMetrics('http://example.com/', { 
  sheets: { 
    // sheets data 
  } 
});
pwMetrics.start();
```

See [Defining submit](#defining-submit) above.

*Default*: `{}`


### License

Apache 2.0. Google Inc.
