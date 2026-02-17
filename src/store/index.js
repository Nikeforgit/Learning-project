import {configureStore} from "@reduxjs/toolkit";
import redditReducer from "./redditSlice.js";
import subRedditsSlice from "./subRedditsSlice.js"
import commentsReducer from "../features/Comments/commentsSlice.js";
import searchReducer from "../functions/Filter/searchSlice.js";


const store = configureStore({
  reducer: {
    reddit: redditReducer,
    subReddits: subRedditsSlice,
    comments: commentsReducer,
    search: searchReducer,
  }
});
export default store;