import { ConnectionStatus } from "@/components/ConnectionStatus";
import { DeviceList } from "@/components/DeviceList";
import { JoystickController } from "@/components/JoystickController";
import { COMMANDS, useBLE } from "@/hooks/useBLE";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CarControlScreen() {
  const {
    allDevices,
    connectedDevice,
    isScanning,
    requestPermissions,
    scanForPeripherals,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    sendCommand,
  } = useBLE();

  const [showDevices, setShowDevices] = useState(false);

  const handleScanPress = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert(
        "Permissions Required",
        "Bluetooth permissions are required to scan for devices."
      );
      return;
    }

    if (isScanning) {
      stopScan();
    } else {
      setShowDevices(true);
      scanForPeripherals();
    }
  };

  const handleDeviceConnect = async (device: any) => {
    try {
      await connectToDevice(device);
      setShowDevices(false);
      stopScan();
    } catch {
      Alert.alert("Connection Failed", "Could not connect to the device.");
    }
  };

  const handleDisconnect = async () => {
    await disconnectFromDevice();
  };

  const handleCommand = (command: string) => {
    sendCommand(command as any);
  };

  const handleRelease = () => {
    sendCommand(COMMANDS.STOP);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚗 RC Kumanda</Text>
        <Text style={styles.subtitle}>ESP32 Bluetooth Control</Text>
      </View>

      {/* Connection Status */}
      <ConnectionStatus
        device={connectedDevice}
        onDisconnect={handleDisconnect}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {!connectedDevice ? (
          <>
            {/* Scan Button */}
            <TouchableOpacity
              style={[styles.scanButton, isScanning && styles.scanButtonActive]}
              onPress={handleScanPress}
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? "⏹ Stop Scanning" : "🔍 Scan for Devices"}
              </Text>
            </TouchableOpacity>

            {/* Device List */}
            {showDevices && (
              <DeviceList
                devices={allDevices}
                onDevicePress={handleDeviceConnect}
                isScanning={isScanning}
              />
            )}
          </>
        ) : (
          /* Joystick Controller */
          <View style={styles.controllerContainer}>
            <Text style={styles.controllerTitle}>Control Panel</Text>
            <JoystickController
              onCommand={handleCommand}
              onRelease={handleRelease}
              disabled={!connectedDevice}
            />
            <Text style={styles.hint}>
              Hold buttons to move • Release to stop
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {connectedDevice
            ? "Use the controls above to drive your car!"
            : "Connect to your ESP32 car to start controlling"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scanButton: {
    backgroundColor: "#4A90D9",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
    shadowColor: "#4A90D9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonActive: {
    backgroundColor: "#E53935",
    shadowColor: "#E53935",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  controllerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  controllerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 20,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginTop: 20,
    textAlign: "center",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
