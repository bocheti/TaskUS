import request from 'supertest';
import app from '../app';

describe('User routes', () => {
  let authToken: string;
  let organisationId: string;
  let userId: string;
  let memberToken: string;
  let userRequestId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Test Organisation',
        organisationDescription: 'Test description',
        username: 'testadmin',
        email: 'testadmin@test.com',
        password: 'password123'
      });
    authToken = res.body.authToken;
    organisationId = res.body.userInfo.organisationId;
    userId = res.body.userInfo.userId;

    // create a member user
    await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'testmember',
        email: 'testmember@test.com',
        password: 'password123',
        role: 'member'
      });
    const memberLogin = await request(app)
      .post('/user/login')
      .send({ username: 'testmember', password: 'password123' });
    memberToken = memberLogin.body.authToken;

    // create a user request
    const reqRes = await request(app)
      .post('/user/request')
      .send({
        username: 'requestuser',
        email: 'requestuser@test.com',
        password: 'password123',
        organisationId
      });
    userRequestId = reqRes.body.requestId;
  });

  // POST /user/login
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

  it('POST /user/login - missing fields', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ username: 'testadmin' });
    expect(res.status).toBe(400);
  });

  it('POST /user/login - non-existent username', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ username: 'nonexistent', password: 'password123' });
    expect(res.status).toBe(401);
  });

  // POST /user/request
  it('POST /user/request - valid', async () => {
    const res = await request(app)
      .post('/user/request')
      .send({
        username: 'newrequestuser',
        email: 'newrequest@test.com',
        password: 'password123',
        organisationId
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('requestId');
  });

  it('POST /user/request - missing fields', async () => {
    const res = await request(app)
      .post('/user/request')
      .send({ username: 'incomplete' });
    expect(res.status).toBe(400);
  });

  it('POST /user/request - duplicate email', async () => {
    const res = await request(app)
      .post('/user/request')
      .send({
        username: 'uniqueusername',
        email: 'testadmin@test.com',
        password: 'password123',
        organisationId
      });
    expect(res.status).toBe(409);
  });

  it('POST /user/request - duplicate username', async () => {
    const res = await request(app)
      .post('/user/request')
      .send({
        username: 'testadmin',
        email: 'unique@test.com',
        password: 'password123',
        organisationId
      });
    expect(res.status).toBe(409);
  });

  // GET /user/:userId
  it('GET /user/:userId - valid', async () => {
    const res = await request(app)
      .get(`/user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', 'testadmin');
  });

  it('GET /user/:userId - not found', async () => {
    const res = await request(app)
      .get('/user/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('GET /user/:userId - no auth token', async () => {
    const res = await request(app)
      .get(`/user/${userId}`);
    expect(res.status).toBe(401);
  });

  // PUT /user/updateInfo
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

  it('PUT /user/updateInfo - no auth token', async () => {
    const res = await request(app)
      .put('/user/updateInfo')
      .send({ newUsername: 'someusername' });
    expect(res.status).toBe(401);
  });

  // Admin - POST /user/create
  it('POST /user/create - valid', async () => {
    const res = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'createduser',
        email: 'createduser@test.com',
        password: 'password123',
        role: 'member'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('username', 'createduser');
  });

  it('POST /user/create - missing fields', async () => {
    const res = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ username: 'incomplete' });
    expect(res.status).toBe(400);
  });

  it('POST /user/create - duplicate email', async () => {
    const res = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'uniqueuser',
        email: 'testmember@test.com',
        password: 'password123',
        role: 'member'
      });
    expect(res.status).toBe(409);
  });

  it('POST /user/create - non admin', async () => {
    const res = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        username: 'anotheruser',
        email: 'another@test.com',
        password: 'password123',
        role: 'member'
      });
    expect(res.status).toBe(403);
  });

  // Admin - GET /user/all
  it('GET /user/all - valid', async () => {
    const res = await request(app)
      .get('/user/all')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /user/all - non admin', async () => {
    const res = await request(app)
      .get('/user/all')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  // Admin - GET /user/requests
  it('GET /user/requests - valid', async () => {
    const res = await request(app)
      .get('/user/requests')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /user/requests - non admin', async () => {
    const res = await request(app)
      .get('/user/requests')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  // Admin - POST /user/:userRequestId/accept
  it('POST /user/:userRequestId/accept - valid', async () => {
    const res = await request(app)
      .post(`/user/${userRequestId}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'User accepted successfully');
  });

  it('POST /user/:userRequestId/accept - not found', async () => {
    const res = await request(app)
      .post('/user/nonexistentid/accept')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  // Admin - POST /user/:userRequestId/reject
  it('POST /user/:userRequestId/reject - valid', async () => {
    // create a new request to reject
    const reqRes = await request(app)
      .post('/user/request')
      .send({
        username: 'torejectuser',
        email: 'toreject@test.com',
        password: 'password123',
        organisationId
      });
    const toRejectId = reqRes.body.requestId;

    const res = await request(app)
      .post(`/user/${toRejectId}/reject`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Request rejected');
  });

  it('POST /user/:userRequestId/reject - not found', async () => {
    const res = await request(app)
      .post('/user/nonexistentid/reject')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  // Admin - PUT /user/:userId/role
  it('PUT /user/:userId/role - valid', async () => {
    const memberRes = await request(app)
      .get('/user/all')
      .set('Authorization', `Bearer ${authToken}`);
    const member = memberRes.body.find((u: any) => u.username === 'testmember');

    const res = await request(app)
      .put(`/user/${member.id}/role`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newRole: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('role', 'admin');
  });

  it('PUT /user/:userId/role - invalid role', async () => {
    const memberRes = await request(app)
      .get('/user/all')
      .set('Authorization', `Bearer ${authToken}`);
    const member = memberRes.body.find((u: any) => u.username === 'testmember');

    const res = await request(app)
      .put(`/user/${member.id}/role`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newRole: 'superadmin' });
    expect(res.status).toBe(400);
  });

  it('PUT /user/:userId/role - non admin', async () => {
    const res = await request(app)
      .put(`/user/${userId}/role`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newRole: 'admin' });
    expect(res.status).toBe(403);
  });

  // Admin - DELETE /user/:userId
  it('DELETE /user/:userId - valid', async () => {
    const created = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'tobedeleted',
        email: 'tobedeleted@test.com',
        password: 'password123',
        role: 'member'
      });

    const res = await request(app)
      .delete(`/user/${created.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /user/:userId - non admin', async () => {
    const res = await request(app)
      .delete(`/user/${userId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  // DELETE /user/self/:userId
  it('DELETE /user/self/:userId - valid', async () => {
    const created = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'selfdeletion',
        email: 'selfdeletion@test.com',
        password: 'password123',
        role: 'member'
      });
    const selfLogin = await request(app)
      .post('/user/login')
      .send({ username: 'selfdeletion', password: 'password123' });
    const selfToken = selfLogin.body.authToken;

    const res = await request(app)
      .delete(`/user/self/${created.body.id}`)
      .set('Authorization', `Bearer ${selfToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /user/self/:userId - no auth token', async () => {
    const res = await request(app)
      .delete(`/user/self/${userId}`);
    expect(res.status).toBe(401);
  });
});