import { ThemeProvider } from "next-themes";

export default function ThemesProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider attribute={"class"} defaultTheme="light" enableSystem>
            <main className="w-full min-h-screen">{children}</main>
        </ThemeProvider>
    );
}
