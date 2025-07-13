import request from 'supertest';
import express from 'express';
import productsRouter from '../products.js';
import { updateNotify } from '../../models/product.js';

jest.mock('../../models/product.js', () => ({ updateNotify: jest.fn() }));

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

describe('PATCH /api/products/:id/notify', () => {
  test('updates notify flag', async () => {
    updateNotify.mockResolvedValue({ notify: true });
    const res = await request(app)
      .patch('/api/products/1/notify')
      .send({ notify: true });
    expect(res.body).toEqual({ notify: true });
    expect(updateNotify).toHaveBeenCalledWith(1, true);
  });
});

