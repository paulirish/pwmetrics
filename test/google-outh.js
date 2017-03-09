// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const path = require('path');
const fs = require('fs');

const GoogleOuth = require('../lib/outh/google-outh');

const mocks = require('./fixtures/mocks');

const mockedOauth2Client = {
  generateAuthUrl() {
    return 'http://mocked.url';
  }
};

describe('GoogleOuth', () => {
  let googleOuth;

  beforeEach(() => {
    googleOuth = new GoogleOuth();
    googleOuth.tokenDir = path.join(process.cwd(), 'tmp');
    googleOuth.tokenPath = path.join(googleOuth.tokenDir, 'test-outh-token.json');
  });

  describe('authorize ', () => {
    describe('when token is absent', () => {
      let getNewTokenStub;

      beforeEach(() => {
        sinon.stub(googleOuth, 'getToken', () => {
          throw new Error('Token is absent');
        });
        getNewTokenStub = sinon.stub(googleOuth, 'getNewToken', async () => {});
      });

      afterEach(() => {
        googleOuth.getToken.restore();
        googleOuth.getNewToken.restore();
      });

      it('should get a new token', async() => {
        try {
          await googleOuth.authorize(mocks.googleOuthCredentials);
          expect(getNewTokenStub).to.have.been.calledOnce;
        } catch (error) {
          throw new Error(error);
        }
      });
    });

    describe('when token is present', () => {
      let getNewTokenSpy;

      beforeEach(() => {
        sinon.stub(googleOuth, 'getToken', () => mocks.googleOuthToken);
        getNewTokenSpy = sinon.spy(googleOuth, 'getNewToken');
      });

      afterEach(() => {
        googleOuth.getNewToken.restore();
      });

      it('should not call getNewToken', async() => {
        try {
          await googleOuth.authorize(mocks.googleOuthCredentials);
          expect(getNewTokenSpy).to.have.not.been.called;
        } catch (error) {
          throw new Error(error);
        }
      });

      it('should return a token', async() => {
        try {
          const result = await googleOuth.authorize(mocks.googleOuthCredentials);
          expect(result.credentials.token).to.be.equal(mocks.googleOuthToken.token);
        } catch (error) {
          throw new Error(error);
        }
      });
    });
  });

  describe('getNewToken', () => {
    let readlineStub;
    let getOauth2ClientTokenStub;

    beforeEach(() => {
      readlineStub = sinon.stub(googleOuth, 'readline', async () => 'test-code');
      getOauth2ClientTokenStub = sinon.stub(googleOuth, 'getOauth2ClientToken', async () => mocks.googleOuthToken);
    });

    afterEach(() => {
      fs.unlinkSync(googleOuth.tokenPath);
      fs.rmdirSync(googleOuth.tokenDir);

      googleOuth.readline.restore();
      googleOuth.getOauth2ClientToken.restore();
    });

    it('should return credentials with a new token', async () => {
      try {
        const result = await googleOuth.getNewToken(mockedOauth2Client);
        expect(result.credentials.token).to.be.equal(mocks.googleOuthToken.token);
      } catch (e) {
        throw new Error(e);
      }
    });

    it('should store new token to the file', async () => {
      try {
        await googleOuth.getNewToken(mockedOauth2Client);
        const token = fs.readFileSync(googleOuth.tokenPath, 'utf8');
        expect(JSON.parse(token)).to.be.deep.equal(mocks.googleOuthToken);
      } catch (e) {
        throw new Error(e);
      }
    });
  });
});
