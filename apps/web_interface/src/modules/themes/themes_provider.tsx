import { ThemeProvider } from "next-themes";
import Navbar from "../navbar/navbar";


export default function ThemesProvider({children}: {children: React.ReactNode}) {
    return (
        <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem>
            <main className="w-full border min-h-screen">
                <Navbar />
                {children}
            </main>
       </ThemeProvider>
   )
}
