import { of } from 'rxjs';
import { OpenAiService } from './open-ai.service';
import type { AggregatedInput } from './aggregator.service';

describe('OpenAiService', () => {
  const httpServiceMock = { post: jest.fn() };
  let service: OpenAiService;

  const mockInput: AggregatedInput = {
    route: { distanceKm: 1200, durationHours: 16 },
    weather: { risk: 'medium', wind: 14, rain: true },
    checkpoints: [{ name: 'Темир Баба', load: 90, wait: 130 }],
    railway: [{ station: 'Бейнеу', load: 75 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OpenAiService(httpServiceMock as never);
  });

  it('returns parsed prediction from OpenAI', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    httpServiceMock.post.mockReturnValueOnce(
      of({
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  recommendation: 'wait',
                  riskLevel: 'high',
                  bestDepartureTime: '2026-06-13T08:00:00.000Z',
                  expectedDelayMinutes: 140,
                  shortExplanation:
                    'Высокая загруженность КПП Темир Баба и ожидаются осадки.',
                }),
              },
            },
          ],
        },
      }),
    );

    const result = await service.predict(mockInput);

    expect(result).toEqual({
      recommendation: 'wait',
      riskLevel: 'high',
      bestDepartureTime: '2026-06-13T08:00:00.000Z',
      expectedDelayMinutes: 140,
      shortExplanation:
        'Высокая загруженность КПП Темир Баба и ожидаются осадки.',
    });
  });

  it('throws when no API key', async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(service.predict(mockInput)).rejects.toThrow(
      'OPENAI_API_KEY is not configured',
    );
  });

  it('throws on OpenAI API error', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    httpServiceMock.post.mockReturnValueOnce(
      of({
        data: { choices: [] },
      }),
    );

    await expect(service.predict(mockInput)).rejects.toThrow(
      'OpenAI returned empty response',
    );
  });
});
