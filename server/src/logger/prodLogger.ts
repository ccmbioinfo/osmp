import { format, createLogger, transports } from 'Winston';

const { timestamp, combine, errors } = format;

const buildProdLogger = () => {
  return createLogger({
    format: combine(timestamp(), errors({ stack: true }), format.json()),
    defaultMeta: { service: 'user-service' },
    transports: [new transports.Console()],
  });
};

export default buildProdLogger;
