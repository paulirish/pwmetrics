// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const GSheets = require('../lib/sheets/gsheets').GSheets;
const Sheets = require('../lib/sheets').Sheets;

const {getMessage} = require('../lib/utils/messages');
const runOptions = require('./fixtures/run-options');
const {metricsResults, sheetsResponse, valuesToAppend} = require('./fixtures/mocks');

/* eslint-env mocha */
describe('Sheets', () => {
  let sheets;

  beforeEach(() => {
    sheets = new Sheets(runOptions.sheets, runOptions.clientSecret);
  });

  describe('validateOptions', () => {
    it('should throw an Error if config was not passed as parameter', () => {
      expect((_ => sheets.validateOptions()))
        .to.throw(getMessage('NO_GOOGLE_SHEET_OPTIONS'));
    });

    it('should throw an Error if config is empty', () => {
      expect((_ => sheets.validateOptions({})))
        .to.throw(getMessage('NO_GOOGLE_SHEET_OPTIONS'));
    });

    it('should throw an Error if type is wrong', () => {
      expect((_ => sheets.validateOptions( {type: 'WRONG_TYPE', options: runOptions.sheets.options} )))
        .to.throw(getMessage('NO_SHEET_TYPE', 'WRONG_TYPE'));
    });

    it('should throw an Error if one of require options are missed', () => {
      expect((_ => sheets.validateOptions({
        type: runOptions.sheets.type,
        options: {
          tableName: 'data'
        },
        clientSecret: {}
      }))).to.throw(getMessage('NO_GOOGLE_SHEET_OPTIONS'));

      expect((_ => sheets.validateOptions({
        type: runOptions.sheets.type,
        options: {
          spreadsheetId: '123456'
        },
        clientSecret: {}
      }))).to.throw(getMessage('NO_GOOGLE_SHEET_OPTIONS'));

      expect((_ => sheets.validateOptions({
        type: runOptions.sheets.type,
        options: {
          spreadsheetId: '123456',
          tableName: 'data',
        }
      }))).to.throw(getMessage('NO_GOOGLE_SHEET_OPTIONS'));
    });
  });

  describe('appendResults', () => {
    beforeEach(() => {
      sinon.stub(sheets, 'appendResultsToGSheets', () => {});
    });

    it('should call "appendResultsToGSheets" method', () => {
      sheets.appendResults({});
      expect(sheets.appendResultsToGSheets).to.have.been.calledWith({});
    });

    afterEach(() => {
      sheets.appendResultsToGSheets.restore();
    });
  });

  describe('appendResultsToGSheets', () => {

  });

  describe('gSheets', () => {
    let oauthStub;
    let spy;

    beforeEach(() => {
      oauthStub = sinon.stub(sheets, 'getOauth', () => {
        return 'oauth';
      });
      sinon.stub(GSheets.prototype, 'sendResultsToGoogle', () => sheetsResponse);
      spy = sinon.stub(GSheets.prototype, 'getRange', () => valuesToAppend);
    });

    afterEach(() => {
      oauthStub.restore();
    });

    it('should at least consider running', async() => {
      sheets.appendResults(metricsResults);
      sinon.assert.calledOnce(spy);
    });
  });
});
