import { AggregatorService } from './aggregator.service';

describe('AggregatorService', () => {
  let service: AggregatorService;

  beforeEach(() => {
    service = new AggregatorService();
  });

  it('aggregates all data into compact input', () => {
    const result = service.aggregate(
      { distanceKm: 1200, durationMinutes: 960 },
      [
        {
          lat: 43.65,
          lng: 51.17,
          temperature: 25,
          windSpeed: 14,
          rain: true,
          snow: false,
          description: 'light rain',
        },
        {
          lat: 45.25,
          lng: 82.48,
          temperature: 30,
          windSpeed: 5,
          rain: false,
          snow: false,
          description: 'clear',
        },
      ],
      [
        {
          id: '1',
          name: 'Темир Баба',
          loadPercent: 90,
          avgWaitMinutes: 130,
          latitude: 47.8,
          longitude: 55.0,
          updatedAt: new Date(),
        },
      ],
      [
        {
          id: '1',
          stationName: 'Бейнеу',
          departuresPerDay: 14,
          currentLoad: 75,
          avgDelayMinutes: 22,
          latitude: 45.317,
          longitude: 55.2,
          updatedAt: new Date(),
        },
      ],
    );

    expect(result).toEqual({
      route: {
        distanceKm: 1200,
        durationHours: 16,
      },
      weather: {
        risk: 'medium',
        wind: 14,
        rain: true,
      },
      checkpoints: [
        {
          name: 'Темир Баба',
          load: 90,
          wait: 130,
        },
      ],
      railway: [
        {
          station: 'Бейнеу',
          load: 75,
        },
      ],
    });
  });

  it('returns low risk for clear weather', () => {
    const result = service.aggregate(
      { distanceKm: 100, durationMinutes: 60 },
      [
        {
          lat: 43,
          lng: 51,
          temperature: 20,
          windSpeed: 5,
          rain: false,
          snow: false,
          description: 'clear',
        },
      ],
      [],
      [],
    );

    expect(result.weather.risk).toBe('low');
    expect(result.weather.rain).toBe(false);
  });

  it('returns high risk for strong wind', () => {
    const result = service.aggregate(
      { distanceKm: 100, durationMinutes: 60 },
      [
        {
          lat: 43,
          lng: 51,
          temperature: 20,
          windSpeed: 35,
          rain: false,
          snow: false,
          description: 'windy',
        },
      ],
      [],
      [],
    );

    expect(result.weather.risk).toBe('high');
  });
});
