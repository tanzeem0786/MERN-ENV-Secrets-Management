import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api";

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.me();
      return response.data.data.user;
    } catch {
      return rejectWithValue(null);
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to sign in",
      );
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      return response.data.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to create account",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, status: "idle", error: null },
  reducers: {
    signedOut: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.status = "anonymous";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "anonymous";
        state.error = action.payload;
      })
      .addCase(register.fulfilled, (state) => {
        state.user = null;
        state.status = "anonymous";
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "anonymous";
        state.error = action.payload;
      });
  },
});

export const { signedOut } = authSlice.actions;
export default authSlice.reducer;
