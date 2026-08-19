import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as mqtt from 'mqtt';
import { TelemetryIngestionService } from './telemetry-ingestion.service';

type QoS = 0 | 1 | 2;

@Injectable()
export class MqttIngestionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttIngestionService.name);
  private client: mqtt.MqttClient | null = null;

  private readonly topicPrefix = process.env.MQTT_TOPIC_PREFIX ?? 'casp';
  private readonly qos: QoS = Number(process.env.MQTT_QOS ?? 1) as QoS;

  constructor(private readonly telemetryIngestion: TelemetryIngestionService) {}

  onModuleInit() {
    const url = process.env.MQTT_URL;
    if (!url) {
      this.logger.warn('MQTT_URL is not set — MQTT ingestion is disabled');
      return;
    }

    const topic = `${this.topicPrefix}/telemetry/+`;
    this.logger.log(`Connecting to MQTT broker at ${url}`);

    this.client = mqtt.connect(url, {
      reconnectPeriod: 3000,
      connectTimeout: 10000,
    });

    this.client.on('connect', () => {
      this.logger.log('MQTT broker connected');
      this.client?.subscribe(topic, { qos: this.qos }, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to ${topic}: ${err.message}`);
          return;
        }
        this.logger.log(`Subscribed to ${topic}`);
      });
    });

    this.client.on('message', (topic, message) => {
      void this.handleMessage(topic, message);
    });

    this.client.on('error', (err) => {
      this.logger.error(`MQTT error: ${err.message}`);
    });

    this.client.on('reconnect', () => {
      this.logger.warn('MQTT reconnecting...');
    });
  }

  private async handleMessage(topic: string, message: Buffer) {
    const parts = topic.split('/');
    const deviceKey = parts[2];
    if (!deviceKey) {
      return;
    }

    try {
      const payload: unknown = JSON.parse(message.toString('utf8'));
      await this.telemetryIngestion.handle(deviceKey, payload);
    } catch (error) {
      this.logger.warn(
        `Failed to process telemetry from ${deviceKey}: ${
          error instanceof Error ? error.message : 'parse error'
        }`,
      );
    }
  }

  onModuleDestroy() {
    this.client?.end(true);
  }
}
