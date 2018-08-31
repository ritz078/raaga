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

const noteRange= { first: firstNote, last: lastNote };

export default class extends React.PureComponent {
  state = {
    notes: []
  };

  handleAdd = (midiNumber: number, prevNotes: number[]) => {
    this.setState({
      notes: [midiNumber, ...prevNotes]
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
