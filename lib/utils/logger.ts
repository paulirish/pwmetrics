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

  log(msg: any, ...args: any[]) {
    if(Logger.options.showOutput){
      console.log(msg, ...args);
    }
  }

  error(msg: any, ...args: any[]) {
    if(Logger.options.showOutput){
      console.error(msg, ...args);
    }
  }
}

module.exports = Logger;