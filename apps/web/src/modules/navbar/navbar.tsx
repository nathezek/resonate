import SessionControls from "./components/SessionBarCMD";

const Navbar = () => {
    return (
        <nav className="w-full absolute top-0 left-0 right-0 p-4 h-fit flex items-center justify-between">
            <div />
            <SessionControls />
            <Profile />
        </nav>
    );
};

export default Navbar;

// =================================== SUB-COMPONENTS ======================================= //

const Profile = () => {
    return <div className="w-10 h-10 bg-neutral-100 rounded-full"></div>;
};
