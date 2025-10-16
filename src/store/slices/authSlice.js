import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '@/lib/user/userApi';

// Thunk to get the current user's information from the token
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      // Use the centralized userApi to fetch the user profile
      const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const user = isAdmin ? await userApi.getAdminMe() : await userApi.getMe();
      return user;
    } catch (err) {
      console.error("🔥 Error fetching user", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


// Initialize state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setInitialState(state, action) {
      state.accessToken = action.payload.accessToken || null;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = !!action.payload.accessToken;
      state.isLoading = false;
    },
    login(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout(state) {
      Object.assign(state, initialState, { isLoading: false });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    finishInitialLoad(state) {
      state.isLoading = false;
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        Object.assign(state, initialState, { isLoading: false, error: action.payload });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
  },
});


export const { setInitialState, login, logout, updateUser, finishInitialLoad } = authSlice.actions;
export default authSlice.reducer;