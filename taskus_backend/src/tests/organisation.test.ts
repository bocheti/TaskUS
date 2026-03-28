import request from 'supertest';
import app from '../app';

describe('Organisation routes', () => {
  let authToken: string;
  let organisationId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Test Organisation',
        organisationDescription: 'Test description',
        firstName: 'Org',
        lastName: 'Admin',
        email: 'orgadmin@test.com',
        password: 'password123'
      });
    authToken = res.body.authToken;
    organisationId = res.body.userInfo.organisationId;
  });

  // POST /organisation
  it('POST /organisation - missing required fields', async () => {
    const res = await request(app)
      .post('/organisation')
      .send({ organisationName: 'Incomplete Org' });
    expect(res.status).toBe(400);
  });

  it('POST /organisation - duplicate email', async () => {
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Another Org',
        organisationDescription: 'Another description',
        firstName: 'Another',
        lastName: 'Admin',
        email: 'orgadmin@test.com',
        password: 'password123'
      });
    expect(res.status).toBe(409);
  });

  // GET /organisation/:organisationId
  it('GET /organisation/:organisationId - valid', async () => {
    const res = await request(app)
      .get(`/organisation/${organisationId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Test Organisation');
  });

  it('GET /organisation/:organisationId - not found', async () => {
    const res = await request(app)
      .get('/organisation/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('GET /organisation/:organisationId - no auth token', async () => {
    const res = await request(app)
      .get(`/organisation/${organisationId}`);
    expect(res.status).toBe(401);
  });

  it('GET /organisation/:organisationId - unauthorized (wrong org)', async () => {
    const res2 = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Other Organisation',
        organisationDescription: 'Other description',
        firstName: 'Other',
        lastName: 'Admin',
        email: 'otheradmin@test.com',
        password: 'password123'
      });
    const otherOrgId = res2.body.userInfo.organisationId;

    const res = await request(app)
      .get(`/organisation/${otherOrgId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(403);
  });

  // PUT /organisation
  it('PUT /organisation - update name only', async () => {
    const res = await request(app)
      .put('/organisation')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newName: 'Updated Organisation' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Organisation');
  });

  it('PUT /organisation - update description only', async () => {
    const res = await request(app)
      .put('/organisation')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newDescription: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('description', 'Updated description');
  });

  it('PUT /organisation - update all fields', async () => {
    const res = await request(app)
      .put('/organisation')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        newName: 'Fully Updated Org',
        newDescription: 'Fully updated description'
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Fully Updated Org');
    expect(res.body).toHaveProperty('description', 'Fully updated description');
  });

  it('PUT /organisation - no fields provided', async () => {
    const res = await request(app)
      .put('/organisation')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('PUT /organisation - no auth token', async () => {
    const res = await request(app)
      .put('/organisation')
      .send({ newName: 'Updated Organisation' });
    expect(res.status).toBe(401);
  });

  it('PUT /organisation - non admin', async () => {
    await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Member',
        lastName: 'User',
        email: 'member@test.com',
        password: 'password123',
        role: 'member'
      });
    const memberLogin = await request(app)
      .post('/user/login')
      .send({ email: 'member@test.com', password: 'password123' });
    const memberToken = memberLogin.body.authToken;

    const res = await request(app)
      .put('/organisation')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newName: 'Updated Organisation' });
    expect(res.status).toBe(403);
  });
});