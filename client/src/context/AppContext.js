import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  activitiesAPI, tasksAPI, inputsAPI, outcomesAPI,
  resourcesAPI, peopleAPI, eventsAPI, accountsAPI,
} from '../api/api';

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  activities: [],
  tasks:      [],
  inputs:     [],
  outcomes:   [],
  resources:  [],
  people:     [],
  events:     [],
  accounts:   [],
  loading:    false,
  error:      null,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_ENTITY':
      return { ...state, loading: false, [action.entity]: action.payload };
    case 'ADD_ITEM':
      return { ...state, [action.entity]: [...state[action.entity], action.payload] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        [action.entity]: state[action.entity].map((item) =>
          item._id === action.payload._id ? action.payload : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        [action.entity]: state[action.entity].filter((item) => item._id !== action.payload),
      };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Generic fetch helper
  const fetchEntity = useCallback(async (entity, apiFn, params) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await apiFn(params);
      dispatch({ type: 'SET_ENTITY', entity, payload: res.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
    }
  }, []);

  // Generic CRUD helpers
  const addItem = useCallback(async (entity, apiFn, data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await apiFn(data);
      dispatch({ type: 'ADD_ITEM', entity, payload: res.data });
      dispatch({ type: 'SET_LOADING', payload: false });
      return res.data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
      throw err;
    }
  }, []);

  const editItem = useCallback(async (entity, apiFn, id, data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await apiFn(id, data);
      dispatch({ type: 'UPDATE_ITEM', entity, payload: res.data });
      dispatch({ type: 'SET_LOADING', payload: false });
      return res.data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (entity, apiFn, id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiFn(id);
      dispatch({ type: 'REMOVE_ITEM', entity, payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
      throw err;
    }
  }, []);

  // ── Entity-specific actions ────────────────────────────────────────────────
  const actions = {
    fetchActivities: (p) => fetchEntity('activities', activitiesAPI.getAll, p),
    createActivity:  (d) => addItem('activities', activitiesAPI.create, d),
    updateActivity:  (id, d) => editItem('activities', activitiesAPI.update, id, d),
    deleteActivity:  (id) => deleteItem('activities', activitiesAPI.remove, id),

    fetchTasks: (p) => fetchEntity('tasks', tasksAPI.getAll, p),
    createTask: (d) => addItem('tasks', tasksAPI.create, d),
    updateTask: (id, d) => editItem('tasks', tasksAPI.update, id, d),
    deleteTask: (id) => deleteItem('tasks', tasksAPI.remove, id),

    fetchInputs: (p) => fetchEntity('inputs', inputsAPI.getAll, p),
    createInput: (d) => addItem('inputs', inputsAPI.create, d),
    updateInput: (id, d) => editItem('inputs', inputsAPI.update, id, d),
    deleteInput: (id) => deleteItem('inputs', inputsAPI.remove, id),

    fetchOutcomes: (p) => fetchEntity('outcomes', outcomesAPI.getAll, p),
    createOutcome: (d) => addItem('outcomes', outcomesAPI.create, d),
    updateOutcome: (id, d) => editItem('outcomes', outcomesAPI.update, id, d),
    deleteOutcome: (id) => deleteItem('outcomes', outcomesAPI.remove, id),

    fetchResources: (p) => fetchEntity('resources', resourcesAPI.getAll, p),
    createResource: (d) => addItem('resources', resourcesAPI.create, d),
    updateResource: (id, d) => editItem('resources', resourcesAPI.update, id, d),
    deleteResource: (id) => deleteItem('resources', resourcesAPI.remove, id),

    fetchPeople: (p) => fetchEntity('people', peopleAPI.getAll, p),
    createPerson: (d) => addItem('people', peopleAPI.create, d),
    updatePerson: (id, d) => editItem('people', peopleAPI.update, id, d),
    deletePerson: (id) => deleteItem('people', peopleAPI.remove, id),

    fetchEvents: (p) => fetchEntity('events', eventsAPI.getAll, p),
    createEvent: (d) => addItem('events', eventsAPI.create, d),
    updateEvent: (id, d) => editItem('events', eventsAPI.update, id, d),
    deleteEvent: (id) => deleteItem('events', eventsAPI.remove, id),

    fetchAccounts: (p) => fetchEntity('accounts', accountsAPI.getAll, p),
    createAccount: (d) => addItem('accounts', accountsAPI.create, d),
    updateAccount: (id, d) => editItem('accounts', accountsAPI.update, id, d),
    deleteAccount: (id) => deleteItem('accounts', accountsAPI.remove, id),

    clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),
  };

  return (
    <AppContext.Provider value={{ state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
