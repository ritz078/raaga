import { controlVisualizer } from "@utils/visualizerControl";
import { expose } from "comlink";

self.onmessage = e => {
  controlVisualizer(e.data);
};

expose(controlVisualizer);
