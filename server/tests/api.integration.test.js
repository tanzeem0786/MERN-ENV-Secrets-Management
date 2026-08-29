import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Membership from '../src/modules/organizations/membership.model.js';
import AuditLog from '../src/modules/audit/audit.model.js';

let mongo;
let owner;
let ownerAgent;
let outsiderAgent;
let viewerAgent;
let developerAgent;
let organizationA;
let organizationB;
let projectA;
let projectB;
let environmentA;
let secretA;

const registerAndLogin = async (name, email) => {
  const agent = request.agent(app);
  const registration = await agent.post('/api/auth/register').send({ name, email, password: 'test-password-123' });
  expect(registration.status).toBe(201);
  const login = await agent.post('/api/auth/login').send({ email, password: 'test-password-123' });
  expect(login.status).toBe(200);
  expect(login.body.data.token).toBeUndefined();
  return { agent, userId: registration.body.data.user._id };
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  const result = await registerAndLogin('Owner User', 'owner@example.test');
  ownerAgent = result.agent;
  owner = result.userId;
  organizationA = (await ownerAgent.post('/api/organizations').send({ name: 'Organization A' })).body.data.organization;
  organizationB = (await ownerAgent.post('/api/organizations').send({ name: 'Organization B' })).body.data.organization;
  projectA = (await ownerAgent.post('/api/projects').send({ name: 'Project A', organizationId: organizationA._id })).body.data.project;
  projectB = (await ownerAgent.post('/api/projects').send({ name: 'Project B', organizationId: organizationB._id })).body.data.project;
  environmentA = (await ownerAgent.post('/api/environments').send({ name: 'Development', projectId: projectA._id })).body.data.environment;
  secretA = (await ownerAgent.post('/api/secrets').send({ key: 'DATABASE_URL', value: 'never-return-this-value', environmentId: environmentA._id })).body.data.secret;

  outsiderAgent = (await registerAndLogin('Outsider User', 'outsider@example.test')).agent;
  const viewer = await registerAndLogin('Viewer User', 'viewer@example.test');
  viewerAgent = viewer.agent;
  await Membership.create({ userId: viewer.userId, organizationId: organizationA._id, role: 'viewer' });
  const developer = await registerAndLogin('Developer User', 'developer@example.test');
  developerAgent = developer.agent;
  await Membership.create({ userId: developer.userId, organizationId: organizationA._id, role: 'developer' });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

describe('authentication and leakage controls', () => {
  it('protects /me and does not return passwords or tokens in JSON', async () => {
    const response = await ownerAgent.get('/api/auth/me');
    expect(response.status).toBe(200);
    expect(response.body.data.user.password).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toContain('test-password-123');
  });

  it('rejects missing and malformed JWT cookies', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Cookie', 'accessToken=malformed')).status).toBe(401);
  });

  it('rejects duplicate registration and invalid credentials safely', async () => {
    const duplicate = await request(app).post('/api/auth/register').send({ name: 'Owner User', email: 'owner@example.test', password: 'test-password-123' });
    expect(duplicate.status).toBe(409);
    const incorrect = await request(app).post('/api/auth/login').send({ email: 'owner@example.test', password: 'incorrect-password' });
    expect(incorrect.status).toBe(401);
    expect(JSON.stringify(incorrect.body)).not.toContain('incorrect-password');
  });
});

describe('multi-tenant isolation and CRUD', () => {
  it('creates the owner membership and isolates organization resources', async () => {
    const membership = await Membership.findOne({ userId: owner, organizationId: organizationA._id });
    expect(membership.role).toBe('owner');
    expect((await outsiderAgent.get(`/api/organizations/${organizationA._id}`)).status).toBe(403);
    expect((await outsiderAgent.get(`/api/projects/${projectA._id}`)).status).toBe(403);
    expect((await outsiderAgent.get(`/api/environments/${environmentA._id}`)).status).toBe(403);
    expect((await outsiderAgent.post(`/api/secrets/${secretA._id}/reveal`)).status).toBe(403);
    expect((await outsiderAgent.get('/api/audit-logs')).status).toBe(403);
  });

  it('supports project, environment, and secret lifecycle operations', async () => {
    const updatedProject = await ownerAgent.patch(`/api/projects/${projectA._id}`).send({ description: 'updated' });
    expect(updatedProject.status).toBe(200);
    const updatedEnvironment = await ownerAgent.patch(`/api/environments/${environmentA._id}`).send({ description: 'updated' });
    expect(updatedEnvironment.status).toBe(200);
    const listed = await ownerAgent.get(`/api/secrets?environmentId=${environmentA._id}`);
    expect(listed.status).toBe(200);
    const body = JSON.stringify(listed.body);
    expect(body).not.toContain('never-return-this-value');
    expect(body).not.toMatch(/encryptedValue|authTag|"iv"/);
    const revealed = await ownerAgent.post(`/api/secrets/${secretA._id}/reveal`);
    expect(revealed.status).toBe(200);
    expect(revealed.body.data.secret.value).toBe('never-return-this-value');
    const updatedSecret = await ownerAgent.patch(`/api/secrets/${secretA._id}`).send({ description: 'updated' });
    expect(updatedSecret.status).toBe(200);
    expect(JSON.stringify(updatedSecret.body)).not.toMatch(/encryptedValue|authTag|"iv"/);
  });

  it('rejects validation failures with a stable 400 response', async () => {
    const response = await ownerAgent.post('/api/projects').send({ name: '', organizationId: organizationA._id });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeTruthy();
    expect((await ownerAgent.get('/api/projects/not-an-id')).status).toBe(400);
  });
});

describe('RBAC and audit behavior', () => {
  it('allows viewers to read but denies writes with HTTP 403', async () => {
    expect((await viewerAgent.get(`/api/projects/${projectA._id}`)).status).toBe(200);
    expect((await viewerAgent.post('/api/projects').send({ name: 'Denied Project', organizationId: organizationA._id })).status).toBe(403);
    expect((await viewerAgent.delete(`/api/secrets/${secretA._id}`)).status).toBe(403);
  });

  it('allows developers to create and reveal secrets but denies deletion', async () => {
    const created = await developerAgent.post('/api/secrets').send({ key: 'DEVELOPER_KEY', value: 'developer-only-value', environmentId: environmentA._id });
    expect(created.status).toBe(201);
    const reveal = await developerAgent.post(`/api/secrets/${created.body.data.secret._id}/reveal`);
    expect(reveal.status).toBe(200);
    expect((await developerAgent.delete(`/api/secrets/${created.body.data.secret._id}`)).status).toBe(403);
  });

  it('records denied operations and scopes audit logs to the member organization', async () => {
    const denied = await AuditLog.findOne({ action: 'PERMISSION_DENIED', status: 'denied' }).lean();
    expect(denied).toBeTruthy();
    expect(denied.organizationId.toString()).toBe(organizationA._id.toString());
    const response = await ownerAgent.get('/api/audit-logs');
    expect(response.status).toBe(200);
    expect(response.body.data.logs.every((log) => log.organizationId.toString() === organizationA._id.toString())).toBe(true);
    expect(JSON.stringify(response.body)).not.toContain('never-return-this-value');
  });
});
