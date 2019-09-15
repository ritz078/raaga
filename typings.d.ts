declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.svg" {
  const value: any;
  export default value;
  export const ReactComponent: any;
}

declare module "@workers/midiload.worker" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module "@workers/canvas.worker" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module "@workers/loadInstrument.worker" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module "@workers/midiParse.worker" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module "@workers/testCanvasSupport.worker" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare const IN_BROWSER: boolean;
declare const IS_DEV: boolean;
