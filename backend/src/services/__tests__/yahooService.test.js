import { fetchByJan } from '../yahooService.js';
import { jest } from '@jest/globals';

describe('fetchByJan', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
  });

  test('returns product when hit found', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        totalResultsReturned: 1,
        hits: [
          {
            name: 'Example',
            brand: { name: 'Brand' },
            image: { medium: 'img.png' },
            genreCategory: { name: 'Snacks' },
          },
        ],
      }),
    });
    process.env.YAHOO_APP_ID = 'dummy';
    const result = await fetchByJan('12345678');
    expect(result).toEqual({
      name: 'Example',
      brand: 'Brand',
      image: 'img.png',
      meta: expect.any(Object),
      group: 'snacks',
    });
  });

  test('returns null when no results', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ totalResultsReturned: 0 }),
    });
    process.env.YAHOO_APP_ID = 'dummy';
    const result = await fetchByJan('12345678');
    expect(result).toBeNull();
  });

  test('throws error when response not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    process.env.YAHOO_APP_ID = 'dummy';
    await expect(fetchByJan('12345678')).rejects.toThrow('Yahoo API');
  });
});
