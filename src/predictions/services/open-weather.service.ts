import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export type WeatherPoint = {
  lat: number;
  lng: number;
  temperature: number;
  windSpeed: number;
  rain: boolean;
  snow: boolean;
  description: string;
};

type OpenWeatherResponse = {
  main: { temp: number };
  wind: { speed: number };
  rain?: { '1h'?: number };
  snow?: { '1h'?: number };
  weather: Array<{ description: string }>;
};

@Injectable()
export class OpenWeatherService {
  constructor(private readonly httpService: HttpService) {}

  async getWeatherForPoints(
    points: Array<{ lat: number; lng: number }>,
  ): Promise<WeatherPoint[]> {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new BadGatewayException('OPENWEATHER_API_KEY is not configured');
    }

    const results = await Promise.allSettled(
      points.map((point) => this.fetchPoint(point.lat, point.lng, apiKey)),
    );

    return results.map((r, i) => {
      if (r.status === 'fulfilled') {
        return r.value;
      }
      return {
        lat: points[i].lat,
        lng: points[i].lng,
        temperature: 0,
        windSpeed: 0,
        rain: false,
        snow: false,
        description: 'unavailable',
      };
    });
  }

  private async fetchPoint(
    lat: number,
    lng: number,
    apiKey: string,
  ): Promise<WeatherPoint> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<OpenWeatherResponse>(
          'https://api.openweathermap.org/data/2.5/weather',
          {
            params: {
              lat,
              lon: lng,
              appid: apiKey,
              units: 'metric',
            },
            timeout: 10000,
          },
        ),
      );

      return {
        lat,
        lng,
        temperature: Math.round(data.main.temp),
        windSpeed: Math.round(data.wind.speed),
        rain: !!data.rain?.['1h'],
        snow: !!data.snow?.['1h'],
        description: data.weather[0]?.description ?? '',
      };
    } catch (error) {
      if (error instanceof AxiosError && !error.response) {
        throw new BadGatewayException('OpenWeather is unavailable');
      }
      throw error;
    }
  }
}
