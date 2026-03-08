import request from 'supertest';
import app from '../app';

describe('Project routes', () => {
  let authToken: string;
  let organisationId: string;
  let userId: string;
  let memberToken: string;
  let memberId: string;
  let projectId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Test Organisation',
        organisationDescription: 'Test description',
        firstName: 'Project',
        lastName: 'Admin',
        email: 'projectadmin@test.com',
        password: 'password123'
      });
    authToken = res.body.authToken;
    organisationId = res.body.userInfo.organisationId;
    userId = res.body.userInfo.userId;

    const memberRes = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Project',
        lastName: 'Member',
        email: 'projectmember@test.com',
        password: 'password123',
        role: 'member'
      });
    memberId = memberRes.body.id;
    const memberLogin = await request(app)
      .post('/user/login')
      .send({ email: 'projectmember@test.com', password: 'password123' });
    memberToken = memberLogin.body.authToken;

    const projectRes = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Project', description: 'Test project description' });
    projectId = projectRes.body.id;
  });

  // POST /project
  it('POST /project - valid', async () => {
    const res = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'New Project', description: 'New description' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', 'New Project');
  });

  it('POST /project - missing title', async () => {
    const res = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ description: 'No title' });
    expect(res.status).toBe(400);
  });

  it('POST /project - no auth token', async () => {
    const res = await request(app)
      .post('/project')
      .send({ title: 'New Project' });
    expect(res.status).toBe(401);
  });

  it('POST /project - non admin', async () => {
    const res = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ title: 'New Project' });
    expect(res.status).toBe(403);
  });

  // GET /project/:projectId
  it('GET /project/:projectId - valid as admin', async () => {
    const res = await request(app)
      .get(`/project/${projectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Test Project');
  });

  it('GET /project/:projectId - valid as member', async () => {
    await request(app)
      .post(`/project/${projectId}/member/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const res = await request(app)
      .get(`/project/${projectId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /project/:projectId - not found', async () => {
    const res = await request(app)
      .get('/project/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('GET /project/:projectId - no auth token', async () => {
    const res = await request(app)
      .get(`/project/${projectId}`);
    expect(res.status).toBe(401);
  });

  it('GET /project/:projectId - unauthorized (not a member)', async () => {
    const otherOrg = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Other Organisation',
        organisationDescription: 'Other description',
        firstName: 'Other',
        lastName: 'Admin',
        email: 'otheradmin@test.com',
        password: 'password123'
      });
    const otherToken = otherOrg.body.authToken;

    const res = await request(app)
      .get(`/project/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  // GET /project/byUser
  it('GET /project/byUser - valid', async () => {
    const res = await request(app)
      .get('/project/byUser')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /project/byUser - no auth token', async () => {
    const res = await request(app)
      .get('/project/byUser');
    expect(res.status).toBe(401);
  });

  // GET /project/all (admin)
  it('GET /project/all - valid', async () => {
    const res = await request(app)
      .get('/project/all')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /project/all - non admin', async () => {
    const res = await request(app)
      .get('/project/all')
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  // DELETE /project/:projectId
  it('DELETE /project/:projectId - valid', async () => {
    const newProject = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'To Be Deleted' });

    const res = await request(app)
      .delete(`/project/${newProject.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /project/:projectId - not found', async () => {
    const res = await request(app)
      .delete('/project/nonexistentid')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('DELETE /project/:projectId - non admin', async () => {
    const res = await request(app)
      .delete(`/project/${projectId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it('DELETE /project/:projectId - wrong organisation', async () => {
    const otherOrg = await request(app)
      .post('/organisation')
      .send({
        organisationName: 'Another Organisation',
        organisationDescription: 'Another description',
        firstName: 'Another',
        lastName: 'Admin',
        email: 'anotheradmin@test.com',
        password: 'password123'
      });
    const otherToken = otherOrg.body.authToken;

    const res = await request(app)
      .delete(`/project/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  // POST /project/:projectId/member/:userId
  it('POST /project/:projectId/member/:userId - valid', async () => {
    const newMember = await request(app)
      .post('/user/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'New',
        lastName: 'Member',
        email: 'newprojectmember@test.com',
        password: 'password123',
        role: 'member'
      });

    const res = await request(app)
      .post(`/project/${projectId}/member/${newMember.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(201);
  });

  it('POST /project/:projectId/member/:userId - already a member', async () => {
    const res = await request(app)
      .post(`/project/${projectId}/member/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(409);
  });

  it('POST /project/:projectId/member/:userId - user not found', async () => {
    const res = await request(app)
      .post(`/project/${projectId}/member/nonexistentid`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });

  it('POST /project/:projectId/member/:userId - non admin', async () => {
    const res = await request(app)
      .post(`/project/${projectId}/member/${memberId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  // DELETE /project/:projectId/member/:userId
  it('DELETE /project/:projectId/member/:userId - valid', async () => {
    const res = await request(app)
      .delete(`/project/${projectId}/member/${memberId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /project/:projectId/member/:userId - non admin', async () => {
    const res = await request(app)
      .delete(`/project/${projectId}/member/${memberId}`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  // Cascade deletion
  it('DELETE /project/:projectId - cascades to taskgroups and tasks', async () => {
    const projectRes = await request(app)
      .post('/project')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Cascade Test Project', description: 'test' });
    const cascadeProjectId = projectRes.body.id;

    const taskGroupRes = await request(app)
      .post('/taskGroup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Cascade Task Group', projectId: cascadeProjectId });
    const cascadeTaskGroupId = taskGroupRes.body.id;

    await request(app)
      .post('/task')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Cascade Task', responsibleId: userId, taskGroupId: cascadeTaskGroupId });

    const deleteRes = await request(app)
      .delete(`/project/${cascadeProjectId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(deleteRes.status).toBe(200);

    const taskGroupRes2 = await request(app)
      .get(`/taskGroup/${cascadeTaskGroupId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(taskGroupRes2.status).toBe(404);
  });
});