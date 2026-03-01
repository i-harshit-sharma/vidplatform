"use client";
import logoutUser from "@/actions/logout";
import globalLogout from "@/actions/globalLogout";
import Header from "@/components/large/header";
import setThemeAction from "@/actions/setTheme"; // Renamed import to avoid naming conflicts
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation"; // Import the router
import { UserType } from "@/types/user";

export default function Home() {
    const { user, setUser } = useAuth();
    const router = useRouter();

    async function handleThemeChange(newTheme: "light" | "dark" | "system") {
        // 1. Update the DOM directly for instant visual feedback (Optimistic UI)
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        
        let themeToApply = newTheme;
        if (newTheme === "system") {
            // Check the user's OS preference if "system" is selected
            themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        root.classList.add(themeToApply);

        // 2. Update local React context state
        if (user) {
            setUser({ ...user, settings: { ...user.settings, theme: newTheme } });
        }

        try {
            // 3. Persist the change to your database via Server Action
            await setThemeAction(newTheme);
            
            // 4. Tell Next.js to re-fetch Server Components (like your layout) 
            // so they have the latest data for future navigations.
            router.refresh(); 
        } catch (error) {
            console.error("Error setting theme:", error);
            // Optional: Revert DOM and state here if the DB update fails
        }
    }

    return (
        <>
            {/* <button onClick={() => logoutUser()}>Logout</button> */}
            {/* <button onClick={() => globalLogout()}>Global Logout</button> */}
            <div>
                {/* Use the new handler, and switch defaultValue to value for a controlled component */}
                <select 
                    onChange={(e) => handleThemeChange(e.target.value as "light" | "dark" | "system")} 
                    value={user?.settings?.theme || "light"}
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                </select>
                <h1>Welcome</h1>
            </div>

        </>
    );
}