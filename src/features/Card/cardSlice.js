import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  card: []
};


export const cardSlice = createSlice({
  name: "card",
  initialState: initialState,
  reducers: {
    postCard: (state, action) => {
      state.card.push({
        id: action.payload.id,
        title: action.payload.title,
        author: action.payload.author,
        tag: action.payload.tag,
        selftext: action.payload.selftext,
        url: action.payload.url,
        thumbnail: action.payload.thumbnail,
        num_comments: action.payload.num_comments,
        score: action.payload.score,
        date: action.payload.date,
      });
    }
  }
});

export const selectCard = (state) => state.card.card;
export const selectCardById = (id) => (state) => state.card.card.find(card => card.id === id);
export const { postCard } = cardSlice.actions;
export default cardSlice.reducer;

