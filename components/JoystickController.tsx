import { type Command, COMMANDS } from "@/hooks/useBLE";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const BUTTON_SIZE = Math.min(width * 0.2, 80);

interface JoystickControllerProps {
  onCommand: (command: Command) => void;
  onRelease: () => void;
  disabled?: boolean;
}

export function JoystickController({
  onCommand,
  onRelease,
  disabled = false,
}: JoystickControllerProps) {
  const handlePressIn = (command: Command) => {
    if (!disabled) {
      onCommand(command);
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      onRelease();
    }
  };

  const ControlButton = ({
    command,
    icon,
    style,
  }: {
    command: Command;
    icon: string;
    style?: object;
  }) => (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && styles.buttonDisabled,
      ]}
      onPressIn={() => handlePressIn(command)}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {icon}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top row - Forward */}
      <View style={styles.row}>
        <ControlButton command={COMMANDS.FORWARD} icon="▲" />
      </View>

      {/* Middle row - Left, Stop, Right */}
      <View style={styles.row}>
        <ControlButton command={COMMANDS.LEFT} icon="◀" />
        <TouchableOpacity
          style={[styles.stopButton, disabled && styles.buttonDisabled]}
          onPress={() => handlePressIn(COMMANDS.STOP)}
          disabled={disabled}
        >
          <Text style={[styles.stopText, disabled && styles.buttonTextDisabled]}>
            ■
          </Text>
        </TouchableOpacity>
        <ControlButton command={COMMANDS.RIGHT} icon="▶" />
      </View>

      {/* Bottom row - Backward */}
      <View style={styles.row}>
        <ControlButton command={COMMANDS.BACKWARD} icon="▼" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#4A90D9",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: "#555",
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
  buttonTextDisabled: {
    color: "#888",
  },
  stopButton: {
    width: BUTTON_SIZE * 0.8,
    height: BUTTON_SIZE * 0.8,
    borderRadius: 8,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  stopText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
});
