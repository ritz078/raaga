const fakeRAF = fn => setTimeout(fn, 8);

const updateLoop = fn => {
  let lastRunTimestamp = 0;
  let timeoutPointer: NodeJS.Timer;
  let accumulatedTime = 0;
  const timeStep = 1000 / 30;

  const run = () => {
    timeoutPointer = fakeRAF(run);

    const now = performance.now();
    accumulatedTime += now - lastRunTimestamp;
    if (accumulatedTime >= timeStep * 3) {
      accumulatedTime = timeStep;
    }

    while (accumulatedTime >= timeStep) {
      accumulatedTime -= timeStep;
      fn();
    }
  };

  return {
    start() {
      accumulatedTime = timeStep;
      lastRunTimestamp = performance.now();
      timeoutPointer = fakeRAF(run);
    },
    stop() {
      clearTimeout(timeoutPointer);
    }
  };
};

export default updateLoop;
