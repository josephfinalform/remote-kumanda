import { encode as base64Encode } from "base-64";
import * as ExpoDevice from "expo-device";
import { useCallback, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

// ESP32 BLE UUIDs - these should match your ESP32 code
const CAR_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const COMMAND_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// Command constants
export const COMMANDS = {
  FORWARD: "F",
  BACKWARD: "B",
  LEFT: "L",
  RIGHT: "R",
  STOP: "S",
  FORWARD_LEFT: "G",
  FORWARD_RIGHT: "I",
  BACKWARD_LEFT: "H",
  BACKWARD_RIGHT: "J",
} as const;

export type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

interface UseBLEReturn {
  allDevices: Device[];
  connectedDevice: Device | null;
  isScanning: boolean;
  requestPermissions: () => Promise<boolean>;
  scanForPeripherals: () => void;
  stopScan: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectFromDevice: () => Promise<void>;
  sendCommand: (command: Command) => Promise<void>;
}

let bleManagerInstance: BleManager | null = null;

function getBleManager(): BleManager {
  if (!bleManagerInstance) {
    bleManagerInstance = new BleManager();
  }
  return bleManagerInstance;
}

export function useBLE(): UseBLEReturn {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const requestAndroid31Permissions = async (): Promise<boolean> => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Scan Permission",
        message: "Bluetooth Low Energy requires Scan permission",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permission",
        message: "Bluetooth Low Energy requires Connect permission",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return await requestAndroid31Permissions();
      }
    } else {
      return true;
    }
  }, []);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device): boolean =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = useCallback(() => {
    setIsScanning(true);
    setAllDevices([]);

    getBleManager().startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        setIsScanning(false);
        return;
      }

      if (device && device.name) {
        // Filter for ESP32 devices - adjust the name filter as needed
        const deviceName = device.localName || device.name || "";
        if (
          deviceName.toLowerCase().includes("esp32") ||
          deviceName.toLowerCase().includes("car") ||
          deviceName.toLowerCase().includes("remote") ||
          deviceName.toLowerCase().includes("kumanda")
        ) {
          setAllDevices((prevState) => {
            if (!isDuplicateDevice(prevState, device)) {
              return [...prevState, device];
            }
            return prevState;
          });
        }
      }
    });
  }, []);

  const stopScan = useCallback(() => {
    getBleManager().stopDeviceScan();
    setIsScanning(false);
  }, []);

  const connectToDevice = useCallback(async (device: Device): Promise<void> => {
    try {
      const deviceConnection = await getBleManager().connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      getBleManager().stopDeviceScan();
      setIsScanning(false);
      console.log("Connected to:", device.name);
    } catch (e) {
      console.log("Failed to connect:", e);
      throw e;
    }
  }, []);

  const disconnectFromDevice = useCallback(async (): Promise<void> => {
    if (connectedDevice) {
      try {
        await getBleManager().cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        console.log("Disconnected from device");
      } catch (e) {
        console.log("Failed to disconnect:", e);
      }
    }
  }, [connectedDevice]);

  const sendCommand = useCallback(
    async (command: Command): Promise<void> => {
      if (!connectedDevice) {
        console.log("No device connected");
        return;
      }

      try {
        const encodedCommand = base64Encode(command);
        await connectedDevice.writeCharacteristicWithResponseForService(
          CAR_SERVICE_UUID,
          COMMAND_CHARACTERISTIC_UUID,
          encodedCommand
        );
        console.log("Sent command:", command);
      } catch (e) {
        console.log("Failed to send command:", e);
      }
    },
    [connectedDevice]
  );

  return {
    allDevices,
    connectedDevice,
    isScanning,
    requestPermissions,
    scanForPeripherals,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    sendCommand,
  };
}
