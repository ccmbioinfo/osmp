import { format, createLogger, transports } from 'winston';

const { timestamp, combine, printf, errors } = format;

const buildDevLogger = () => {
  const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  });

  return createLogger({
    format: combine(
      format.colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
    transports: [new transports.Console()],
    level: 'debug',
    /* One can customize the error files outputted by using the configuration below
    transports: [
        transports.File({
          filename: 'combined.log',
          level: 'info'
        }),
        transports.File({
          filename: 'errors.log',
          level: 'error'
        })
      ]
    */
  });
};

export default buildDevLogger;
