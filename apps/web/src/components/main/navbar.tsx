import { IconLineDotted, IconMicrophone, IconPlayerStop } from "@tabler/icons-react";

const Navbar = () => {
    return (
        <nav className="w-full absolute top-0 left-0 right-0 p-4 h-fit flex items-center justify-between">
            <div />
            <SessionControls />
            <Profile />
        </nav>
    )
}

export default Navbar;

// =================================== SUB-COMPONENTS ======================================= //

const SessionControls = () => {
    return (
        <div className="w-64 h-12 bg-neutral-800 text-neutral-100 rounded-2xl px-1.5 flex items-center justify-between py-1.5">
            <span className="h-full w-fit gap-x-2.5 pl-2 flex items-center justify-center">
                <IconMicrophone size={20} />
                <span className="text-neutral-700">|</span>
                <IconLineDotted size={32} />
            </span>
            <span className="tracking-tight mono text-[0.895rem]">08:04</span>
            <span className="h-full w-12 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
                <IconPlayerStop size={18} />
            </span>
        </div>
    )
}


const Profile = () => {
    return (
        <div className="w-10 h-10 bg-neutral-100 rounded-full"></div>
    )
}
