import axios from 'axios';
import { buildCookieHeader, readSession } from '../auth/session.js';

export function getApiBaseUrl() {
  return process.env.MERNSECRETS_API_URL || 'http://localhost:4000/api';
}

function normalizeCookieHeader(setCookieHeader) {
  if (!setCookieHeader) {
    return '';
  }

  const headerValues = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  return headerValues.join('; ');
}

export function extractAccessToken(setCookieHeader) {
  const headerValue = normalizeCookieHeader(setCookieHeader);
  const match = headerValue.match(/accessToken=([^;]+)/i);

  if (!match) {
    return '';
  }

  return match[1];
}

export function createApiClient(session = readSession()) {
  const headers = session?.accessToken ? { Cookie: buildCookieHeader(session) } : {};

  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  });
}

export async function loginWithCredentials(email, password) {
  const client = createApiClient();
  const response = await client.post('/auth/login', { email, password });
  const accessToken = extractAccessToken(response.headers['set-cookie']);

  if (!accessToken) {
    throw new Error('Authentication succeeded but no session token was returned.');
  }

  return { email, accessToken };
}

export async function logoutWithSession(session = readSession()) {
  if (!session?.accessToken) {
    return false;
  }

  const client = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      Cookie: buildCookieHeader(session),
    },
  });

  await client.post('/auth/logout');
  return true;
}

export function getAuthenticatedSession() {
  const session = readSession();

  if (!session?.accessToken) {
    throw new Error('You are not authenticated. Please run "mernsecrets login" first.');
  }

  return session;
}

export function getAuthenticatedClient() {
  return createApiClient(getAuthenticatedSession());
}

export async function listProjects() {
  const client = getAuthenticatedClient();
  const organizationsResponse = await client.get('/organizations/mine');
  const organizations = organizationsResponse?.data?.data?.organizations ?? [];
  const projects = [];

  for (const organization of organizations) {
    const organizationId = organization?._id || organization?.id;

    if (!organizationId) {
      continue;
    }

    const response = await client.get('/projects', {
      params: { organizationId },
    });

    const organizationProjects = response?.data?.data?.projects ?? [];
    projects.push(...organizationProjects);
  }

  return projects;
}

export async function listEnvironmentsForProject(projectIdentifier) {
  const projects = await listProjects();
  const project = projects.find((candidate) => {
    const id = candidate?._id || candidate?.id;
    return [candidate?.name, candidate?.slug, id].includes(projectIdentifier);
  });

  if (!project) {
    throw new Error(`Project "${projectIdentifier}" was not found.`);
  }

  const client = getAuthenticatedClient();
  const response = await client.get('/environments', {
    params: { projectId: project._id || project.id },
  });

  return {
    project,
    environments: response?.data?.data?.environments ?? [],
  };
}

export async function listSecretsForEnvironment(environmentIdentifier) {
  const environment = await resolveEnvironment(environmentIdentifier);
  const client = getAuthenticatedClient();
  const response = await client.get('/secrets', {
    params: { environmentId: environment._id || environment.id },
  });

  return response?.data?.data?.secrets ?? [];
}

export async function resolveEnvironment(environmentIdentifier) {
  const projects = await listProjects();

  for (const project of projects) {
    const projectId = project?._id || project?.id;

    if (!projectId) {
      continue;
    }

    const response = await getAuthenticatedClient().get('/environments', {
      params: { projectId },
    });

    const environments = response?.data?.data?.environments ?? [];
    const environment = environments.find((candidate) => {
      const id = candidate?._id || candidate?.id;
      return [candidate?.name, candidate?.slug, id].includes(environmentIdentifier);
    });

    if (environment) {
      return environment;
    }
  }

  throw new Error(`Environment "${environmentIdentifier}" was not found.`);
}

export async function revealSecret(secretId) {
  const client = getAuthenticatedClient();
  const response = await client.post(`/secrets/${secretId}/reveal`);
  return response?.data?.data?.secret;
}
