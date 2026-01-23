import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event, EventRegistration } from '../../types';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  registrations: EventRegistration[];
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: string;
    status?: string;
    searchQuery?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  registrations: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.unshift(action.payload);
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
      if (state.currentEvent?.id === action.payload.id) {
        state.currentEvent = action.payload;
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
    setRegistrations: (state, action: PayloadAction<EventRegistration[]>) => {
      state.registrations = action.payload;
    },
    updateRegistration: (state, action: PayloadAction<EventRegistration>) => {
      const index = state.registrations.findIndex(
        (r) => r.id === action.payload.id
      );
      if (index !== -1) {
        state.registrations[index] = action.payload;
      }
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<EventsState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<EventsState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setEvents,
  setCurrentEvent,
  addEvent,
  updateEvent,
  deleteEvent,
  setRegistrations,
  updateRegistration,
  setFilters,
  clearFilters,
  setPagination,
  setLoading,
  setError,
} = eventsSlice.actions;

export default eventsSlice.reducer;
