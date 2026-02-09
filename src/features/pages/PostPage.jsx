import { useParams } from "react-router-dom";
import CommentList from "../Comments/CommentList";
import { useSelector } from "react-redux";
import Card from "../Card/Card";


export default function PostPage() {
    const { postId } = useParams();
    const post = useSelector(state => state.reddit.posts.find(p => p.id === postId));
if (!post) {
    return <p>Loading...</p>;
}
    return(
        <main>
            <Card post={post}/>
            <CommentList permalink={post.permalink}/>
        </main>
    ) 
}