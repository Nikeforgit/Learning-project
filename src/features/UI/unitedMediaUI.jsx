import { useState, useEffect, useRef } from "react";
import "./MediaUI.css";

function useInView() {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                }
            },
            { threshold: 0.1, rootMargin: "200px" }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return [ref, inView];
}

function useGallery(items) {
    const safeItems = Array.isArray(items) ? items : [];
    const [index, setIndex] = useState(0);
    useEffect(() => {
        setIndex(0);
    }, [items]);
    const next = () => setIndex((prev) => Math.min(prev + 1, safeItems.length - 1));
    const prev = () => setIndex((prev) => Math.max(prev - 1, 0));
    return {
        index,
        current: safeItems[index] || null,
        isFirst: index === 0,
        isLast: index === safeItems.length - 1,
        next,
        prev,
        length: safeItems.length,
    };
}

export default function MediaUIRenderer({ media }) {
    const [loaded, setLoaded] = useState(false);
    const [ref, inView] = useInView();
    if (!media) return null;
    useEffect(() => {
        setLoaded(false);
    }, [media]);
    const items = media?.items || [];
    const { current, next, prev, isFirst, isLast, index, length } = useGallery(items);
    if (!inView) {
        return (
            <div ref={ref} className="media">
                <div className="skeleton" />
            </div>
        );
    }
    if (media.type === "image") {
        if (!media?.url?.startsWith("http")) return null;
        return (
            <div ref={ref} className="media">
                {!loaded && <div className="skeleton" />}
                <img
                    src={media.url}
                    key={media.url}
                    ref={(img) => {
                        if (img && img.complete) {
                            setLoaded(true);
                        }
                    }}
                    loading="lazy"
                    className={loaded ? "loaded" : ""}
                    onLoad={() => setLoaded(true)}
                    onError={() => setLoaded(true)}
                    alt="media"
                />
            </div>
        );
    }
    if (media.type === "video") {
        if (!media?.url?.startsWith("http")) return null;
        return (
            <div ref={ref} className="media">
                {!loaded && <div className="skeleton" />}
                <video
                    src={media.url}
                    key={media.url}
                    muted
                    autoPlay
                    playsInline
                    loop
                    preload="metadata"
                    className={loaded ? "loaded" : ""}
                    onLoadedData={() => setLoaded(true)}
                    onCanPlay={() => setLoaded(true)}
                    onError={() => setLoaded(true)}
                />
            </div>
        );
    }
    if (media.type === "gallery") {
        if (!current || !current.url?.startsWith("http")) return null;
        return (
            <div ref={ref} className="media gallery">
                {!loaded && <div className="skeleton"/>}
                {current.type === "image" && (
                    <img
                    src={current.url}
                    key={current.url}
                    ref={(img) => {
                        if (img && img.complete) {
                            setLoaded(true);
                        }
                    }}
                    className={loaded ? "loaded" : ""}
                    onLoad={() => setLoaded(true)}
                    onError={() => setLoaded(true)}
                    alt="gallery-item"
                     />
                )}
                {current.type === "video" && (
                <video
                    src={current.url}
                    key={current.url}
                    muted
                    autoPlay
                    playsInline
                    loop
                    preload="metadata"
                    className={loaded ? "loaded" : ""}
                    controls
                    onLoadedData={() => setLoaded(true)}
                    onCanPlay={() => setLoaded(true)}
                    onError={() => setLoaded(true)}
                />
                )}
                {items.length > 1 && (
                    <>
                        <button className="gallery-btn prev" disabled={isFirst} onClick={(e) => {e.stopPropagation(); prev();}}>◀</button>
                        <button className="gallery-btn next" disabled={isLast} onClick={(e) => {e.stopPropagation(); next();}}>▶</button>
                    </>
                )}
                <div className="gallery-counter">
                    {index + 1} / {items.length}
                </div>
            </div>
        );
    }
    return null;
}