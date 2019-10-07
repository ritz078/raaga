import { Range } from "./typings/Visualizer";

type Fn<T> = (range: Range) => T;

const getKey = ({ first, last }: Range) => `${first}-${last}`;

const memo = <T>(fn: Fn<T>) => (range: Range) => {
  const cache = {};
  const key = getKey(range);
  return cache[key] ? cache[key] : ((cache[key] = fn(range)), cache[key]);
};

export default memo;
