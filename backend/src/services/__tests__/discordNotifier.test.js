import { checkAndNotify } from '../discordNotifier.js';
import { pool } from '../../db.js';
import { loadDiscordConfig } from '../../models/discordConfig.js';
import fetch from 'node-fetch';

jest.mock('../../db.js', () => ({ pool: { query: jest.fn() } }));
jest.mock('../../models/discordConfig.js', () => ({ loadDiscordConfig: jest.fn() }));
jest.mock('node-fetch', () => jest.fn());

describe('checkAndNotify', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sends discord message when not recently notified', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'P', qty: 2, last_added: null }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({});
    loadDiscordConfig.mockResolvedValue({ token: 't', channelId: 'c' });
    fetch.mockResolvedValue({ ok: true });

    await checkAndNotify();

    expect(fetch).toHaveBeenCalled();
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO notification_logs (product_id, sent_at) VALUES ($1, NOW())',
      [1]
    );
  });
});

