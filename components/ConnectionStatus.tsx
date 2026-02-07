import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Device } from "react-native-ble-plx";

interface ConnectionStatusProps {
  device: Device | null;
  onDisconnect: () => void;
}

export function ConnectionStatus({
  device,
  onDisconnect,
}: ConnectionStatusProps) {
  if (!device) {
    return (
      <View style={styles.container}>
        <View style={[styles.indicator, styles.disconnected]} />
        <Text style={styles.statusText}>Not Connected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, styles.connected]} />
      <View style={styles.deviceInfo}>
        <Text style={styles.connectedText}>Connected</Text>
        <Text style={styles.deviceName}>
          {device.localName || device.name || "Unknown"}
        </Text>
      </View>
      <TouchableOpacity style={styles.disconnectButton} onPress={onDisconnect}>
        <Text style={styles.disconnectText}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E2E",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  connected: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  disconnected: {
    backgroundColor: "#666",
  },
  deviceInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    color: "#888",
  },
  connectedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  deviceName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  disconnectButton: {
    backgroundColor: "#E53935",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
