import Login from "../ui/login";
import NavHeader from "../ui/nav";

export default function LoginPage(){

    return (
        <>
            <NavHeader />
            <div className="flex justify-center items-center">
                <Login />
            </div>
        </>
    )

}