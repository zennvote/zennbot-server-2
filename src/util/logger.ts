import { ConsoleLogger, Injectable } from '@nestjs/common';
import { isString } from 'class-validator';
import * as winston from 'winston';

type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug';

@Injectable()
export class MainLogger extends ConsoleLogger {
  private winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log', level: 'debug' }),
    ],
  });

  log(message: any, ...params: any[]) {
    super.log(message, ...params);
    this.printLog('info', message, ...params);
  }

  error(message: any, ...params: any[]) {
    super.error(message, ...params);
    this.printLog('error', message, ...params);
  }

  http(message: any, ...params: any[]) {
    this.printLog('http', message, ...params);
  }

  warn(message: any, ...params: any[]) {
    super.warn(message, ...params);
    this.printLog('warn', message, ...params);
  }

  debug(message: any, ...params: any[]) {
    super.debug(message, ...params);
    this.printLog('debug', message, ...params);
  }

  verbose(message: any, ...params: any[]) {
    super.verbose(message, ...params);
    this.printLog('verbose', message, ...params);
  }

  private printLog(level: LogLevel, originalMessage: any, ...params: any[]) {
    const { context, messages } = this.getContextAndMessages([originalMessage, ...params]);
    const [message, ...meta] = messages;
    const time = new Date();
    const timeString = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    this.winstonLogger[level](`${timeString} : ${message}`, { context, meta, time });
  }

  private getContextAndMessages(args: unknown[]) {
    if (args?.length <= 1) {
      return { messages: args, context: this.context };
    }
    const lastElement = args[args.length - 1];
    const isContext = isString(lastElement);
    if (!isContext) {
      return { messages: args, context: this.context };
    }
    return {
      context: lastElement as string,
      messages: args.slice(0, args.length - 1),
    };
  }
}
