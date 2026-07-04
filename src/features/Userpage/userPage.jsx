
import { useParams } from "react-router-dom";
import PostList from "../Posts/PostList.jsx";
import { UserProfile } from "./UserProfile.jsx";

function getProfileState(search) {
    const params = new URLSearchParams(search);
    return {
      query: params.get("q"),
      sort: params.get("sort") || "relevance",
      t: params.get("t") || "all",
      subreddit: params.get("subreddit"),
      scoreMin: params.get("scoreMin") !== null ? Number(params.get("scoreMin")) : null,
      scoreMax: params.get("scoreMax") !== null ? Number(params.get("scoreMax")) : null,
      commentMin: params.get("commentMin") !== null ? Number(params.get("commentMin")) : null,
      commentMax: params.get("commentMax") !== null ? Number(params.get("commentMax")) : null,
    };
  }

export default function UserPage() {
  const {username} = useParams();

  return (
    <div>
      <ul className="user-page">
        <UserProfile username={username}/>
        <PostList mode="user" username={username}/>
      </ul>
    </div>
  );
}