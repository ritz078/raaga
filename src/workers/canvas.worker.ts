import { controlVisualizer } from "@utils/visualizerControl";

self.onmessage = e => {
  controlVisualizer(e.data);
};
