# ESP32 BLE Remote Control Car - Kurulum Kılavuzu

Bu dokümanda ESP32'nizi Bluetooth Low Energy (BLE) ile kontrol edilebilen bir uzaktan kumandalı araba olarak programlamayı öğreneceksiniz.

## Gerekli Malzemeler

- ESP32 DevKit (ESP32-WROOM-32 veya benzeri)
- L298N Motor Sürücü Modülü
- 2x DC Motor (veya 4x)
- 7.4V-12V LiPo Batarya
- Jumper kablolar

## Devre Şeması

```
ESP32                L298N Motor Sürücü
------               ------------------
GPIO 25  ---------> IN1 (Sol motor ileri)
GPIO 26  ---------> IN2 (Sol motor geri)
GPIO 27  ---------> IN3 (Sağ motor ileri)
GPIO 14  ---------> IN4 (Sağ motor geri)
GND      ---------> GND
                    +12V <--- Batarya (+)
                    GND  <--- Batarya (-)
```

## Arduino IDE Kurulumu

1. **ESP32 Board Desteği Ekle**:
   - Arduino IDE'yi açın
   - `File > Preferences` menüsüne gidin
   - "Additional Board Manager URLs" kısmına ekleyin:
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - `Tools > Board > Board Manager` açın
   - "ESP32" arayın ve yükleyin

2. **Board Seçimi**:
   - `Tools > Board > ESP32 Arduino > ESP32 Dev Module`

## Arduino Kodu

Aşağıdaki kodu yeni bir Arduino sketch'ine yapıştırın ve ESP32'nize yükleyin:

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// BLE UUIDs - Bunlar Expo uygulamasındaki UUIDler ile eşleşmeli
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// Motor pinleri
#define LEFT_MOTOR_FWD  25
#define LEFT_MOTOR_BWD  26
#define RIGHT_MOTOR_FWD 27
#define RIGHT_MOTOR_BWD 14

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Bağlantı callback'leri
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Cihaz bağlandı!");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      stopMotors();
      Serial.println("Cihaz bağlantısı kesildi!");
    }
};

// Komut callback'i
class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String value = pCharacteristic->getValue();
      
      if (value.length() > 0) {
        char command = value[0];
        Serial.print("Alınan komut: ");
        Serial.println(command);
        
        executeCommand(command);
      }
    }
};

void stopMotors() {
  digitalWrite(LEFT_MOTOR_FWD, LOW);
  digitalWrite(LEFT_MOTOR_BWD, LOW);
  digitalWrite(RIGHT_MOTOR_FWD, LOW);
  digitalWrite(RIGHT_MOTOR_BWD, LOW);
}

void moveForward() {
  digitalWrite(LEFT_MOTOR_FWD, HIGH);
  digitalWrite(LEFT_MOTOR_BWD, LOW);
  digitalWrite(RIGHT_MOTOR_FWD, HIGH);
  digitalWrite(RIGHT_MOTOR_BWD, LOW);
}

void moveBackward() {
  digitalWrite(LEFT_MOTOR_FWD, LOW);
  digitalWrite(LEFT_MOTOR_BWD, HIGH);
  digitalWrite(RIGHT_MOTOR_FWD, LOW);
  digitalWrite(RIGHT_MOTOR_BWD, HIGH);
}

void turnLeft() {
  digitalWrite(LEFT_MOTOR_FWD, LOW);
  digitalWrite(LEFT_MOTOR_BWD, HIGH);
  digitalWrite(RIGHT_MOTOR_FWD, HIGH);
  digitalWrite(RIGHT_MOTOR_BWD, LOW);
}

void turnRight() {
  digitalWrite(LEFT_MOTOR_FWD, HIGH);
  digitalWrite(LEFT_MOTOR_BWD, LOW);
  digitalWrite(RIGHT_MOTOR_FWD, LOW);
  digitalWrite(RIGHT_MOTOR_BWD, HIGH);
}

void executeCommand(char command) {
  switch(command) {
    case 'F': // İleri
      moveForward();
      break;
    case 'B': // Geri
      moveBackward();
      break;
    case 'L': // Sol
      turnLeft();
      break;
    case 'R': // Sağ
      turnRight();
      break;
    case 'S': // Dur
      stopMotors();
      break;
    case 'G': // İleri-Sol
      digitalWrite(LEFT_MOTOR_FWD, LOW);
      digitalWrite(LEFT_MOTOR_BWD, LOW);
      digitalWrite(RIGHT_MOTOR_FWD, HIGH);
      digitalWrite(RIGHT_MOTOR_BWD, LOW);
      break;
    case 'I': // İleri-Sağ
      digitalWrite(LEFT_MOTOR_FWD, HIGH);
      digitalWrite(LEFT_MOTOR_BWD, LOW);
      digitalWrite(RIGHT_MOTOR_FWD, LOW);
      digitalWrite(RIGHT_MOTOR_BWD, LOW);
      break;
    case 'H': // Geri-Sol
      digitalWrite(LEFT_MOTOR_FWD, LOW);
      digitalWrite(LEFT_MOTOR_BWD, LOW);
      digitalWrite(RIGHT_MOTOR_FWD, LOW);
      digitalWrite(RIGHT_MOTOR_BWD, HIGH);
      break;
    case 'J': // Geri-Sağ
      digitalWrite(LEFT_MOTOR_FWD, LOW);
      digitalWrite(LEFT_MOTOR_BWD, HIGH);
      digitalWrite(RIGHT_MOTOR_FWD, LOW);
      digitalWrite(RIGHT_MOTOR_BWD, LOW);
      break;
    default:
      stopMotors();
      break;
  }
}

void setup() {
  Serial.begin(115200);
  
  // Motor pinlerini ayarla
  pinMode(LEFT_MOTOR_FWD, OUTPUT);
  pinMode(LEFT_MOTOR_BWD, OUTPUT);
  pinMode(RIGHT_MOTOR_FWD, OUTPUT);
  pinMode(RIGHT_MOTOR_BWD, OUTPUT);
  stopMotors();

  // BLE başlat
  BLEDevice::init("ESP32-Car");
  
  // BLE Server oluştur
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // BLE Service oluştur
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // BLE Characteristic oluştur
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setCallbacks(new MyCallbacks());

  // Service başlat
  pService->start();

  // Advertising başlat
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();
  
  Serial.println("BLE hazır! 'ESP32-Car' olarak görünür.");
}

void loop() {
  // Bağlantı kesilirse yeniden advertising başlat
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("Yeniden advertising başlatıldı...");
    oldDeviceConnected = deviceConnected;
  }
  
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }
}
```

## Uygulamayı Çalıştırma

1. **ESP32'yi programlayın** ve güç verin
2. **Expo uygulamasını** fiziksel telefonda başlatın:
   ```bash
   npx expo prebuild
   npx expo run:android
   # veya
   npx expo run:ios
   ```
3. **"Scan for Devices"** butonuna basın
4. **"ESP32-Car"** cihazını seçin
5. Bağlandıktan sonra **joystick kontrollerini** kullanın!

## Komut Referansı

| Komut | Açıklama |
|-------|----------|
| F | İleri |
| B | Geri |
| L | Sol dönüş |
| R | Sağ dönüş |
| S | Dur |
| G | İleri-Sol |
| I | İleri-Sağ |
| H | Geri-Sol |
| J | Geri-Sağ |

## Sorun Giderme

- **Cihaz bulunamıyor**: ESP32'nin gücünün açık olduğundan ve "ESP32-Car" olarak advertising yaptığından emin olun.
- **Bağlantı kurulamıyor**: Telefonunuzun Bluetooth'unun açık olduğundan emin olun.
- **Motorlar çalışmıyor**: Kablo bağlantılarını ve batarya gücünü kontrol edin.
