import {configureStore} from "@reduxjs/toolkit";
import redditReducer from "./redditSlice.js";
import subRedditsSlice from "./subRedditsSlice.js"
import commentsReducer from "../features/Comments/commentsSlice.js";


const store = configureStore({
  reducer: {
    reddit: redditReducer,
    subReddits: subRedditsSlice,
    comments: commentsReducer,
  }
});
export default store;