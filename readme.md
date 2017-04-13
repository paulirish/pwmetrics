
<h1 align="center">pwmetrics</h1>
<p align="center">
  <img title="Progressive web metrics" src='https://cloud.githubusercontent.com/assets/6231516/22849188/6f84c038-f003-11e6-8990-b14f3b916e54.png' />
</p>
<p align="center">Progressive web metrics at your fingertipz. 💅</p>
<p align="center">CLI tool and lib to gather performance metrics via <a href="https://github.com/GoogleChrome/lighthouse/">Lighthouse</a>. <i>IN BETA</i>.</p>

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

# --json       Reports json details to stdout.
pwmetrics http://example.com/ --json

# --output-path       File path to save results.
pwmetrics http://example.com/ --output-path='pathToFile/file.json'


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
pwmetrics --config=pwmetrics-config.js
pwmetrics --config

# --submit       Submit results to Google Sheets. See _Defining submit_ below.
pwmetrics --submit --config=pwmetrics-config.js
pwmetrics --submit

# --upload       Upload Lighthouse traces to Google Drive. See _Defining upload_ below.
pwmetrics --upload --config=pwmetrics-config.js
pwmetrics --upload

# --view       View Lighthouse traces, which were uploaded to Google Drive, in DevTools. See _Defining view_ below.
pwmetrics --view --config=pwmetrics-config.js
pwmetrics --view

##
## CLI options useful for CI
##

# --expectations  Assert metrics results against provides values. See _Defining expectations_ below.
pwmetrics --expectations --config=pwmetrics-config.js
pwmetrics --expectations


```

### Defining config

```sh
# run pwmetrics with config in package.json
pwmetrics --config
```

`package.json`
```
...
  "pwmetrics": {
    "url": "http://example.com/",
    // other configuration options
  }
...
```

```sh
# run pwmetrics with config in pwmetrics-config.js
pwmetrics --config=pwmetrics-config.js
```

`pwmetrics-config.js`

```js
module.exports = {
  url: 'http://example.com/',
   // other configuration options. Read _All available configuration options_
}
```

### All available configuration options

`pwmetrics-config.js`

```js
module.exports = {
  url: 'http://example.com/',
  flags: { // AKA feature flags 
    runs: '3', // number or runs
    json: true, // print all data in json format to console
    outputPath: 'pathToFile/fileName.json', //path to file where results will be saved
    submit: true, // trurn on submitting to Google Sheets
    upload: true, // trurn on uploading to Google Drive
    view: true, // open uploaded traces to Google Drive in DevTools    
    expectations: true // trurn on assertation metrics results against provides values   
  },
  expectations: {
    // these expectations values are examples, for your cases set your own
    // it's not required to use all metrics, you can use just a few of them
    // Read _Available metrics_ where all keys are defined
    ttfcp: {
      warn: '>=1500',
      error: '>=2000'
    },
    ttfmp: {
      warn: '>=2000',
      error: '>=3000'
    },
    fv: {
      ...
    },
    psi: {
      ...
    },
    vc85: {
      ...
    },
    vs100: {
      ...
    },
    tti: {
      ...
    }
  },
  sheets: {
    type: 'GOOGLE_SHEETS', // sheets service type. Available types: GOOGLE_SHEETS
    options: {
      spreadsheetId: 'sheet_id',
      tableName: 'data'
    }
  },
  clientSecret: {
    // Data object. Can be get 
    // eithr 
    // by (using everything in step 1 here)[https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name]
    // or
    // by (using everything in step 1 here)[https://developers.google.com/drive/v3/web/quickstart/nodejs]
  }
}
```

### Defining expectations

> [Recipes](/recipes) for using with CI

```sh
# run pwmetrics with config in package.json
pwmetrics --expectations
```

`package.json`
```json
...
  "pwmetrics": {
    "url": "http://example.com/",
    "flags": {
      "expectations": true
    }
    "expectations": {
      ...
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
  flags: {
    expectations: true
  },
  expectations: {
    ...
  }
}
```

### Defining submit

Submit results to Google Sheets

*Instructions:*

- Copy [this spreadsheet](https://docs.google.com/spreadsheets/d/1k9ukQrxlnn8H8BB0tIJg5Q-_b4qhgB6dGxgc5d0Ibpo/edit).
- Copy the ID of the spreadsheet into the config as value of `sheets.options.spreadsheetId` property.
- Setup Google Developer project and get credentials. ([everything in step 1 here](https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the_api_name))
- Take a `client_secret` and put it into the config as value of `clientSecret` property.


```sh
# run pwmetrics with config in package.json
pwmetrics --submit
```

`package.json`
```
...
  "pwmetrics": {
    "url": "http://example.com/",
    "sheets": {
      ...
    }
    "clientSecret": {
      ...
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
    ...
  },
  clientSecret: {
    ...
  }
}
```

### Defining upload

Upload Lighthouse traces to Google Drive

*Instructions:*

- Setup Google Developer project and get credentials. ([everything in step 1 here](https://developers.google.com/drive/v3/web/quickstart/nodejs))
- Take a `client_secret` and put it into the config as value of `clientSecret` property.


```sh
# run pwmetrics with config in package.json
pwmetrics --upload
```

`package.json`
```
...
  "pwmetrics": {
    "url": "http://example.com/",
    "clientSecret": {
      ...
    }
  }
...
```


```sh
# run pwmetrics with config in your-own-file.js
pwmetrics --upload --config=your-own-file.js
```

`your-own-file.js`
```js
module.exports = {
  url: 'http://example.com/',
  clientSecret: {
    ...
  }
}
```

### View Lighthouse traces in timeline-viewer

Show Lighthouse traces in timeline-viewer.

> Required to use `upload` flag

[timeline-viewer](https://chromedevtools.github.io/timeline-viewer/) - Shareable URLs for your Chrome DevTools Timeline traces.


```sh
# run pwmetrics with config in package.json
pwmetrics --upload --view
```

`package.json`
```
...
  "pwmetrics": {
    "url": 'http://example.com/',
    "clientSecret": {
      ...
    }
  }
...
```


```sh
# run pwmetrics with config in your-own-file.js
pwmetrics --upload --view --config=your-own-file.js
```

`your-own-file.js`
```js
module.exports = {
  url: 'http://example.com/',
  clientSecret: {
    ...
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

 - `disableCpuThrottling` is set `false` by default. It means that CPU throttling `5x` is enabled. To turn it off, run `pwmetrics http:example.com --disableCpuThrottling`


### API

```js
const PWMetrics = require('pwmetrics');

const pwMetrics = new PWMetrics('http://example.com/', opts); // [All available configuration options](#all-available-configuration-options) can be used as `opts` 
pwMetrics.start(); // returns Promise

```

#### Options Parameter

**flags** [Object]

Feature flags. These are equal to CLI options. 
For example, if you want to get a result in json format.

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


**clientSecret** [Object]

*Default*: `{}`


### Recipes

- [gulp](/recipes/gulp/gulpfile.js)


### License

Apache 2.0. Google Inc.
