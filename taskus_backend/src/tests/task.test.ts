// src/tests/task.test.ts
import request from 'supertest';
import app from '../app';

describe('Task routes', () => {
  let authToken: string;
  let memberToken: string;
  let memberId: string;
  let adminId: string;
  let projectId: string;
  let taskGroupId: string;
  let taskId: string;
  let otherOrgToken: string;

  beforeAll(async () => {
    // create org and admin
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Task Test Organisation',
        organisationDescription: 'Test description',
        username: 'taskadmin',
        email: 'taskadmin@test.com',
        password: 'password123'
      });
    authToken = res.body.authToken;
    adminId = res.body.userInfo.userId;

    // create a member
    const memberRes = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'taskmember',
        email: 'taskmember@test.com',
        password: 'password123',
        role: 'member'
      });
    memberId = memberRes.body.id;
    const memberLogin = await request(app)
      .post('/user/login')
      .send({ username: 'taskmember', password: 'password123' });
    memberToken = memberLogin.body.authToken;

    // create project and add member
    const projectRes = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task Test Project', description: 'Test description' });
    projectId = projectRes.body.id;

    await request(app)
      .post(`/project/${projectId}/member/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    // create task group
    const taskGroupRes = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task Test Group', projectId });
    taskGroupId = taskGroupRes.body.id;

    // create a task assigned to the member
    const taskRes = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Task',
        description: 'Test description',
        responsibleId: memberId,
        taskGroupId
      });
    taskId = taskRes.body.id;

    // create another org for cross-org tests
    const otherOrg = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Other Task Organisation',
        organisationDescription: 'Other description',
        username: 'othertaskadmin',
        email: 'othertaskadmin@test.com',
        password: 'password123'
      });
    otherOrgToken = otherOrg.body.authToken;
  });

  // POST /task
  it('POST /task - valid', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'New Task',
        description: 'New description',
        responsibleId: memberId,
        taskGroupId
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', 'New Task');
    expect(res.body).toHaveProperty('status', 'Pending');
    expect(res.body).toHaveProperty('id');
  });

  it('POST /task - missing title', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ responsibleId: memberId, taskGroupId });
    expect(res.status).toBe(400);
  });

  it('POST /task - missing responsibleId', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'New Task', taskGroupId });
    expect(res.status).toBe(400);
  });

  it('POST /task - missing taskGroupId', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'New Task', responsibleId: memberId });
    expect(res.status).toBe(400);
  });

  it('POST /task - responsible user not found', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'New Task', responsibleId: 'nonexistentid', taskGroupId });
    expect(res.status).toBe(404);
  });

  it('POST /task - task group not found', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'New Task', responsibleId: memberId, taskGroupId: 'nonexistentid' });
    expect(res.status).toBe(404);
  });

  it('POST /task - responsible user from different organisation', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${otherOrgToken}`)
      .send({ title: 'New Task', responsibleId: memberId, taskGroupId });
    expect(res.status).toBe(403);
  });

  it('POST /task - non admin', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'New Task', responsibleId: memberId, taskGroupId });
    expect(res.status).toBe(403);
  });

  it('POST /task - no auth token', async () => {
    const res = await request(app)
      .post('/task')
      .send({ title: 'New Task', responsibleId: memberId, taskGroupId });
    expect(res.status).toBe(401);
  });

  // GET /task/:taskId
  it('GET /task/:taskId - valid as responsible member', async () => {
    const res = await request(app)
      .get(`/task/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test Task');
    expect(res.body).toHaveProperty('id', taskId);
  });

  it('GET /task/:taskId - valid as admin', async () => {
    const res = await request(app)
      .get(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /task/:taskId - not found', async () => {
    const res = await request(app)
      .get('/task/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('GET /task/:taskId - no auth token', async () => {
    const res = await request(app)
      .get(`/task/${taskId}`);
    expect(res.status).toBe(401);
  });

  it('GET /task/:taskId - unauthorized (not responsible nor admin)', async () => {
    // create another member not responsible for the task
    await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'notresponsible',
        email: 'notresponsible@test.com',
        password: 'password123',
        role: 'member'
      });
    const notResponsibleLogin = await request(app)
      .post('/user/login')
      .send({ username: 'notresponsible', password: 'password123' });
    const notResponsibleToken = notResponsibleLogin.body.authToken;

    const res = await request(app)
      .get(`/task/${taskId}`)
      .set('Authorization', `Bearer ${notResponsibleToken}`);
    expect(res.status).toBe(403);
  });

  // PUT /task/status/:taskId
  it('PUT /task/status/:taskId - valid as responsible member', async () => {
    const res = await request(app)
      .put(`/task/status/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newStatus: 'InProgress' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'InProgress');
    expect(res.body.completedAt).toBeNull();
  });

  it('PUT /task/status/:taskId - set to done sets completedAt', async () => {
    const res = await request(app)
      .put(`/task/status/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newStatus: 'Done' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'Done');
    expect(res.body.completedAt).not.toBeNull();
  });

  it('PUT /task/status/:taskId - set back to pending clears completedAt', async () => {
    const res = await request(app)
      .put(`/task/status/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newStatus: 'Pending' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'Pending');
    expect(res.body.completedAt).toBeNull();
  });

  it('PUT /task/status/:taskId - valid as admin', async () => {
    const res = await request(app)
      .put(`/task/status/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newStatus: 'InProgress' });
    expect(res.status).toBe(200);
  });

  it('PUT /task/status/:taskId - invalid status', async () => {
    const res = await request(app)
      .put(`/task/status/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newStatus: 'InvalidStatus' });
    expect(res.status).toBe(400);
  });

  it('PUT /task/status/:taskId - missing status', async () => {
    const res = await request(app)
      .put(`/task/status/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('PUT /task/status/:taskId - not found', async () => {
    const res = await request(app)
      .put('/task/status/nonexistentid')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newStatus: 'Done' });
    expect(res.status).toBe(404);
  });

  it('PUT /task/status/:taskId - unauthorized (not responsible nor admin)', async () => {
    const notResponsibleLogin = await request(app)
      .post('/user/login')
      .send({ username: 'notresponsible', password: 'password123' });
    const notResponsibleToken = notResponsibleLogin.body.authToken;

    const res = await request(app)
      .put(`/task/status/${taskId}`)
      .set('Authorization', `Bearer ${notResponsibleToken}`)
      .send({ newStatus: 'Done' });
    expect(res.status).toBe(403);
  });

  it('PUT /task/status/:taskId - no auth token', async () => {
    const res = await request(app)
      .put(`/task/status/${taskId}`)
      .send({ newStatus: 'Done' });
    expect(res.status).toBe(401);
  });

  // GET /task/byUser
  it('GET /task/byUser - valid', async () => {
    const res = await request(app)
      .get('/task/byUser')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /task/byUser - no auth token', async () => {
    const res = await request(app)
      .get('/task/byUser');
    expect(res.status).toBe(401);
  });

  // GET /task/byTaskGroup/:taskGroupId
  it('GET /task/byTaskGroup/:taskGroupId - valid as admin', async () => {
    const res = await request(app)
      .get(`/task/byTaskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /task/byTaskGroup/:taskGroupId - valid as member', async () => {
    const res = await request(app)
      .get(`/task/byTaskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /task/byTaskGroup/:taskGroupId - task group not found', async () => {
    const res = await request(app)
      .get('/task/byTaskGroup/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('GET /task/byTaskGroup/:taskGroupId - unauthorized (wrong org)', async () => {
    const res = await request(app)
      .get(`/task/byTaskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${otherOrgToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /task/byTaskGroup/:taskGroupId - no auth token', async () => {
    const res = await request(app)
      .get(`/task/byTaskGroup/${taskGroupId}`);
    expect(res.status).toBe(401);
  });

  // GET /task/byProject/:projectId
  it('GET /task/byProject/:projectId - valid as admin', async () => {
    const res = await request(app)
      .get(`/task/byProject/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /task/byProject/:projectId - unauthorized (not member)', async () => {
  const res = await request(app)
    .get(`/task/byProject/${projectId}`)
    .set('Authorization', `Bearer ${memberToken}`);
  expect(res.status).toBe(403);
});

  it('GET /task/byProject/:projectId - unauthorized (wrong org)', async () => {
    const res = await request(app)
      .get(`/task/byProject/${projectId}`)
      .set('Authorization', `Bearer ${otherOrgToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /task/byProject/:projectId - no auth token', async () => {
    const res = await request(app)
      .get(`/task/byProject/${projectId}`);
    expect(res.status).toBe(401);
  });

  // PUT /task/:taskId (changeResponsible)
  it('PUT /task/:taskId - valid', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newResponsibleId: adminId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('responsibleId', adminId);
  });

  it('PUT /task/:taskId - missing newResponsibleId', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('PUT /task/:taskId - task not found', async () => {
    const res = await request(app)
      .put('/task/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newResponsibleId: memberId });
    expect(res.status).toBe(404);
  });

  it('PUT /task/:taskId - new responsible not found', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newResponsibleId: 'nonexistentid' });
    expect(res.status).toBe(404);
  });

  it('PUT /task/:taskId - new responsible from different organisation', async () => {
    const otherOrgMember = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Another Task Organisation',
        organisationDescription: 'Another description',
        username: 'anothertaskadmin',
        email: 'anothertaskadmin@test.com',
        password: 'password123'
      });
    const otherUserId = otherOrgMember.body.userInfo.userId;

    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newResponsibleId: otherUserId });
    expect(res.status).toBe(403);
  });

  it('PUT /task/:taskId - non admin', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newResponsibleId: memberId });
    expect(res.status).toBe(403);
  });

  it('PUT /task/:taskId - no auth token', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .send({ newResponsibleId: memberId });
    expect(res.status).toBe(401);
  });

  // DELETE /task/:taskId
  it('DELETE /task/:taskId - valid', async () => {
    const newTask = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'To Be Deleted', responsibleId: memberId, taskGroupId });

    const res = await request(app)
      .delete(`/task/${newTask.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /task/:taskId - not found', async () => {
    const res = await request(app)
      .delete('/task/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('DELETE /task/:taskId - non admin', async () => {
    const res = await request(app)
      .delete(`/task/${taskId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it('DELETE /task/:taskId - no auth token', async () => {
    const res = await request(app)
      .delete(`/task/${taskId}`);
    expect(res.status).toBe(401);
  });

  it('DELETE /task/:taskId - wrong organisation', async () => {
    const res = await request(app)
      .delete(`/task/${taskId}`)
      .set('Authorization', `Bearer ${otherOrgToken}`);
    expect(res.status).toBe(403);
  });
});