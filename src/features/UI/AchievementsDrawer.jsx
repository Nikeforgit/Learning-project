import { useSelector } from "react-redux";
import { DrawerProvider } from "./DrawerContext";

export default function AchievementsDrawer() {
    const profile = useSelector(
        state => state.user.profile
    );

    return (
    <div>
        <h2>Achievements</h2>
        {profile?.achievements?.map(achievement => (
            <div key={achievements.id}>
                {achievement.name}
            </div>
        ))}
    </div>
    );
}