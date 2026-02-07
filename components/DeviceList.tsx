import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { Device } from "react-native-ble-plx";

interface DeviceListProps {
  devices: Device[];
  onDevicePress: (device: Device) => void;
  isScanning: boolean;
}

export function DeviceList({
  devices,
  onDevicePress,
  isScanning,
}: DeviceListProps) {
  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => onDevicePress(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>
          {item.localName || item.name || "Unknown Device"}
        </Text>
        <Text style={styles.deviceId}>{item.id}</Text>
      </View>
      <Text style={styles.connectText}>Connect →</Text>
    </TouchableOpacity>
  );

  if (devices.length === 0 && !isScanning) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No devices found</Text>
        <Text style={styles.emptySubtext}>
          Make sure your ESP32 is powered on and advertising
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isScanning && (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="small" color="#4A90D9" />
          <Text style={styles.scanningText}>Scanning for devices...</Text>
        </View>
      )}
      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  listContent: {
    paddingHorizontal: 16,
  },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E1E2E",
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deviceId: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  connectText: {
    color: "#4A90D9",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#888",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  scanningContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  scanningText: {
    marginLeft: 8,
    color: "#4A90D9",
    fontSize: 14,
  },
});
