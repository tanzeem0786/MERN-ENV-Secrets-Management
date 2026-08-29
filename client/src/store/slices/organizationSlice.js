import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { organizationApi } from "../../api/organization.api";

export const fetchOrganizations = createAsyncThunk(
  "organizations/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return (await organizationApi.list()).data.data.organizations;
    } catch {
      return rejectWithValue("Unable to load organizations");
    }
  },
);

const organizationSlice = createSlice({
  name: "organizations",
  initialState: { items: [], activeId: null, status: "idle", error: null },
  reducers: {
    setActiveOrganization: (state, action) => {
      state.activeId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.items = action.payload;
        state.activeId =
          action.payload.find((item) => item._id === state.activeId)?._id ||
          action.payload[0]?._id ||
          null;
        state.status = "succeeded";
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setActiveOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;
