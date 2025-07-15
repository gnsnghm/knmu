import { jest } from '@jest/globals';

const actualDiscordConfig = await import('../../models/discordConfig.js');
jest.unstable_mockModule('../../models/discordConfig.js', () => ({
  ...actualDiscordConfig,
  loadDiscordConfig: jest.fn(),
}));
jest.unstable_mockModule('node-fetch', () => ({ default: jest.fn() }));

const { default: fetch } = await import('node-fetch');
const { checkAndNotify, sendDiscordMessage } = await import('../discordNotifier.js');
const { pool } = await import('../../db.js');
const discordConfigModule = await import('../../models/discordConfig.js');

describe('checkAndNotify', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sends a consolidated discord message', async () => {
    pool.query = jest.fn()
      .mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'P1', qty: 0, last_added: null, history_count: 2 },
          { id: 2, name: 'P2', qty: 1, last_added: '2024-01-01', history_count: 2 },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValue({});
    discordConfigModule.loadDiscordConfig.mockResolvedValue({ token: 't', channelId: 'c' });
    fetch
      .mockResolvedValueOnce({ ok: true, text: async () => '<span class="a-price-whole">100</span>' })
      .mockResolvedValueOnce({ ok: true, text: async () => '<span class="a-price-whole">200</span>' })
      .mockResolvedValue({ ok: true });

    await checkAndNotify();

    expect(fetch).toHaveBeenCalledTimes(3);
    const body = JSON.parse(fetch.mock.calls[2][1].body).content;
    expect(body).toContain('# P1');
    expect(body).toContain('# P2');
  });
});

describe('sendDiscordMessage', () => {
  afterEach(() => jest.clearAllMocks());

  test('sends a discord message', async () => {
    discordConfigModule.loadDiscordConfig.mockResolvedValue({ token: 't', channelId: 'c' });
    fetch.mockResolvedValue({ ok: true });

    await sendDiscordMessage('hello');

    expect(fetch).toHaveBeenCalled();
  });
});

