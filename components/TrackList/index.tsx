import { Pane, Text, Icon, Heading } from "evergreen-ui";
import * as React from "react";
import AcousticGuitar from "@assets/images/instruments/acoustic-guitar.svg";
import DrumSet from "@assets/images/instruments/drum-set.svg";
import { useEffect, useState } from "react";
import { loadMidiAsync } from "@utils/loadMidi";
import { Track } from "@typings/midi";
import { Beat } from "@utils/midiParser/midiParser";
import { BackgroundPlayer } from "@utils/midiPlayer";

function Card({ instrumentName, drums = false }) {
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
        backgroundColor={drums ? "#009688" : "#03a9f4"}
        paddingX={8}
        paddingY={8}
      >
        {drums ? <DrumSet height={35} /> : <AcousticGuitar height={35} />}
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
      const midi = await loadMidiAsync("/static/midi/wherever.mid");
      loadMidi(midi);

      // const player = new BackgroundPlayer(midi);
      //
      // player.load();
    })();
  }, []);

  console.log(midi);

  return (
    <Pane zIndex={8} position="absolute" paddingTop={100} paddingX={30}>
      <Heading color="#fff" marginBottom={20} marginLeft={15}>
        Instruments
      </Heading>

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
        <>
          <Heading color="#fff" marginBottom={20} marginLeft={15}>
            Drums (Percussions)
          </Heading>
          <Pane display="flex" flexDirection="row" flexWrap={"wrap"}>
            {midi.beats.map((beat: Beat, i) => (
              <Card drums key={i} instrumentName={beat.instrument.name} />
            ))}
          </Pane>
        </>
      )}
    </Pane>
  );
}
