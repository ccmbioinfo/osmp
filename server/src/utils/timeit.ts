// Wrapper factory functions for logging the execution time of functions.

import logger from '../logger';

type AnyFunction = (...args: any[]) => any;
type AnyAsyncFunction = (...args: any[]) => Promise<any>;

interface TimeitOptions {
  precision?: number; // between 0 and 9; number of decimal places for time
}

const DEFAULT_TIMEIT_OPTIONS: TimeitOptions = {
  precision: 4,
};

let timeitDepth = 0;

const formatExecTime = (
  execTime: [number, number],
  name: string,
  options: TimeitOptions,
  async?: boolean
): string => {
  const logString = `[${async ? 'async ' : ''}${name + ''}] ${execTime[0].toLocaleString()}${
    options && options.precision && options.precision > 0
      ? `.${execTime[1].toString().substring(0, options.precision)}`
      : ''
  }s (depth: ${timeitDepth})`;
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
 * const wrapped_slow_function = timeit("slow")(slow_function);  // wrapped_slow_function: (number) => number
 * wrapped_slow_function(0);  // returns 1
 * @param name Optional name to log alongside the function execution time.
 * @param options Other factory options, see TimeitOptions interface
 */
export const timeit = (name?: string, options?: TimeitOptions) => {
  const _options: TimeitOptions = {
    ...DEFAULT_TIMEIT_OPTIONS,
    ...options,
  };

  // https://stackoverflow.com/a/61212868 to preserve function type
  const timeitWrapper = <Func extends AnyFunction>(
    func: Func
  ): ((...args: Parameters<Func>) => ReturnType<Func>) => {
    const _name = name || func.name;

    const wrappedFunc = (...args: Parameters<Func>): ReturnType<Func> => {
      const t = process.hrtime();
      timeitDepth += 1;
      let result: ReturnType<Func>;
      try {
        result = func(...args); // call original function
      } catch (error) {
        const execTime = process.hrtime(t);
        logger.error(formatExecTime(execTime, _name, _options));
        timeitDepth -= 1;
        throw error;
      }
      const execTime = process.hrtime(t);
      logger.debug(formatExecTime(execTime, _name, _options));
      timeitDepth -= 1;
      return result;
    };

    return wrappedFunc;
  };

  return timeitWrapper;
};

/**
 * Return a wrapper function that logs the execution time of
 * an asynchronous function that it wraps.
 *
 * "Execution time" is considered the combined time it takes for
 * the original function to return a Promise, and for that Promise
 * to resolve.
 *
 * The parameter and return types of the original function are preserved in the
 * wrapped function.
 *
 * @example
 * const slow_function = async (num: number): number => {
 *   return setTimeout(() => num + 1, 1e5);
 * };
 * const wrapped_slow_function = timeitAsync("slow")(slow_function);  // wrapped_slow_function: async (number) => number
 * wrapped_slow_function(0).then(alert);  // alerts 1
 * @param name Optional name to log alongside the function execution time.
 * @param options Other factory options, see TimeitOptions interface
 */
export const timeitAsync = (name?: string, options?: TimeitOptions) => {
  const _options: TimeitOptions = {
    ...DEFAULT_TIMEIT_OPTIONS,
    ...options,
  };

  // https://stackoverflow.com/a/61212868 to preserve function type
  const timeitWrapper = <AsyncFunc extends AnyAsyncFunction>(
    func: AsyncFunc
  ): ((...args: Parameters<AsyncFunc>) => ReturnType<AsyncFunc>) => {
    const _name = name || func.name;

    // TS expects wrappedFunc to have return type Promise<T>,
    // but it's implied by ReturnType<AsyncFunc>
    // And we also don't use any weird custom promises https://github.com/microsoft/TypeScript/issues/35191#issuecomment-557230996
    // @ts-ignore: ts(1064)
    const wrappedFunc = async (...args: Parameters<AsyncFunc>): ReturnType<AsyncFunc> => {
      const t = process.hrtime();
      timeitDepth += 1;
      let result: ReturnType<AsyncFunc>;
      try {
        result = await func(...args); // call original function
      } catch (error) {
        const execTime = process.hrtime(t);
        logger.error(formatExecTime(execTime, _name, _options, true));
        timeitDepth -= 1;
        throw error;
      }
      const execTime = process.hrtime(t);
      logger.debug(formatExecTime(execTime, _name, _options, true));
      timeitDepth -= 1;
      return result;
    };

    return wrappedFunc;
  };

  return timeitWrapper;
};
