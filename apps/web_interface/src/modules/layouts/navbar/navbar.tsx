import { CommandNotch } from "./command_notch/command_notch";

export default function Navbar() {
    return (
        <nav className="w-full h-fit fixed top-0 p-2.5 flex items-center justify-between">
            <div />
            <CommandNotch />
            <div />
        </nav>
    );
}
