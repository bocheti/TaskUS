// src/tests/taskGroup.test.ts
import request from 'supertest';
import app from '../app';

describe('TaskGroup routes', () => {
  let authToken: string;
  let memberToken: string;
  let memberId: string;
  let projectId: string;
  let taskGroupId: string;
  let otherOrgToken: string;

  beforeAll(async () => {
    // create org and admin
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'TaskGroup Test Organisation',
        organisationDescription: 'Test description',
        username: 'taskgroupadmin',
        email: 'taskgroupadmin@test.com',
        password: 'password123'
      });
    authToken = res.body.authToken;

    // create a member
    const memberRes = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'taskgroupmember',
        email: 'taskgroupmember@test.com',
        password: 'password123',
        role: 'member'
      });
    memberId = memberRes.body.id;
    const memberLogin = await request(app)
      .post('/user/login')
      .send({ username: 'taskgroupmember', password: 'password123' });
    memberToken = memberLogin.body.authToken;

    // create a project and add member to it
    const projectRes = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Project', description: 'Test description' });
    projectId = projectRes.body.id;

    await request(app)
      .post(`/project/${projectId}/member/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    // create a task group
    const taskGroupRes = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test TaskGroup', description: 'Test description', projectId });
    taskGroupId = taskGroupRes.body.id;

    // create another org for cross-org tests
    const otherOrg = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Other Organisation',
        organisationDescription: 'Other description',
        username: 'othertaskgroupadmin',
        email: 'othertaskgroupadmin@test.com',
        password: 'password123'
      });
    otherOrgToken = otherOrg.body.authToken;
  });

  // POST /taskGroup
  it('POST /taskGroup - valid', async () => {
    const res = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'New TaskGroup', description: 'New description', projectId });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', 'New TaskGroup');
    expect(res.body).toHaveProperty('projectId', projectId);
  });

  it('POST /taskGroup - missing title', async () => {
    const res = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'No title', projectId });
    expect(res.status).toBe(400);
  });

  it('POST /taskGroup - missing projectId', async () => {
    const res = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'No project' });
    expect(res.status).toBe(400);
  });

  it('POST /taskGroup - project not found', async () => {
    const res = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'New TaskGroup', projectId: 'nonexistentid' });
    expect(res.status).toBe(404);
  });

  it('POST /taskGroup - wrong organisation', async () => {
    const res = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${otherOrgToken}`)
      .send({ title: 'New TaskGroup', projectId });
    expect(res.status).toBe(403);
  });

  it('POST /taskGroup - non admin', async () => {
    const res = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'New TaskGroup', projectId });
    expect(res.status).toBe(403);
  });

  it('POST /taskGroup - no auth token', async () => {
    const res = await request(app)
      .post('/taskGroup')
      .send({ title: 'New TaskGroup', projectId });
    expect(res.status).toBe(401);
  });

  // GET /taskGroup/:taskGroupId
  it('GET /taskGroup/:taskGroupId - valid as admin', async () => {
    const res = await request(app)
      .get(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test TaskGroup');
    expect(res.body).toHaveProperty('projectId', projectId);
  });

  it('GET /taskGroup/:taskGroupId - valid as member', async () => {
    const res = await request(app)
      .get(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /taskGroup/:taskGroupId - not found', async () => {
    const res = await request(app)
      .get('/taskGroup/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('GET /taskGroup/:taskGroupId - no auth token', async () => {
    const res = await request(app)
      .get(`/taskGroup/${taskGroupId}`);
    expect(res.status).toBe(401);
  });

  it('GET /taskGroup/:taskGroupId - unauthorized (not a member)', async () => {
    const res = await request(app)
      .get(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${otherOrgToken}`);
    expect(res.status).toBe(403);
  });

  // GET /taskGroup/byProject/:projectId
  it('GET /taskGroup/byProject/:projectId - valid as admin', async () => {
    const res = await request(app)
      .get(`/taskGroup/byProject/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /taskGroup/byProject/:projectId - valid as member', async () => {
    const res = await request(app)
      .get(`/taskGroup/byProject/${projectId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /taskGroup/byProject/:projectId - no auth token', async () => {
    const res = await request(app)
      .get(`/taskGroup/byProject/${projectId}`);
    expect(res.status).toBe(401);
  });

  it('GET /taskGroup/byProject/:projectId - unauthorized (wrong org)', async () => {
    const res = await request(app)
      .get(`/taskGroup/byProject/${projectId}`)
      .set('Authorization', `Bearer ${otherOrgToken}`);
    expect(res.status).toBe(403);
  });

  // PUT /taskGroup/:taskGroupId
  it('PUT /taskGroup/:taskGroupId - update title', async () => {
    const res = await request(app)
      .put(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newTitle: 'Updated TaskGroup' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Updated TaskGroup');
  });

  it('PUT /taskGroup/:taskGroupId - update description', async () => {
    const res = await request(app)
      .put(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newDescription: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('description', 'Updated description');
  });

  it('PUT /taskGroup/:taskGroupId - update both fields', async () => {
    const res = await request(app)
      .put(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newTitle: 'Fully Updated', newDescription: 'Fully updated description' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Fully Updated');
    expect(res.body).toHaveProperty('description', 'Fully updated description');
  });

  it('PUT /taskGroup/:taskGroupId - no fields provided', async () => {
    const res = await request(app)
      .put(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('PUT /taskGroup/:taskGroupId - not found', async () => {
    const res = await request(app)
      .put('/taskGroup/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newTitle: 'Updated' });
    expect(res.status).toBe(404);
  });

  it('PUT /taskGroup/:taskGroupId - wrong organisation', async () => {
    const res = await request(app)
      .put(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${otherOrgToken}`)
      .send({ newTitle: 'Updated' });
    expect(res.status).toBe(403);
  });

  it('PUT /taskGroup/:taskGroupId - non admin', async () => {
    const res = await request(app)
      .put(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ newTitle: 'Updated' });
    expect(res.status).toBe(403);
  });

  it('PUT /taskGroup/:taskGroupId - no auth token', async () => {
    const res = await request(app)
      .put(`/taskGroup/${taskGroupId}`)
      .send({ newTitle: 'Updated' });
    expect(res.status).toBe(401);
  });

  // DELETE /taskGroup/:taskGroupId
  it('DELETE /taskGroup/:taskGroupId - valid', async () => {
    const newTaskGroup = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'To Be Deleted', projectId });

    const res = await request(app)
      .delete(`/taskGroup/${newTaskGroup.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /taskGroup/:taskGroupId - cascades to tasks', async () => {
    const newTaskGroup = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Cascade TaskGroup', projectId });
    const cascadeTaskGroupId = newTaskGroup.body.id;

    const adminRes = await request(app)
      .get('/user/all')
      .set('Authorization', `Bearer ${authToken}`);
    const admin = adminRes.body.find((u: any) => u.username === 'taskgroupadmin');

    await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Cascade Task', responsibleId: admin.id, taskGroupId: cascadeTaskGroupId });

    const deleteRes = await request(app)
      .delete(`/taskGroup/${cascadeTaskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(deleteRes.status).toBe(200);

    const taskGroupRes = await request(app)
      .get(`/taskGroup/${cascadeTaskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(taskGroupRes.status).toBe(404);
  });

  it('DELETE /taskGroup/:taskGroupId - not found', async () => {
    const res = await request(app)
      .delete('/taskGroup/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('DELETE /taskGroup/:taskGroupId - wrong organisation', async () => {
    const res = await request(app)
      .delete(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${otherOrgToken}`);
    expect(res.status).toBe(403);
  });

  it('DELETE /taskGroup/:taskGroupId - non admin', async () => {
    const res = await request(app)
      .delete(`/taskGroup/${taskGroupId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it('DELETE /taskGroup/:taskGroupId - no auth token', async () => {
    const res = await request(app)
      .delete(`/taskGroup/${taskGroupId}`);
    expect(res.status).toBe(401);
  });
});