import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Generic CRUD factory ──────────────────────────────────────────────────────
const makeCrud = (entity) => ({
  getAll:   (params) => client.get(`/${entity}`, { params }),
  getById:  (id)     => client.get(`/${entity}/${id}`),
  create:   (data)   => client.post(`/${entity}`, data),
  update:   (id, data) => client.put(`/${entity}/${id}`, data),
  remove:   (id)     => client.delete(`/${entity}/${id}`),
});

// ── Entity APIs ───────────────────────────────────────────────────────────────
export const activitiesAPI = {
  ...makeCrud('activities'),
  filter:     (params) => client.get('/activities/filter', { params }),
  getDetails: (id)     => client.get(`/activities/${id}/details`),
};

export const tasksAPI = {
  ...makeCrud('tasks'),
  updateProgress: (id, data) => client.put(`/tasks/${id}/progress`, data),
};

export const inputsAPI    = makeCrud('inputs');
export const outcomesAPI  = makeCrud('outcomes');
export const resourcesAPI = makeCrud('resources');
export const peopleAPI    = makeCrud('people');

export const eventsAPI = {
  ...makeCrud('events'),
  filter: (params) => client.get('/events/filter', { params }),
};

export const accountsAPI = {
  ...makeCrud('accounts'),
  filter: (params) => client.get('/accounts/filter', { params }),
};

export default client;
