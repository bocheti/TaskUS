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
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Task Test Organisation',
        organisationDescription: 'Test description',
        firstName: 'Task',
        lastName: 'Admin',
        email: 'taskadmin@test.com',
        password: 'password123'
      });
    authToken = res.body.authToken;
    adminId = res.body.userInfo.userId;

    const memberRes = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Task',
        lastName: 'Member',
        email: 'taskmember@test.com',
        password: 'password123',
        role: 'member'
      });
    memberId = memberRes.body.id;
    const memberLogin = await request(app)
      .post('/user/login')
      .send({ email: 'taskmember@test.com', password: 'password123' });
    memberToken = memberLogin.body.authToken;

    const projectRes = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task Test Project', description: 'Test description' });
    projectId = projectRes.body.id;

    await request(app)
      .post(`/project/${projectId}/member/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const taskGroupRes = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task Test Group', projectId });
    taskGroupId = taskGroupRes.body.id;

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

  // POST /task
  it('POST /task - valid', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'New Task', description: 'New description', responsibleId: memberId, taskGroupId });
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

  it('POST /task - with deadline', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Task With Deadline',
        responsibleId: memberId,
        taskGroupId,
        deadline: '31/12/2026'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('deadline', '2026-12-31T23:59:00.000Z');
  });

  it('POST /task - invalid deadline format', async () => {
    const res = await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Bad Deadline Task',
        responsibleId: memberId,
        taskGroupId,
        deadline: '2026-12-31'
      });
    expect(res.status).toBe(400);
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
    await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Not',
        lastName: 'Responsible',
        email: 'notresponsible@test.com',
        password: 'password123',
        role: 'member'
      });
    const notResponsibleLogin = await request(app)
      .post('/user/login')
      .send({ email: 'notresponsible@test.com', password: 'password123' });
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
      .send({ email: 'notresponsible@test.com', password: 'password123' });
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

  // PUT /task/:taskId (editTask)
  it('PUT /task/:taskId - valid', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newResponsibleId: adminId });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('responsibleId', adminId);
  });

  it('PUT /task/:taskId - no fields provided', async () => {
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
        firstName: 'Another',
        lastName: 'Admin',
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

  it('PUT /task/:taskId - update deadline', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newDeadline: '15/01/2027' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('deadline', '2027-01-15T23:59:00.000Z');
  });

  it('PUT /task/:taskId - clear deadline', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newDeadline: null });
    expect(res.status).toBe(200);
    expect(res.body.deadline).toBeNull();
  });

  it('PUT /task/:taskId - invalid deadline format', async () => {
    const res = await request(app)
      .put(`/task/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newDeadline: '2027-01-15' });
    expect(res.status).toBe(400);
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