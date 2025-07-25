import Image from "next/image";

export default function NavHeader() {
    return (
        <div className="flex gap-4 h-14 justify-center items-center bg-navgray w-full z-5 sticky top-0">
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
    );
}