import { useDispatch } from "react-redux";
import { getSubredditPosts } from "../../api/reddit";
import { getSubreddits } from "../../api/reddit";
import { startLoading, setRandomPost, setError} from "../../store/redditSlice";



export const fetchRandomPost = () => async (dispatch) => {
    try {
        dispatch(startLoading());
        const subreddits = await getSubreddits();
        const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
        const posts = await getSubredditPosts(`/r/${randomSubreddit.display_name}`);
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        dispatch(setRandomPost(randomPost));
    } catch (error) {
        dispatch(setError());
    }
};


