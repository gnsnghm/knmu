import { jest } from '@jest/globals';

const actualDiscordConfig = await import('../../models/discordConfig.js');
jest.unstable_mockModule('../../models/discordConfig.js', () => ({
  ...actualDiscordConfig,
  loadDiscordConfig: jest.fn(),
}));
jest.unstable_mockModule('node-fetch', () => ({ default: jest.fn() }));

const { default: fetch } = await import('node-fetch');
const { checkAndNotify } = await import('../discordNotifier.js');
const { pool } = await import('../../db.js');
const discordConfigModule = await import('../../models/discordConfig.js');

describe('checkAndNotify', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sends discord message when not recently notified', async () => {
    pool.query = jest.fn()
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'P', qty: 2, last_added: null }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});
    discordConfigModule.loadDiscordConfig.mockResolvedValue({ token: 't', channelId: 'c' });
    fetch.mockResolvedValue({ ok: true });

    await checkAndNotify();

    expect(fetch).toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO notification_logs (product_id, sent_at) VALUES ($1, NOW())',
      [1]
    );
  });
});

