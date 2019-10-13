import { Range } from "./typings/Visualizer";

type Fn<T> = (range: Range) => T;
type FnNum<T> = (num: number) => T;

const getKey = ({ first, last }: Range) => `${first}-${last}`;

export const memoRange = <T>(fn: Fn<T>) => (range: Range) => {
  const cache = {};
  const key = getKey(range);
  return cache[key] ? cache[key] : ((cache[key] = fn(range)), cache[key]);
};

export const memoNumber = <T>(fn: FnNum<T>) => (num: number) => {
  const cache = {};
  return cache[num] ? cache[num] : (cache[num] = fn(num)), cache[num];
};
