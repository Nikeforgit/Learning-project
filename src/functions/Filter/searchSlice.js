import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchSearchResult = createAsyncThunk(
    "search/fetchSearchResult",
    async (query) => {
        const res = await fetch(`https://www.reddit.com/search.json?q=${query}`);
        const json = await res.json();
        return json.data.children.map(c => c.data);
    }
);

const searchSlice = createSlice({
    name: "search",
    initialState: {
        apiPosts: [],
        finalPosts: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearSearch: (state) => {
            state.apiPosts = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchSearchResult.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchSearchResult.fulfilled, (state, action) => {
            state.loading = false;
            state.apiPosts = action.payload;
        })
        .addCase(fetchSearchResult.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;