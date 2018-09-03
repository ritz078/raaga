import * as React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano-fork";
import {
  loaderClass,
  piano,
  pianoWrapperClass,
  wrapper
} from "./styles/Piano.styles";
import SoundPlayer from "@components/SoundPlayer";
import { Loader, colors } from "@anarock/pebble";
import { css, cx } from "emotion";

const firstNote = MidiNumbers.fromNote("c3");
const lastNote = MidiNumbers.fromNote("c6");

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

const noteRange = { first: firstNote, last: lastNote };

export default class extends React.PureComponent {
  state = {
    notes: undefined
  };

  renderNoteLabel = () => {
    return null;
  };

  render() {
    return (
      <div className={wrapper}>
        <SoundPlayer>
          {({ play, stop, loading, currentlyPlayingMidis }) => {
						return (
							<div className={pianoWrapperClass}>
								{loading && (
									<Loader className={loaderClass} color={colors.white.base}/>
								)}
								<Piano
									noteRange={noteRange}
									onPlayNote={play}
									onStopNote={stop}
									keyboardShortcuts={keyboardShortcuts}
									playbackNotes={currentlyPlayingMidis}
									disabled={loading}
									renderNoteLabel={this.renderNoteLabel}
									className={cx(
										{
											[css({opacity: 0.2})]: loading
										},
										piano
									)}
								/>
							</div>
						);
					}}
        </SoundPlayer>
      </div>
    );
  }
}
