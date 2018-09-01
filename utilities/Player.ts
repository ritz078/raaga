import SoundFont from "soundfont-player";
import values from "just-values";
import {Note} from "./Recorder";

type _AudioNode = GainNode & {
	stop: () => void;
}

export default class Player {
  ac: AudioContext;
  player: {
  	play: (midiNumber: string) => _AudioNode;
  	schedule: (time: Date | number, notes: Note[]) => any;
	};
  activeAudioNodes: {
  	[key: string]: _AudioNode
	} = {};

  constructor() {
    this.ac = new AudioContext();
  }

  resumeAudio = () =>
    this.ac.state === "suspended" ? this.ac.resume() : Promise.resolve();

  load = (instrument: string, cb: any = () => {}) => {
  	this.stopAllNotes();
    SoundFont.instrument(this.ac, instrument).then(player => {
      this.player = player;
      cb(player);
    });
  };

  play = midiNumber => {
    this.resumeAudio().then(() => {
      const audioNode = this.player.play(midiNumber);
      this.activeAudioNodes = {
        ...this.activeAudioNodes,
        [midiNumber]: audioNode
      };
    });
  };

  stopNote = midiNumber => {
    this.resumeAudio().then(() => {
      if (!this.activeAudioNodes[midiNumber]) {
        return;
      }
      const audioNode = this.activeAudioNodes[midiNumber];
      audioNode.stop();
      this.activeAudioNodes = { ...this.activeAudioNodes, [midiNumber]: null };
    });
  };

	stopAllNotes = () => {
		this.ac.resume().then(() => {
			const activeAudioNodes = values(this.activeAudioNodes);
			activeAudioNodes.forEach((node) => {
				if (node) {
					node.stop();
				}
			});
			this.activeAudioNodes = {}
		});
	};

	scheduleNotes = (notes: Note[]) => {
		this.player.schedule(this.ac.currentTime, notes);
	}
}
