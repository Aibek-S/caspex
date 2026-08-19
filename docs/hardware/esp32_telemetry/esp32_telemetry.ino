// =============================================================
// CaspX — Телеметрический модуль грузовика (ESP32)
// Прошивка-заготовка. Собирает данные датчиков и отправляет
// JSON по MQTT на брокер CaspX. Протокол: docs/mqtt-protocol.md
//
// Компоненты:
//   GPS NEO-6M        -> Serial2 (RX=16, TX=17)
//   DHT22             -> GPIO4
//   Геркон (дверь)    -> GPIO5 (замкнут = дверь закрыта)
//   MPU6050 (наклон)  -> I2C (SDA=21, SCL=22)   [опционально]
//
// Библиотеки (Arduino IDE > Инструменты > Управление библиотеками):
//   - PubSubClient
//   - ArduinoJson (v6)
//   - TinyGPSPlus
//   - DHT sensor library by Adafruit
//   - Adafruit MPU6050 (если включаем наклон)
// =============================================================

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <TinyGPSPlus.h>
#include <DHT.h>

// ------------------ НАСТРОЙКИ (заполнить!) ------------------
const char* WIFI_SSID = "Ваша_WiFi_сеть";
const char* WIFI_PASS = "Ваш_пароль";

// Адрес брокера: для теста с тем же компом — его IP в локальной сети
// (напр. 192.168.1.42). Для прод-сервера — IP/домен VPS.
const char* MQTT_HOST = "192.168.1.42";
const int   MQTT_PORT = 1883;

// Из POST /devices (apiKey показывается один раз!)
const char* DEVICE_KEY = "dev_xxxxxxxx";
const char* API_KEY    = "sk_casp_yyyyyyyy";
// --------------------------------------------------------------

#define MQTT_TOPIC_PREFIX "casp/telemetry/"
#define SEND_INTERVAL_MS  5000

#define GPS_RX 16
#define GPS_TX 17
#define DHT_PIN 4
#define DOOR_PIN 5

// Раскомментируй, если есть MPU6050 (наклон)
// #define USE_TILT

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
TinyGPSPlus gps;
DHT dht(DHT_PIN, DHT22);

#if defined(USE_TILT)
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
Adafruit_MPU6050 mpu;
#endif

unsigned long lastSend = 0;

// ---------------------- Подключение -------------------------
void connectWifi() {
  Serial.print("WiFi: connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected, IP: " + WiFi.localIP().toString());
}

void connectMqtt() {
  while (!mqtt.connected()) {
    Serial.printf("MQTT: connecting to %s:%d ...\n", MQTT_HOST, MQTT_PORT);
    String clientId = String("casp-device-") + DEVICE_KEY;
    if (mqtt.connect(clientId.c_str())) {
      Serial.println("MQTT connected");
    } else {
      Serial.print("MQTT failed, rc=");
      Serial.println(mqtt.state());
      delay(3000);
    }
  }
}

// ----------------------- Отправка ----------------------------
void sendTelemetry() {
  char topic[64];
  snprintf(topic, sizeof(topic), "%s%s", MQTT_TOPIC_PREFIX, DEVICE_KEY);

  StaticJsonDocument<512> doc;
  doc["apiKey"] = API_KEY;
  doc["lat"] = gps.location.isValid() ? gps.location.lat() : 0.0;
  doc["lng"] = gps.location.isValid() ? gps.location.lng() : 0.0;
  doc["speedKmh"] = gps.speed.isValid() ? gps.speed.kmph() : 0.0;
  doc["temperature"] = dht.readTemperature();
  doc["humidity"] = dht.readHumidity();

  // Дверь: геркон замыкается при закрытой двери (GPIO в INPUT_PULLUP).
  bool doorOpen = digitalRead(DOOR_PIN) == LOW;
  doc["doorOpen"] = doorOpen;

#if defined(USE_TILT)
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  float pitch = atan2(a.acceleration.y, a.acceleration.z) * 180.0 / PI;
  doc["tilt"] = fabs(pitch);
#endif

  doc["batteryPct"] = 100; // TODO: измерить реальный заряд

  char buffer[512];
  size_t len = serializeJson(doc, buffer, sizeof(buffer));

  bool ok = mqtt.publish(topic, buffer, len);
  Serial.printf("PUB %s -> %s (%d bytes, ok=%d)\n",
                topic, ok ? "OK" : "FAIL", (int)len, ok);
}

// ----------------------- Setup/Loop --------------------------
void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  dht.begin();
  pinMode(DOOR_PIN, INPUT_PULLUP);

#if defined(USE_TILT)
  if (!mpu.begin()) {
    Serial.println("MPU6050 not found");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  }
#endif

  connectWifi();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  connectMqtt();
}

void loop() {
  if (!mqtt.connected()) {
    connectMqtt();
  }
  mqtt.loop();

  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }

  if (millis() - lastSend >= SEND_INTERVAL_MS) {
    lastSend = millis();
    sendTelemetry();
  }
}
