import {Note} from "./typings/Recorder";

export default class Recorder {
  private notes: Note[] = [];
  private baseTime;
  private isRecording = false;

  private getPlayingNoteIndex = (midiNumber: number) =>
    this.notes.findIndex(note => note.note === midiNumber && !note.duration);

  public startRecording = () => {
    this.isRecording = true;
    this.resetRecorder();
  };

  public stopRecording = (): Note[] => {
    this.isRecording = false;
    const notes = this.notes;
    this.resetRecorder();
    return notes;
  };

  public resetRecorder = () => {
    this.baseTime = Date.now() / 1000;
    this.notes = [];
  };

  public startNote = (note: number) => {
    if (!this.isRecording) return;
    this.notes.push({
      note,
      time: Date.now() / 1000 - this.baseTime
    });
  };

  public endNote = (midiNumber: number) => {
    if (!this.isRecording) return;
    const index = this.getPlayingNoteIndex(midiNumber);
    this.notes[index].duration =
      Date.now() / 1000 - this.baseTime - this.notes[index].time;
  };
}
