import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User routes', () => {
  let authToken: string;
  let organisationId: string;
  let userId: string;

  beforeAll(async () => {
    // seed: create org and admin user
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Test Organisation',
        username: 'testadmin',
        email: 'testadmin@test.com',
        password: 'password123'
      });
    console.log('beforeAll response:', res.status, res.body);
    authToken = res.body.authToken;
    organisationId = res.body.userInfo.organisationId;
    userId = res.body.userInfo.userId;
  });

  it('POST /user/login - valid credentials', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ username: 'testadmin', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('authToken');
    expect(res.body).toHaveProperty('userInfo');
  });

  it('POST /user/login - invalid credentials', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ username: 'testadmin', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('GET /user/:userId - get user info', async () => {
    const res = await request(app)
      .get(`/user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', 'testadmin');
  });

  it('PUT /user/updateInfo - update username', async () => {
    const res = await request(app)
      .put('/user/updateInfo')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newUsername: 'updatedadmin' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', 'updatedadmin');
  });

  it('PUT /user/updateInfo - no fields provided', async () => {
    const res = await request(app)
      .put('/user/updateInfo')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});