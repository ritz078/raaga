import { ReactComponent as DrumSet } from "@assets/images/instruments/drum-set.svg";
import { ReactComponent as AcousticGuitar } from "@assets/images/instruments/acoustic-guitar.svg";
import * as React from "react";
import { Pane, Icon, Text } from "evergreen-ui";

interface InstrumentCardProps {
  instrumentName: string;
  drums?: boolean;
  isSelected: boolean;
  onClick?: () => void;
  disabled?: boolean;
  onIconClick?: () => void;
}

const InstrumentCard: React.FunctionComponent<InstrumentCardProps> = ({
  instrumentName,
  drums = false,
  isSelected,
  onClick,
  disabled,
  onIconClick
}) => {
  const _onIconClick = e => {
    e.stopPropagation();
    onIconClick && onIconClick();
  };

  return (
    <Pane
      paddingX={5}
      marginRight={15}
      paddingY={5}
      onClick={onClick}
      backgroundColor={"#353535"}
      borderRadius={2}
      height={60}
      cursor="pointer"
      css={{
        border: isSelected ? "1px solid #4CAF50" : "1px solid transparent",
        transition: "all 200ms",
        "&:hover": {
          backgroundColor: "#2a2a2a"
        }
      }}
      display="flex"
      flexDirection="row"
      marginBottom={14}
      width={230}
    >
      <Pane
        borderRadius={2}
        backgroundColor={"#5d5d5d"}
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

        <Pane
          width={20}
          onClick={_onIconClick}
          opacity={!onIconClick ? 0.2 : 1}
        >
          {disabled ? (
            <Icon icon="disable" color="red" size={15} />
          ) : (
            <Icon icon="volume-up" color="#b5b5b5" size={15} />
          )}
        </Pane>
      </Pane>
    </Pane>
  );
};

export default React.memo(InstrumentCard);
