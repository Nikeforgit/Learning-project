import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("redditHistory"); 
const initialState = {posts: saved ? JSON.parse(saved) : []};

export const historySlice = createSlice({
    name: "history", 
    initialState,
    reducers: {
        addToHistory(state, action) {
            const post = action.payload;
            state.posts = [
                post,
                ...state.posts.filter(item => item.id !== post.id)
            ].slice(0, 20);
            localStorage.setItem(
                "redditHistory",
                JSON.stringify(state.posts)
            );
        },
    },
});

export const { addToHistory } = historySlice.actions;
export default historySlice.reducer;