import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchSideBar = createAsyncThunk(
    "sidebar/fetch",
    async (subreddit) => {
         console.log("Fetching sidebar:", subreddit);
        const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await fetch(
            `${API_ROOT}/api/r/${subreddit}/sidebar`
        );
         console.log("Sidebar status:", res.status);
        return await res.json();
    }
);

export const sidebarSlice = createSlice({
    name: "sidebar",
    initialState: {
        sections: [],
        loading: false,
        error: null,
        currentSection: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchSideBar.pending, (state, action) => {
            state.loading = true;
            state.error = null;
            state.currentSection = action.meta.arg;
        })
        .addCase(fetchSideBar.fulfilled, (state, action) => {
            state.loading = false;
            const payload = action.payload ?? {};
            if (Array.isArray(payload)) {
                state.sections = payload;
                state.meta = null;
            } else {
                state.sections = Array.isArray(payload.sections) ? payload.sections : [];
                state.meta = payload.meta ?? null;
            }
        })
        .addCase(fetchSideBar.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    },
});


export default sidebarSlice.reducer;