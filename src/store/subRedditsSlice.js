import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSubreddits } from "../api/reddit";

const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const fetchSubreddits = createAsyncThunk(
    "subReddits/fetchSubreddits",
    async (query) => {
        return await getSubreddits(query);
    }
);

export const searchSubreddits = createAsyncThunk(
    "subreddits/search",
    async (query) => {
        try {
            const response = await fetch(
                `${API_ROOT}/api/subreddits?q=${encodeURIComponent(query)}&limit=5`);
            if (!response.ok) { throw Error(`API error: ${response.status}`);}
            const json = await response.json();
            return Array.isArray(json) ? json : [];
        } catch (error) {
            console.error("searchSubreddits error:", error);
            throw error;
        }
    }
);

export const subRedditsSlice = createSlice({
    name: "subReddits",
    initialState: {
    subReddits: [],
    loading: false,
    error: false,
    selectedSubReddit: "",
},
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchSubreddits.pending, (state) => {
            state.loading = true;
            state.error = false;
        })
        .addCase(fetchSubreddits.fulfilled, (state, action) => {
            state.loading = false;
            state.subReddits = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(fetchSubreddits.rejected, (state) => {
            state.loading = false;
            state.error = true;
        });
    },
});

export default subRedditsSlice.reducer;