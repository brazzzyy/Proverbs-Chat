import Link from "next/link";
import { login } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Login() {


    return (
        <form action={ async (formData: FormData) => {
                "use server";
                const user = {
                    email: formData.get("email") as string,
                    password: formData.get("password") as string,
                };
                    await login(user);
                redirect("/");
            }} className="mt-35 w-100 h-95 border-bordercolor border-2 rounded-md flex flex-col justify-center items-center gap-5 bg-textboxcolor">
            <h1 className="font-medium text-2xl mt-[-50]">Login to Proverbs Chat</h1>
            <input type="email" name="email" className="bg-signupboxcolor mt-2 w-85 p-2 font-extralight rounded-lg outline-0" placeholder="Email" required/>
            <input type="password" name="password" className="bg-signupboxcolor w-85 p-2 font-extralight rounded-lg outline-0" placeholder="Password" required/>
            <button type="submit" className="mt-[-10] w-85 h-8 border-white border-1 rounded-lg cursor-pointer">Login</button>
            <hr className="border-gray-500 font-bold w-80 mt-2"></hr>
            <p className="font-light flex justify-center gap-2">{`Don't have an account?`}
                <Link href="/signup" className="underline">Sign Up</Link>
            </p>
        </form>
    )
}