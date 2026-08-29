import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  kycStatus?: string;
  idDocumentType?: string;
  idDocumentLabel?: string;
  idDocumentCountry?: string;
  idDocumentUrl?: string;
  idDocumentSource?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk('auth/login', async (data: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const res = await authApi.login(data);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data: any, { rejectWithValue }) => {
  try {
    const res = await authApi.register(data);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Registration failed');
  }
});

export const hydrate = createAsyncThunk('auth/hydrate', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.me();
    return res.data;
  } catch (e: any) {
    return rejectWithValue('Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
  },
  extraReducers: (builder) => {
    const fulfilled = (state: AuthState, action: any) => {
      state.status = 'idle';
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (action.payload.token) localStorage.setItem('token', action.payload.token);
    };
    builder
      .addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload as string; })
      .addCase(register.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload as string; })
      .addCase(hydrate.fulfilled, (s, a) => { s.user = a.payload.user; })
      .addCase(hydrate.rejected, (s) => { s.user = null; s.token = null; localStorage.removeItem('token'); });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
