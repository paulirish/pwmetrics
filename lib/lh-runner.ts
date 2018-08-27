// Copyright 2018 Google Inc. All Rights Reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE

const lighthouse = require('lighthouse/lighthouse-core');
const parseChromeFlags = require('lighthouse/lighthouse-cli/run').parseChromeFlags;
import {launch, LaunchedChrome} from 'chrome-launcher';
import Logger from './utils/logger';
import {FeatureFlags} from '../types/types';
import {getMessage} from './utils/messages';

const perfConfig: any = require('./perf-config');
const MAX_LIGHTHOUSE_TRIES = 2;

export class LHRunner {
  launcher: LaunchedChrome;
  tryLighthouseCounter: number;
  logger: any;

  //@todo improve FeatureFlags -> LHFlags
  constructor(public url: string, public flags: FeatureFlags) {
    this.tryLighthouseCounter = 0;
    this.logger = Logger.getInstance({showOutput: this.flags.showOutput});
  }

  async run(): Promise<LH.RunnerResult> {
    try {
      let lhResults: LH.RunnerResult;
      await this.launchChrome();

      if (process.env.CI) {
        // handling CRI_TIMEOUT issue - https://github.com/GoogleChrome/lighthouse/issues/833
        this.tryLighthouseCounter = 0;
        lhResults = await this.runLighthouseOnCI().then((lhResults: LH.RunnerResult) => {
          // fix for https://github.com/paulirish/pwmetrics/issues/63
          return new Promise<LH.RunnerResult>(resolve => {
            console.log(getMessage('WAITING'));
            setTimeout(_ => {
              return resolve(lhResults);
            }, 2000);
          });
        });
      } else {
        lhResults = await lighthouse(this.url, this.flags, perfConfig);
      }

      await this.killLauncher();

      return lhResults;
    } catch (error) {
      await this.killLauncher();
      throw error;
    }
  }

  async killLauncher() {
    if (typeof this.launcher !== 'undefined') {
      await this.launcher!.kill();
    }
  }

  async runLighthouseOnCI(): Promise<LH.RunnerResult> {
    try {
      return await lighthouse(this.url, this.flags, perfConfig);
    } catch (error) {
      if (error.code === 'CRI_TIMEOUT' && this.tryLighthouseCounter <= MAX_LIGHTHOUSE_TRIES) {
        return await this.retryLighthouseOnCI();
      }

      if (this.tryLighthouseCounter > MAX_LIGHTHOUSE_TRIES) {
        throw new Error(getMessage('CRI_TIMEOUT_REJECT'));
      }
    }
  }

  async retryLighthouseOnCI(): Promise<LH.RunnerResult> {
    this.tryLighthouseCounter++;
    console.log(getMessage('CRI_TIMEOUT_RELAUNCH'));

    try {
      return await this.runLighthouseOnCI();
    } catch (error) {
      console.error(error.message);
      console.error(getMessage('CLOSING_CHROME'));
      await this.killLauncher();
    }
  }

  async launchChrome(): Promise<LaunchedChrome | Error> {
    try {
      console.log(getMessage('LAUNCHING_CHROME'));
      this.launcher = await launch({
        port: this.flags.port,
        chromeFlags: parseChromeFlags(this.flags.chromeFlags),
        chromePath: this.flags.chromePath
      });
      this.flags.port = this.launcher.port;
      return this.launcher;
    } catch (error) {
      console.error(error);
      await this.killLauncher();
      return error;
    }
  }
}
