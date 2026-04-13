import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

describe('User routes', () => {
  let authToken: string;
  let organisationId: string;
  let userId: string;
  let memberToken: string;
  let userRequestId: string;
  let otherOrgToken: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Test Organisation',
        organisationDescription: 'Test description',
        firstName: 'Test',
        lastName: 'Admin',
        email: 'testadmin@test.com',
        password: 'password123'
      });
    authToken = res.body.authToken;
    organisationId = res.body.userInfo.organisationId;
    userId = res.body.userInfo.id;

    await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Member',
        email: 'testmember@test.com',
        password: 'password123',
        role: 'member'
      });
    const memberLogin = await request(app)
      .post('/user/login')
      .send({ email: 'testmember@test.com', password: 'password123' });
    memberToken = memberLogin.body.authToken;

    const reqRes = await request(app)
      .post('/user/request')
      .send({
        firstName: 'Request',
        lastName: 'User',
        email: 'requestuser@test.com',
        password: 'password123',
        organisationId
      });
    userRequestId = reqRes.body.requestId;
    const otherOrg = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Other Task Organisation',
        organisationDescription: 'Other description',
        firstName: 'Other',
        lastName: 'Admin',
        email: 'othertaskadmin@test.com',
        password: 'password123'
      });
    otherOrgToken = otherOrg.body.authToken;
  });

  // POST /user/login
  it('POST /user/login - valid credentials', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ email: 'testadmin@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('authToken');
    expect(res.body).toHaveProperty('userInfo');
  });

  it('POST /user/login - invalid credentials', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ email: 'testadmin@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('POST /user/login - missing fields', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ email: 'testadmin@test.com' });
    expect(res.status).toBe(400);
  });

  it('POST /user/login - non-existent email', async () => {
    const res = await request(app)
      .post('/user/login')
      .send({ email: 'nonexistent@test.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  // POST /user/request
  it('POST /user/request - valid', async () => {
    const res = await request(app)
      .post('/user/request')
      .send({
        firstName: 'New',
        lastName: 'Request',
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
      .send({ firstName: 'Incomplete' });
    expect(res.status).toBe(400);
  });

  it('POST /user/request - duplicate email', async () => {
    const res = await request(app)
      .post('/user/request')
      .send({
        firstName: 'Unique',
        lastName: 'Name',
        email: 'testadmin@test.com',
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
    expect(res.body).toHaveProperty('firstName', 'Test');
    expect(res.body).toHaveProperty('lastName', 'Admin');
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

  it('POST /user/resetPasswordRequest - missing email', async () => {
    const res = await request(app)
      .post('/user/resetPasswordRequest')
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /user/resetPasswordRequest - email does not exist', async () => {
    const res = await request(app)
      .post('/user/resetPasswordRequest')
      .send({ email: 'idontexist@test.com' });
    expect(res.status).toBe(200);
  });

  it('POST /user/resetPassword - missing fields', async () => {
    const res = await request(app)
      .post('/user/resetPassword')
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /user/resetPassword - invalid token', async () => {
    const res = await request(app)
      .post('/user/resetPassword')
      .send({ token: 'invalidtoken', newPassword: 'password123' });

    expect(res.status).toBe(401);
  });

  it('POST /user/resetPassword - valid', async () => {
    const token = jwt.sign(
      { id: userId, purpose: 'password-reset' },
      process.env.JWT_SECRET!
    );

    const res = await request(app)
      .post('/user/resetPassword')
      .send({ token, newPassword: 'newpassword123' });

    expect(res.status).toBe(200);
  });

  // Admin - POST /user/create
  it('POST /user/create - valid', async () => {
    const res = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Created',
        lastName: 'User',
        email: 'createduser@test.com',
        password: 'password123',
        role: 'member'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('firstName', 'Created');
    expect(res.body).toHaveProperty('lastName', 'User');
  });

  it('POST /user/create - missing fields', async () => {
    const res = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'Incomplete' });
    expect(res.status).toBe(400);
  });

  it('POST /user/create - duplicate email', async () => {
    const res = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Unique',
        lastName: 'User',
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
        firstName: 'Another',
        lastName: 'User',
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
    const reqRes = await request(app)
      .post('/user/request')
      .send({
        firstName: 'To',
        lastName: 'Reject',
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
  it('PUT /user/:userId/role - valid (toggles role)', async () => {
    const memberRes = await request(app)
      .get('/user/all')
      .set('Authorization', `Bearer ${authToken}`);
    const member = memberRes.body.find((u: any) => u.email === 'testmember@test.com');

    const res = await request(app)
      .put(`/user/${member.id}/role`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.role).not.toBe(member.role);
  });

it('PUT /user/:userId/role - not found', async () => {
    const res = await request(app)
      .put('/user/nonexistentid/role')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('PUT /user/:userId/role - non admin', async () => {
    const res = await request(app)
      .put(`/user/${userId}/role`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  // DELETE /user/:userId
it('DELETE /user/:userId - admin deletes user with no projects or tasks', async () => {
  const created = await request(app)
    .post('/user/create')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      firstName: 'To',
      lastName: 'Delete',
      email: 'tobedeleted@test.com',
      password: 'password123',
      role: 'member'
    });

  const res = await request(app)
    .delete(`/user/${created.body.id}`)
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(200);
});

it('DELETE /user/:userId - admin deletes user who is a project member', async () => {
  const created = await request(app)
    .post('/user/create')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      firstName: 'Project',
      lastName: 'Member',
      email: 'projectmembertodelete@test.com',
      password: 'password123',
      role: 'member'
    });
  const createdId = created.body.id;

  const project = await request(app)
    .post('/project')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ title: 'Delete Test Project', description: 'test' });
  const projectId = project.body.id;

  await request(app)
    .post(`/project/${projectId}/member/${createdId}`)
    .set('Authorization', `Bearer ${authToken}`);

  const res = await request(app)
    .delete(`/user/${createdId}`)
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(200);

  // verify user is removed from project members
  const members = await request(app)
    .get(`/project/${projectId}/members`)
    .set('Authorization', `Bearer ${authToken}`);
  expect(members.body.find((u: any) => u.id === createdId)).toBeUndefined();
});

it('DELETE /user/:userId - admin deletes user who has tasks', async () => {
  const created = await request(app)
    .post('/user/create')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      firstName: 'Task',
      lastName: 'Owner',
      email: 'taskownerdelete@test.com',
      password: 'password123',
      role: 'member'
    });
  const createdId = created.body.id;

  const project = await request(app)
    .post('/project')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ title: 'Task Delete Test Project', description: 'test' });
  const projectId = project.body.id;

  await request(app)
    .post(`/project/${projectId}/member/${createdId}`)
    .set('Authorization', `Bearer ${authToken}`);

  const taskGroup = await request(app)
    .post('/taskGroup')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ title: 'Task Delete Test Group', projectId });
  const taskGroupId = taskGroup.body.id;

  const task = await request(app)
    .post('/task')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ title: 'Task to be deleted', responsibleId: createdId, taskGroupId });
  const taskId = task.body.id;

  const res = await request(app)
    .delete(`/user/${createdId}`)
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(200);

  // verify task is gone
  const taskRes = await request(app)
    .get(`/task/${taskId}`)
    .set('Authorization', `Bearer ${authToken}`);
  expect(taskRes.status).toBe(404);
});

it('DELETE /user/:userId - user deletes themselves', async () => {
  const created = await request(app)
    .post('/user/create')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      firstName: 'Self',
      lastName: 'Delete',
      email: 'selfdelete@test.com',
      password: 'password123',
      role: 'member'
    });
  const login = await request(app)
    .post('/user/login')
    .send({ email: 'selfdelete@test.com', password: 'password123' });

  const res = await request(app)
    .delete(`/user/${created.body.id}`)
    .set('Authorization', `Bearer ${login.body.authToken}`);
  expect(res.status).toBe(200);
});

it('DELETE /user/:userId - user deletes themselves with tasks and project memberships', async () => {
  const created = await request(app)
    .post('/user/create')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      firstName: 'Self',
      lastName: 'DeleteFull',
      email: 'selfdeletefull@test.com',
      password: 'password123',
      role: 'member'
    });
  const createdId = created.body.id;
  const login = await request(app)
    .post('/user/login')
    .send({ email: 'selfdeletefull@test.com', password: 'password123' });

  const project = await request(app)
    .post('/project')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ title: 'Self Delete Project', description: 'test' });
  const projectId = project.body.id;

  await request(app)
    .post(`/project/${projectId}/member/${createdId}`)
    .set('Authorization', `Bearer ${authToken}`);

  const taskGroup = await request(app)
    .post('/taskGroup')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ title: 'Self Delete Group', projectId });

  await request(app)
    .post('/task')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ title: 'Self Delete Task', responsibleId: createdId, taskGroupId: taskGroup.body.id });

  const res = await request(app)
    .delete(`/user/${createdId}`)
    .set('Authorization', `Bearer ${login.body.authToken}`);
  expect(res.status).toBe(200);
});

it('DELETE /user/:userId - member cannot delete another user', async () => {
  const res = await request(app)
    .delete(`/user/${userId}`)
    .set('Authorization', `Bearer ${memberToken}`);
  expect(res.status).toBe(403);
});

it('DELETE /user/:userId - admin from another organisation cannot delete user', async () => {
  const res = await request(app)
    .delete(`/user/${userId}`)
    .set('Authorization', `Bearer ${otherOrgToken}`);
  expect(res.status).toBe(403);
});

it('DELETE /user/:userId - not found', async () => {
  const res = await request(app)
    .delete('/user/nonexistentid')
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).toBe(404);
});

it('DELETE /user/:userId - no auth token', async () => {
  const res = await request(app)
    .delete(`/user/${userId}`);
  expect(res.status).toBe(401);
});
});