// Wrapper factory functions for logging the execution time of functions.

import logger from '../logger';

type AnyFunction = (...args: any[]) => any;

interface TimeitOptions {
  precision?: number;
}

const DEFAULT_TIMEIT_OPTIONS: TimeitOptions = {
  precision: 4,
};

const formatExecTime = (
  execTime: [number, number],
  name: string,
  options: TimeitOptions
): string => {
  const logString = `[${name}] t: ${execTime[0].toLocaleString()}${
    options && options.precision && options.precision > 0
      ? `.${execTime[1].toLocaleString().substring(0, options.precision)}`
      : ''
  }`;
  return logString;
};

/**
 * Return a wrapper function that logs the execution time of a function it wraps.
 *
 * The parameter and return types of the original function are preserved in the
 * wrapped function.
 *
 * @example
 * const slow_function = (num: number): number => {
 *   // ...
 *   return num + 1;
 * };
 * const wrapped_slow_function = timeit("slow_function")(slow_function);  // wrapped_slow_function: (number) => number
 * wrapped_slow_function(0);  // returns 1
 * @param name Optional name to log alongside the function execution time.
 * @param options Other factory options, see TimeitOptions interface
 */
export const timeit = (name?: string, options?: TimeitOptions) => {
  // Executes when the factory is called and the wrapper is created.
  const _options: TimeitOptions = {
    ...DEFAULT_TIMEIT_OPTIONS,
    ...options,
  };

  // https://stackoverflow.com/a/61212868
  return <Func extends AnyFunction>(
    func: Func
  ): ((...args: Parameters<Func>) => ReturnType<Func>) => {
    // Executes when a function is wrapped.
    const _name = name ? name : func.name;

    const wrapped_func = (...args: Parameters<Func>): ReturnType<Func> => {
      // Executes when the wrapped function is called.
      const t = process.hrtime();
      var result: ReturnType<Func>; // original function
      try {
        result = func(...args);
      } catch (error) {
        const execTime = process.hrtime(t);
        logger.error(formatExecTime(execTime, _name, _options));
        throw error;
      }
      const execTime = process.hrtime(t);
      logger.debug(formatExecTime(execTime, _name, _options));
      return result;
    };

    return wrapped_func;
  };
};
