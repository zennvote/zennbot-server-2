import { ConsoleLogger, Injectable } from '@nestjs/common';
import { isString } from 'class-validator';
import * as winston from 'winston';

@Injectable()
export class MainLogger extends ConsoleLogger {
  private winstonLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log', level: 'debug' }),
    ],
  });

  log(original: any, ...optionalParams: any[]) {
    const { context, messages } = this.getContextAndMessages([original, ...optionalParams]);
    const [message, ...meta] = messages;
    super.log(original, ...optionalParams);
    this.winstonLogger.info(`${message}`, { context, meta });
  }

  error(original: any, ...optionalParams: any[]) {
    const { context, messages } = this.getContextAndMessages([original, ...optionalParams]);
    const [message, ...meta] = messages;
    super.error(original, ...optionalParams);
    this.winstonLogger.error(`${message}`, { context, meta });
  }

  http(original: any, ...optionalParams: any[]) {
    const { context, messages } = this.getContextAndMessages([original, ...optionalParams]);
    const [message, ...meta] = messages;
    this.winstonLogger.http(`${message}`, { context, meta });
  }

  warn(original: any, ...optionalParams: any[]) {
    const { context, messages } = this.getContextAndMessages([original, ...optionalParams]);
    const [message, ...meta] = messages;
    super.warn(original, ...optionalParams);
    this.winstonLogger.warn(`${message}`, { context, meta });
  }

  debug(original: any, ...optionalParams: any[]) {
    const { context, messages } = this.getContextAndMessages([original, ...optionalParams]);
    const [message, ...meta] = messages;
    super.debug(original, ...optionalParams);
    this.winstonLogger.debug(`${message}`, { context, meta });
  }

  verbose(original: any, ...optionalParams: any[]) {
    const { context, messages } = this.getContextAndMessages([original, ...optionalParams]);
    const [message, ...meta] = messages;
    super.verbose(original, ...optionalParams);
    this.winstonLogger.verbose(`${message}`, { context, meta });
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
