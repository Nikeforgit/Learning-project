import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchSideBar = createAsyncThunk(
    "sidebar/fetchSubreddit",
    async (subreddit) => {
         console.log("Fetching sidebar:", subreddit);
        const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await fetch(
            `${API_ROOT}/api/r/${subreddit}/about`
        );
        if (!res.ok) {throw new Error(`HTTP ${res.status}`);}
        return await res.json();
    }
);

export const fetchUserBar = createAsyncThunk(
    "sidebar/fetchUser",
    async (username) => {
         console.log("Fetching sidebar:", username);
        const API_ROOT = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await fetch(
            `${API_ROOT}/api/user/${username}/about`
        );
        if (!res.ok) {throw new Error(`HTTP ${res.status}`);}
        return await res.json();
    }
);

export const sidebarSlice = createSlice({
    name: "sidebar",
    initialState: {
        sidebar: null,
        loading: false,
        error: null,
        currentKey: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchSideBar.pending, (state, action) => {
            state.loading = true;
            state.error = null;
            state.currentKey = `subreddit:${action.meta.arg}`;
        })
        .addCase(fetchSideBar.fulfilled, (state, action) => {
            state.loading = false;
            state.sidebar = action.payload;
        })
        .addCase(fetchSideBar.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        .addCase(fetchUserBar.pending, (state, action) => {
            state.loading = true;
            state.error = null;
            state.currentKey = `user:${action.meta.arg}`;
        })
        .addCase(fetchUserBar.fulfilled, (state, action) => {
            state.loading = false;
            state.sidebar = action.payload;
        })
        .addCase(fetchUserBar.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    },
});


export default sidebarSlice.reducer;