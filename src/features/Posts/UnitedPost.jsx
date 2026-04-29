import { replace } from "react-router-dom";
import MediaUIRenderer from "../UI/unitedMediaUI";

function getPostMedia(post) {
    if (post.is_gallery && post.gallery_data && post.media_metadata) {
        const items = unitedGallery(post.gallery_data, post.media_metadata);
      if (items.length > 0) {
        return { type: "gallery", items };
    }
    }
    if (post.is_video && post.media?.reddit_video?.fallback_url) {
        return {
            type: "video",
            url: post.media.reddit_video.fallback_url
        };
    }
    const gif = post.preview?.images?.[0]?.variants?.mp4?.source?.url;
    if (gif) {
        return {
            type: "video",
            url: cleanUrl(gif)
        };
    }
    const image = 
      post.preview?.images?.[0]?.source?.url ||
      post.thumbnail;
    if (image && image.startsWith("http")) {
        return {
            type: "image",
            url: cleanUrl(image)
        };
    }
    return null;
}

function getCommentMedia(comment) {
    if (comment.body && comment.body.trim().length > 0) {
        const parsed = parseMediaFromText(comment.body);
        if (parsed && parsed.length > 0) {
        return parsed.length > 1 
        ? { type: "gallery", items: parsed }
        : parsed[0]; 
    }
    }
    if (comment.is_gallery && comment.gallery_data && comment.media_metadata) {
        const items = unitedGallery(comment.gallery_data, comment.media_metadata);
      if (items.length > 0) {
        return { type: "gallery", items };
    }
    }
    if (comment.is_video && comment.media?.reddit_video?.fallback_url) {
        return {
            type: "video",
            url: comment.media.reddit_video.fallback_url
        };
    }
    const gif = comment.preview?.images?.[0]?.variants?.mp4?.source?.url;
    if (gif) {
        return {
            type: "video",
            url: cleanUrl(gif)
        };
    }
    const image = 
      comment.preview?.images?.[0]?.source?.url ||
      comment.thumbnail;
    if (image && image.startsWith("http")) {
        return {
            type: "image",
            url: cleanUrl(image)
        };
    }
    return null;
}

function cleanUrl(url) {
    if (!url) return url;
    let cleaned = url;
    let previousLength = 0;
    while (previousLength !== cleaned.length) {
      previousLength = cleaned.length;
      cleaned = cleaned.replaceAll("&amp;", "&")
      .replaceAll("&quot;", '"')
      .replaceAll("&#x27;", "'")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">");
    }
    cleaned = cleaned.replace(/[)\],;.]+$/, "").trim();
    return cleaned;
}

function unitedGallery(gallery_data, media_metadata) {
  return gallery_data.items
  .map(item => {
    const meta = media_metadata[item.media_id];
    if (!meta) return null;
    const mp4 = meta.variants?.mp4?.source?.url;
    const image = meta.s?.u;
    if (mp4) {
        return { type: "video", url: cleanUrl(mp4) };
    }
    if (image) {
        return { type: "image", url: cleanUrl(image) };
    }
    return null;
  })
  .filter(Boolean);
}

function parseMediaFromText(text) {
    if (!text) return [];
    const urls = text?.match(/https?:\/\/[^\s]+/g);
    if (!urls) return [];
    return urls
      .map(url => {
        try {
        return detectMedia(url);} catch {
            return null;
        }})
      .filter(Boolean);
}

function detectMedia(url) {
    if (!url) return null;
    const cleaned = cleanUrl(url);
    const clean = url.split("?")[0];
    if (cleaned.includes("preview.redd.it")) {
      return { type: "image", url: cleaned };
    }
    if (cleaned.includes("i.redd.it")) {
        return { type: "image", url: cleaned };
    }
    if (cleaned.includes("i.imgur.com")) {
        return { type: "image", url: cleaned };
    }
    if (cleaned.includes("imgur.com")) {
      const id = clean.split("/").pop();
        return { type: "image", url: `https://i.imgur.com/${id}.jpg`};
    }
    if (clean.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i)) {
        return { type: "image", url: cleaned };
    }
    if (clean.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
        return { type: "video", url: cleaned };
    }
    if (cleaned.includes("gfycat") || cleaned.includes("redgifs") ||
        cleaned.includes("youtube.com") || cleaned.includes("youtu.be") ||
        cleaned.includes("vimeo.com")) { return null };
    return null;
}

export function renderTextWithLinks(text = "") {
  const parts = text.split(/(https?:\/\/[^\s]+|!\[gif\]\(giphy\|?.+?\))/g);
  let mediaCount = 0;
  const MAX_MEDIA = 4;
  return parts.map((part, i) => {
    if (typeof part !== "string" || !part) return null;
    const giphyMatch = part.match(/!\[gif\]\(giphy\|?(.+)\)/);
    if (giphyMatch) {
      const id = giphyMatch[1].split("|")[0];
      return (
        <span key={i} style={{ display: "block" }}>
          <img
            src={`https://media.giphy.com/media/${id}/giphy.gif`}
            alt="giphy"
          />
        </span>
      );
    }
    if (part.startsWith("http")) {
      const cleaned = cleanUrl(part);
      const media = detectMedia(cleaned);
      if (media && media.url && mediaCount < MAX_MEDIA) {
        mediaCount++;
        if (media.type === "image") {
          return (
            <span key={i} style={{ display: "block" }}>
              <img src={media.url} alt="embedded" loading="lazy"/>
            </span>
          );
        }
        if (media.type === "video") {
          return (
            <span key={i} style={{ display: "block" }}>
              <video src={media.url} controls muted autoPlay playsInline />
            </span>
          );
        }
      }
      return (
        <a key={i} href={cleaned} target="_blank" rel="noreferrer">
          {cleaned}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function getMedia(entity, type) {
    if (type === "post") {
        return getPostMedia(entity);
    }

    if (type === "comment") {
        return getCommentMedia(entity);
    }
    return null;
}