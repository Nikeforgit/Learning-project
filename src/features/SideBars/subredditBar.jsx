import { useEffect } from "react";
import { fetchSideBar } from "./sidebarSlice";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

function Section({section}) {
    const items = Array.isArray(section?.sections)
          ? section.sections : Array.isArray(section?.items)
          ? section.items : [];
    const safeClass = `section ${section?.id ?? ""}`.trim();
    return (
        <div className={safeClass}>
           <h2>{section?.title ?? ""}</h2>
           {items.length === 0 ? (
            <div className="empty">No items</div>
           ) : (
            items.map((item, idx) => (
                <a key={item?.href ?? item?.id ?? `${section?.title ?? "s"}-${idx}`}
                href={item?.href ?? "#"} target="_blank" rel="noreferrer">
                    {item?.title ?? item?.text ?? item?.href}
                </a>
            ))
           )}
        </div>
    )
}

export default function SubredditBar() {
    const rawSections = useSelector(state => state.sidebar.sections)
    const dispatch = useDispatch();
    const {subreddit} = useParams(); 
    useEffect(() => {
        if (subreddit) {
            dispatch(fetchSideBar(subreddit));
        }
    }, [dispatch, subreddit]);
    const sections = Array.isArray(rawSections)
    ? rawSections : rawSections && typeof rawSections === "object"
    ? Object.values(rawSections) : [];
    return (
    <>
     {Object.values(sections).map(([id, section]) => (
        <Section key={id} section={section}/>
    ))}
    </>
);
}