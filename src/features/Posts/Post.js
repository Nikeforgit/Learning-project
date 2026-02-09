
export function Post({ post }) {
    return (
        <article className="post">
            <header className="post-header">
                <strong>r/{post.subreddit}</strong>
                <span>u/{post.author}</span>
            </header>

          <h3>{post.title}</h3>
          {post.selftext && <p>{post.selftext}</p>}

          {post.thumbnail &&
           post.thumbnail !== "self" &&
           post.thumbnail !== "default" && (
            <img src={post.thumbnail} alt={post.title} className="post-image"/>
          )}
          <div className="post-footer">
            <span>{post.ups}</span>
            <span>{post.num_comments}</span>
          </div>
        </article>
    );
};