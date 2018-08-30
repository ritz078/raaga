import * as React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import { pianoWrapperStyle } from "./styles/Piano.styles";

const firstNote = MidiNumbers.fromNote("c3");
const lastNote = MidiNumbers.fromNote("f6");

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

const noteRange= { first: firstNote, last: lastNote }

export default class extends React.PureComponent<{}> {
  state = {
    notes: []
  };

  handleAdd = (midiNumber: number) => {
    const set = new Set(this.state.notes);
    set.add(midiNumber);
    this.setState({
      notes: [...set]
    });
  };

  handleRemove = (midiNumber: number) => {
    const set = new Set(this.state.notes);
    set.delete(midiNumber);
    this.setState({
      notes: [...set]
    });
  };

  render() {
    return (
      <div className={pianoWrapperStyle}>
        <div
          style={{
            height: 10,
            backgroundColor: "#000",
            opacity: 0.8
          }}
        />
        <Piano
          noteRange={noteRange}
          onPlayNote={this.handleAdd}
          onStopNote={this.handleRemove}
          keyboardShortcuts={keyboardShortcuts}
          playbackNotes={this.state.notes}
        />
      </div>
    );
  }
}
