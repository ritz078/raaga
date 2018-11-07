import React, { memo, useState, useCallback } from "react";
import Modal from "@components/Modal";
import Icon from "@components/Icon";
import { colors, Input, Button, mixins } from "@anarock/pebble";
import { description, iconClose, title } from "./styles/RecordingModal.styles";
import { Note, create } from "midiconvert";
import { getInstrumentById } from "midi-instruments";
import { AnyAction, Dispatch } from "redux";
import { ReducersType } from "@enums/reducers";

interface RecordingModalProps {
  notes: Note[];
  instrumentId: number;
  dispatch: Dispatch<AnyAction>;
  visible: boolean;
  onActionComplete: () => void;
}

const RecordingModal: React.SFC<RecordingModalProps> = ({
  notes = [],
  instrumentId,
  dispatch,
  visible,
  onActionComplete
}) => {
  const [name, setName] = useState("");

  const saveFile = useCallback(() => {
    const midi = create();
    // @ts-ignore
    const tracks = midi.track(name);
    tracks.patch(instrumentId);

    notes.forEach(({ midi, time, duration, velocity }) =>
      tracks.note(midi, time, duration, velocity)
    );

    dispatch({
      type: ReducersType.SAVE_RECORDING,
      payload: midi.toJSON()
    });

    onActionComplete();
  }, []);

  const lastNote = notes[notes.length - 1];
  return (
    <Modal visible={visible}>
      <Icon
        name="close"
        size={15}
        color={colors.gray.dark}
        className={iconClose}
      />
      <h4 className={title}>Save</h4>

      <span className={description}>
        The recording is saved in your local storage. So in case you change the
        browser or clear your storage, it will be gone.
      </span>

      {lastNote && (
        <span
          className={description}
          style={{
            color: colors.gray.dark
          }}
        >
          {getInstrumentById(instrumentId).name}
          &nbsp;&nbsp; &bull;&nbsp;&nbsp;
          {notes.length} Notes &nbsp;&nbsp;&bull;&nbsp;&nbsp;{" "}
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
