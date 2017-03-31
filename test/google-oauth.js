// Copyright 2016 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE
'use strict';

const path = require('path');
const fs = require('fs');

const GoogleOauth = require('../lib/oauth/google-oauth');

const mocks = require('./fixtures/mocks');

const mockedOauth2Client = {
  generateAuthUrl() {
    return 'http://mocked.url';
  }
};

describe('GoogleOauth', () => {
  let googleOauth;

  beforeEach(() => {
    googleOauth = new GoogleOauth();
    googleOauth.tokenDir = path.join(process.cwd(), 'tmp');
    googleOauth.tokenPath = path.join(googleOauth.tokenDir, 'test-oauth-token.json');
  });

  describe('authorize ', () => {
    describe('when token is absent', () => {
      let getNewTokenStub;

      beforeEach(() => {
        sinon.stub(googleOauth, 'getToken', () => {
          throw new Error('Token is absent');
        });
        getNewTokenStub = sinon.stub(googleOauth, 'getNewToken', async () => {});
      });

      afterEach(() => {
        googleOauth.getToken.restore();
        googleOauth.getNewToken.restore();
      });

      it('should get a new token', async() => {
        try {
          await googleOauth.authorize(mocks.googleOauthCredentials);
          expect(getNewTokenStub).to.have.been.calledOnce;
        } catch (error) {
          throw new Error(error);
        }
      });
    });

    describe('when token is present', () => {
      let getNewTokenSpy;

      beforeEach(() => {
        sinon.stub(googleOauth, 'getToken', () => mocks.googleOauthToken);
        getNewTokenSpy = sinon.spy(googleOauth, 'getNewToken');
      });

      afterEach(() => {
        googleOauth.getToken.restore();
        googleOauth.getNewToken.restore();
      });

      it('should not call getNewToken', async() => {
        try {
          await googleOauth.authorize(mocks.googleOauthCredentials);
          expect(getNewTokenSpy).to.have.not.been.called;
        } catch (error) {
          throw new Error(error);
        }
      });

      it('should return a token', async() => {
        try {
          const result = await googleOauth.authorize(mocks.googleOauthCredentials);
          expect(result.credentials.token).to.be.equal(mocks.googleOauthToken.token);
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
      readlineStub = sinon.stub(googleOauth, 'readline', async () => 'test-code');
      getOauth2ClientTokenStub = sinon.stub(googleOauth, 'getOauth2ClientToken', async () => mocks.googleOauthToken);
    });

    afterEach(() => {
      fs.unlinkSync(googleOauth.tokenPath);
      fs.rmdirSync(googleOauth.tokenDir);

      googleOauth.readline.restore();
      googleOauth.getOauth2ClientToken.restore();
    });

    it('should return credentials with a new token', async () => {
      try {
        const result = await googleOauth.getNewToken(mockedOauth2Client);
        expect(result.credentials.token).to.be.equal(mocks.googleOauthToken.token);
      } catch (e) {
        throw new Error(e);
      }
    });

    it('should store new token to the file', async () => {
      try {
        await googleOauth.getNewToken(mockedOauth2Client);
        const token = fs.readFileSync(googleOauth.tokenPath, 'utf8');
        expect(JSON.parse(token)).to.be.deep.equal(mocks.googleOauthToken);
      } catch (e) {
        throw new Error(e);
      }
    });
  });
});
