import Image from "next/image";
import Logout from "../ui/logout";

export default function NavHeader() {
    return (
        <div className="flex items-center h-14 bg-navgray w-full z-5 sticky top-0">
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                <Image 
                    src={"/praying-svgrepo-com.svg"}
                    width={35}
                    height={70}
                    alt="Logo"
                />
                <span className="text-2xl font-extralight">
                    Proverbs Chat
                </span>
            </div>
            <div className="ml-auto pr-4">
                <Logout />
            </div>
        </div>
    );
}