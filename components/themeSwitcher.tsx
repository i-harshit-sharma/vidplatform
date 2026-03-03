"use client";

import setThemeAction from "@/actions/setTheme";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";

export default function ThemeSwitcher() {
    const { user, setUser } = useAuth();
    const router = useRouter();

    async function handleThemeChange(newTheme: "light" | "dark" | "system") {
        const root = document.documentElement;
        root.classList.remove("light", "dark");

        let themeToApply = newTheme;
        if (newTheme === "system") {
            themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        root.classList.add(themeToApply);

        if (user) {
            setUser({ ...user, settings: { ...user.settings, theme: newTheme } });
        }

        try {
            await setThemeAction(newTheme);
            router.refresh();
        } catch (error) {
            console.error("Error setting theme:", error);
        }
    }

    return (
        <select
            onChange={(e) => handleThemeChange(e.target.value as "light" | "dark" | "system")}
            value={user?.settings?.theme || "light"}
            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-black dark:text-white"
        >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
        </select>
    );
}
