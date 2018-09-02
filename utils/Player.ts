import SoundFont from "soundfont-player";
import values from "just-values";
import Recorder from "./Recorder";
import {ActiveAudioNotes, PlayerInstance} from "./typings/Player";
import {Note} from "./typings/Recorder";

export default class Player {
  private ac = new AudioContext();
  private recorder: Recorder;
  private player: PlayerInstance;
  private activeAudioNodes: ActiveAudioNotes = {};

  constructor (recorder: Recorder) {
  	this.recorder = recorder;
	}

  private resumeAudio = () =>
    this.ac.state === "suspended" ? this.ac.resume() : Promise.resolve();

  public load = (instrument: string, cb: any = () => {}) => {
    this.stopAllNotes();
    this.recorder.resetRecorder();
    SoundFont.instrument(this.ac, instrument).then(player => {
      this.player = player;
      cb(player);
    });
  };

  public play = midiNumber => {
    this.resumeAudio().then(() => {
    	this.recorder.startNote(midiNumber);
      const audioNode = this.player.play(midiNumber);
      this.activeAudioNodes = {
        ...this.activeAudioNodes,
        [midiNumber]: audioNode
      };
    });
  };

  public stopNote = midiNumber => {
    this.resumeAudio().then(() => {
    	this.recorder.endNote(midiNumber);
      if (!this.activeAudioNodes[midiNumber]) {
        return;
      }
      const audioNode = this.activeAudioNodes[midiNumber];
      audioNode.stop();
      this.activeAudioNodes = { ...this.activeAudioNodes, [midiNumber]: null };
    });
  };

  public stopAllNotes = () => {
    this.ac.resume().then(() => {
    	this.recorder.resetRecorder();
      const activeAudioNodes = values(this.activeAudioNodes);
      activeAudioNodes.forEach(node => {
        if (node) {
          node.stop();
        }
      });
      this.activeAudioNodes = {};
    });
  };

  public scheduleNotes = (notes: Note[]) => {
    this.player.schedule(this.ac.currentTime, notes);
  };
}
