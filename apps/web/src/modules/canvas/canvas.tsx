import type { ReactNode } from "react";

const Canvas = ({ children }: { children: ReactNode }) => {
    return (
        <div className="w-full h-screen overflow-auto flex items-center justify-center">
            {children}
        </div>
    );
};

export default Canvas;
