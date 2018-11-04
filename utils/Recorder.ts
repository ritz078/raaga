import { Note } from "midiconvert";
import Tone from "tone";

export default class Recorder {
  private notes: Partial<Note>[] = [];
  private baseTime;
  private isRecording = false;

  private getPlayingNoteIndex = (midiNumber: number) =>
    this.notes.findIndex(note => note.midi === midiNumber && !note.duration);

  private startRecording = () => {
    this.isRecording = true;
    this.resetRecorder();
  };

  private stopRecording = (): Partial<Note>[] => {
    this.isRecording = false;
    const notes = this.notes;
    this.resetRecorder();
    return notes;
  };

  private resetRecorder = () => {
    this.baseTime = Date.now() / 1000;
    this.notes = [];
  };

  public startNote = (note: number) => {
    if (!this.isRecording) return;
    this.notes.push({
      midi: note,
      name: Tone.Frequency(note, "midi").toNote(),
      time: Date.now() / 1000 - this.baseTime
    });
  };

  public endNote = (midiNumber: number) => {
    if (!this.isRecording) return;
    const index = this.getPlayingNoteIndex(midiNumber);
    this.notes[index].duration =
      Date.now() / 1000 - this.baseTime - this.notes[index].time;
  };

  public toggleRecorder = () =>
    this.isRecording ? this.stopRecording() : this.startRecording();
}
