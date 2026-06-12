import { of, throwError } from 'rxjs';
import { OpenWeatherService } from './open-weather.service';

describe('OpenWeatherService', () => {
  const httpServiceMock = { get: jest.fn() };
  let service: OpenWeatherService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OpenWeatherService(httpServiceMock as never);
  });

  it('returns weather for multiple points', async () => {
    process.env.OPENWEATHER_API_KEY = 'test-key';

    httpServiceMock.get
      .mockReturnValueOnce(
        of({
          data: {
            main: { temp: 25 },
            wind: { speed: 5 },
            rain: { '1h': 2 },
            weather: [{ description: 'light rain' }],
          },
        }),
      )
      .mockReturnValueOnce(
        of({
          data: {
            main: { temp: 18 },
            wind: { speed: 10 },
            weather: [{ description: 'clear sky' }],
          },
        }),
      );

    const result = await service.getWeatherForPoints([
      { lat: 43.65, lng: 51.17 },
      { lat: 45.25, lng: 82.48 },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      lat: 43.65,
      lng: 51.17,
      temperature: 25,
      windSpeed: 5,
      rain: true,
      snow: false,
      description: 'light rain',
    });
    expect(result[1]).toEqual({
      lat: 45.25,
      lng: 82.48,
      temperature: 18,
      windSpeed: 10,
      rain: false,
      snow: false,
      description: 'clear sky',
    });
  });

  it('falls back to defaults on fetch failure', async () => {
    process.env.OPENWEATHER_API_KEY = 'test-key';

    httpServiceMock.get.mockReturnValueOnce(
      of({
        data: { main: { temp: 20 }, wind: { speed: 3 }, weather: [] },
      }),
    );
    httpServiceMock.get.mockReturnValueOnce(
      throwError(() => new Error('network error')),
    );

    const result = await service.getWeatherForPoints([
      { lat: 43.65, lng: 51.17 },
      { lat: 99, lng: 99 },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].temperature).toBe(20);
    expect(result[1]).toEqual({
      lat: 99,
      lng: 99,
      temperature: 0,
      windSpeed: 0,
      rain: false,
      snow: false,
      description: 'unavailable',
    });
  });
});
