import { LoggerOptions} from '../../types/types';

class Logger {
  static options: LoggerOptions = {
    showOutput: true
  }
  private static instance: Logger;

  constructor() {}

  static getInstance(options: LoggerOptions = null) {
    Logger.options = options || Logger.options;
    Logger.instance = Logger.instance || new Logger();
    return Logger.instance;
  }

  log(...args: any[]) {
    if(Logger.options.showOutput){
      console.log(...args);
    }
  }

  error(...args: any[]) {
    if(Logger.options.showOutput){
      console.error(...args);
    }
  }
}

module.exports = Logger;