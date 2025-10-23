import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


interface AuthState {
    user: any | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;  
  }

// Thunk để lấy thông tin người dùng hiện tại từ token
export const fetchCurrentUser = createAsyncThunk <
any,              
void,             
{ rejectValue: string } 
>(
  'auth/fetchCurrentUser',
  async (_, thunkAPI) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await axios.get('/api/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return res.data.data;
    } catch (err:any) {
      console.error("Error fetching user", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);


// Khởi tạo state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', action.payload.accessToken); 
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
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
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload ?? 'Unknown error';
        localStorage.removeItem('accessToken');
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
