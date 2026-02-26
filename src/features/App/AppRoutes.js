import { Routes , Route } from "react-router-dom";
import FeedPage from "../pages/FeedPage";
import SubredditPage from "../pages/SubredditPage";
import PostPage from "../pages/PostPage";


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<FeedPage />} />
            <Route path="/r/:subreddit" element={<SubredditPage />}/>
            <Route 
            path="/r/:subreddit/comments/:postId"
            element={<PostPage />}/>
            <Route path="/r/:subreddit/comments/:postId" element={<PostPage />} />
        </Routes>
    );
}