import { useTheme } from "next-themes";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export const ThemeSwitcher = () => {

    const [mounted, setMounted] = useState<boolean>(false);
    const { theme, setTheme } = useTheme();

    // Helps avoid hydration mismatch by only rendering after mounting
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0)
        return () => clearTimeout(timer);
    }, [])

    // This is like a playholder to avoid hydration issues
    if (!mounted) {
        return (
            <div />
        )
    }

    return (
        <button
            className="dark:bg-neutral-50 dark:text-neutral-800 bg-neutral-700 text-neutral-200"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <IconMoon size={18} /> : <IconSun size={18}/>}
        </button>
    )
}
