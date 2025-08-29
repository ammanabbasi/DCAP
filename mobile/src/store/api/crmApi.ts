import { baseApi } from './baseApi';

// Types for CRM entities
export interface CRMProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  leadSource?: string;
  leadStatus?: string;
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface Task {
  taskId: number;
  taskName: string;
  taskTitle: string;
  taskTypeId: number;
  categoryStatusID: number;
  customerID: number;
  dueDate: string;
  description: string;
  userID: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  noteId: number;
  description: string;
  userId: number;
  customerID: number;
  objectID?: number;
  objectTypeID?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  appointmentID: number;
  taskName: string;
  dueDate: string;
  description: string;
  categoryStatusID: number;
  location?: string;
  attendeeID?: number;
  interactionTypeID: number;
  customerID: number;
  userID: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleOfInterest {
  vehicleInterestId: number;
  customerId: number;
  modelYear: string;
  makeId: number;
  modelId: number;
  memo?: string;
  trimId?: number;
  exteriorColorId?: number;
  interiorColorId?: number;
  mileage?: number;
}

export interface TimelineItem {
  id: string;
  type: 'task' | 'note' | 'appointment' | 'email' | 'sms' | 'call';
  title: string;
  description: string;
  timestamp: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  metadata?: any;
}

// CRM API endpoints
export const crmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Profile endpoints
    getCrmProfile: builder.query<CRMProfile, number>({
      query: (id) => `crm/profiles/${id}`,
      providesTags: (result, error, id) => [{ type: 'CRM', id }],
    }),

    updateCrmProfile: builder.mutation<CRMProfile, { id: number; data: Partial<CRMProfile> }>({
      query: ({ id, data }) => ({
        url: `crm/profiles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'CRM', id }],
    }),

    // Tasks endpoints
    getCrmTasks: builder.query<Task[], number>({
      query: (customerId) => `crm/tasks?customerId=${customerId}`,
      providesTags: ['Task'],
    }),

    createTask: builder.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: 'crm/tasks',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: ['Task', 'Timeline'],
    }),

    updateTask: builder.mutation<Task, { id: number; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `crm/tasks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Task', 'Timeline'],
    }),

    deleteTask: builder.mutation<void, number>({
      query: (id) => ({
        url: `crm/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Timeline'],
    }),

    // Notes endpoints
    getCrmNotes: builder.query<Note[], number>({
      query: (customerId) => `crm/notes?customerId=${customerId}`,
      providesTags: ['Note'],
    }),

    createNote: builder.mutation<Note, Partial<Note>>({
      query: (note) => ({
        url: 'crm/notes',
        method: 'POST',
        body: note,
      }),
      invalidatesTags: ['Note', 'Timeline'],
    }),

    updateNote: builder.mutation<Note, { id: number; data: Partial<Note> }>({
      query: ({ id, data }) => ({
        url: `crm/notes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Note', 'Timeline'],
    }),

    deleteNote: builder.mutation<void, number>({
      query: (id) => ({
        url: `crm/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Note', 'Timeline'],
    }),

    // Appointments endpoints
    getCrmAppointments: builder.query<Appointment[], number>({
      query: (customerId) => `crm/appointments?customerId=${customerId}`,
      providesTags: ['Appointment'],
    }),

    createAppointment: builder.mutation<Appointment, Partial<Appointment>>({
      query: (appointment) => ({
        url: 'crm/appointments',
        method: 'POST',
        body: appointment,
      }),
      invalidatesTags: ['Appointment', 'Timeline'],
    }),

    updateAppointment: builder.mutation<Appointment, { id: number; data: Partial<Appointment> }>({
      query: ({ id, data }) => ({
        url: `crm/appointments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Appointment', 'Timeline'],
    }),

    deleteAppointment: builder.mutation<void, number>({
      query: (id) => ({
        url: `crm/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointment', 'Timeline'],
    }),

    // Timeline endpoint
    getCrmTimeline: builder.query<TimelineItem[], number>({
      query: (customerId) => `crm/timeline/${customerId}`,
      providesTags: ['Timeline'],
    }),

    // Vehicle of interest endpoints
    getVehiclesOfInterest: builder.query<VehicleOfInterest[], number>({
      query: (customerId) => `crm/vehicles-of-interest?customerId=${customerId}`,
      providesTags: ['Vehicle'],
    }),

    addVehicleOfInterest: builder.mutation<VehicleOfInterest, Partial<VehicleOfInterest>>({
      query: (vehicle) => ({
        url: 'crm/vehicles-of-interest',
        method: 'POST',
        body: vehicle,
      }),
      invalidatesTags: ['Vehicle'],
    }),

    deleteVehicleOfInterest: builder.mutation<void, number>({
      query: (id) => ({
        url: `crm/vehicles-of-interest/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicle'],
    }),

    // Documents endpoints
    getCrmDocuments: builder.query<any[], number>({
      query: (customerId) => `crm/documents?customerId=${customerId}`,
      providesTags: ['Document'],
    }),

    uploadDocument: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'crm/documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),

    deleteDocument: builder.mutation<void, number>({
      query: (id) => ({
        url: `crm/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),

    // Dropdown data
    getCrmDropdowns: builder.query<any, void>({
      query: () => 'crm/dropdowns',
      providesTags: ['CRM'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCrmProfileQuery,
  useUpdateCrmProfileMutation,
  useGetCrmTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetCrmNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetCrmAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useGetCrmTimelineQuery,
  useGetVehiclesOfInterestQuery,
  useAddVehicleOfInterestMutation,
  useDeleteVehicleOfInterestMutation,
  useGetCrmDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useGetCrmDropdownsQuery,
} = crmApi;