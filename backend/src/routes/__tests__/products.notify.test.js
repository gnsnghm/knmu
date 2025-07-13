import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

process.env.AWS_S3_REGION = 'test';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';
process.env.AWS_S3_BUCKET_NAME = 'test';
process.env.AWS_CLOUDFRONT_DOMAIN = 'test';

const actualProductModule = await import('../../models/product.js');
jest.unstable_mockModule('../../models/product.js', () => ({
  ...actualProductModule,
  updateNotify: jest.fn(),
}));
const { default: productsRouter } = await import('../products.js');
const productModule = await import('../../models/product.js');

const app = express();
app.use(express.json());
app.use('/api/products', productsRouter);

describe('PATCH /api/products/:id/notify', () => {
  test('updates notify flag', async () => {
    productModule.updateNotify.mockResolvedValue({ notify: true });
    const res = await request(app)
      .patch('/api/products/1/notify')
      .send({ notify: true });
    expect(res.body).toEqual({ notify: true });
    expect(productModule.updateNotify).toHaveBeenCalledWith(1, true);
  });
});

