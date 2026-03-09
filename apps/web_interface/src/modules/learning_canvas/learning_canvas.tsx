import type { ReactNode } from "react";

type LEARNING_CANVAS_TYPES = {
    children: ReactNode;
};

const LearningCanvas = ({ children }: LEARNING_CANVAS_TYPES) => {
    return <div className="learning_canvas">{children}</div>;
};

export default LearningCanvas;
