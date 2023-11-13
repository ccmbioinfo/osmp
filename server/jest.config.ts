import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testEnvironment: 'node',
  testRegex: '\\.(test)\\.(ts|tsx|js)$',
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  verbose: true,
  moduleNameMapper: {
    axios: '<rootDir>/node_modules/axios/dist/node/axios.cjs',
  }
};

export default config;
