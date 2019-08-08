import { Pane, Text, Icon } from "evergreen-ui";
import * as React from "react";
import AcousticGuitar from "@assets/images/instruments/1-acoustic-guitar.svg";
import { useEffect, useState } from "react";
import { loadMidiAsync } from "@utils/loadMidi";
import { Track } from "@typings/midi";
import { Beat } from "@utils/midiParser/midiParser";

function Card({ instrumentName }) {
  return (
    <Pane
      paddingX={5}
      marginX={15}
      paddingY={5}
      backgroundColor={"#3f51b5"}
      borderRadius={2}
      height={60}
      border={"1px solid green"}
      display="flex"
      flexDirection="row"
      marginBottom={30}
      width={230}
    >
      <Pane
        borderRadius={2}
        backgroundColor="#03a9f4"
        paddingX={8}
        paddingY={8}
      >
        <AcousticGuitar height={35} />
      </Pane>

      <Pane
        marginLeft={15}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Text size={400} color="#eee" fontSize={13} textTransform="capitalize">
          {instrumentName}
        </Text>

        <Pane>
          <Icon icon="volume-up" color="#03a9f4" size={18} />
        </Pane>
      </Pane>
    </Pane>
  );
}

export default function() {
  const [midi, loadMidi] = useState();

  useEffect(() => {
    (async () => {
      const midi = await loadMidiAsync("/static/midi/potc.mid");
      loadMidi(midi);
    })();
  }, []);

  console.log(midi);

  return (
    <Pane zIndex={8} position="absolute" paddingTop={100} paddingX={30}>
      <Pane display="flex" flexDirection="row" flexWrap={"wrap"}>
        {midi &&
          midi.tracks &&
          midi.tracks
            .filter(track => track.notes.length)
            .map((track: Track, i) => (
              <Card key={i} instrumentName={track.instrument.name} />
            ))}
      </Pane>

      {midi && midi.beats && (
        <Pane display="flex" flexDirection="row" flexWrap={"wrap"}>
          {midi.beats.map((beat: Beat, i) => (
            <Card key={i} instrumentName={beat.instrument.name} />
          ))}
        </Pane>
      )}
    </Pane>
  );
}
