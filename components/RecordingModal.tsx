import React, { memo, useState, useCallback } from "react";
import Modal from "@components/Modal";
import Icon from "@components/Icon";
import { colors, Input, Button, mixins } from "@anarock/pebble";
import { description, iconClose, title } from "./styles/RecordingModal.styles";
import { getInstrumentIdByName, Instrument } from "midi-instruments";
import { AnyAction, Dispatch } from "redux";
import { ReducersType } from "@enums/reducers";
import { Midi, Note } from "@typings/midi";
import { Midi as MIDI } from "@tonejs/midi";

interface RecordingModalProps {
  notes: Note[];
  instrument: Instrument;
  dispatch: Dispatch<AnyAction>;
  visible: boolean;
  onActionComplete: () => void;
}

function createMidi(name: string, notes: Note[], instrument: Instrument) {
  const midi = new MIDI();

  const tracks = midi.addTrack();
  const { name: instrumentName, group } = instrument;

  notes.forEach(_note => tracks.addNote(_note));

  const duration = tracks.duration;

  // @ts-ignore
  let midiJson: Midi = midi.toJSON();

  return {
    ...midiJson,
    header: {
      ...midiJson.header,
      name
    },
    tracks: [
      {
        ...midiJson.tracks[0],
        duration,
        instrument: {
          name: instrumentName,
          family: group,
          number: +getInstrumentIdByName(name)
        }
      }
    ]
  };
}

const RecordingModal: React.FunctionComponent<RecordingModalProps> = ({
  notes = [],
  instrument,
  dispatch,
  visible,
  onActionComplete
}) => {
  const [name, setName] = useState("");

  const saveFile = useCallback(() => {
    const midi = createMidi(name, notes, instrument);

    dispatch({
      type: ReducersType.SAVE_RECORDING,
      payload: {
        ...midi,
        id: Date.now()
      }
    });

    onActionComplete();
  }, [name, instrument]);

  const lastNote = notes[notes.length - 1];
  return (
    <Modal visible={visible}>
      <Icon
        name="close"
        size={15}
        color={colors.gray.dark}
        className={iconClose}
        onClick={onActionComplete}
      />
      <h4 className={title}>Save</h4>

      <span className={description}>
        The recording is saved in your local storage. So in case you change the
        browser or clear your storage, it will be gone. <br />
        {!notes.length && (
          <span style={{ color: colors.red.base }}>
            <br />
            There are no notes in this recording. You might want to discard this
            recording.
          </span>
        )}
      </span>

      {lastNote && (
        <span
          className={description}
          style={{
            color: colors.gray.dark
          }}
        >
          {instrument.name}
          {"  "}&bull;{"  "}
          {notes.length} Notes {"    "}&bull;{"   "}
          {(lastNote.time + lastNote.duration).toFixed(2)}s
        </span>
      )}

      <Input
        placeholder="Recording Name"
        required
        onChange={setName}
        value={name}
      />

      <div style={mixins.flexSpaceBetween}>
        <Button disabled={!name} onClick={saveFile}>
          Save
        </Button>
        <Button type="secondary" onClick={onActionComplete}>
          Discard
        </Button>
      </div>
    </Modal>
  );
};

export default memo(RecordingModal);
