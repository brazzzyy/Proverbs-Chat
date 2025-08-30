import SignUp from "../ui/signup";
import NavHeader from "../ui/nav";

export default function SignUpAccount() {

    return(
        <>
            <NavHeader />
            <div className="flex justify-center items-center">
                <SignUp />
            </div>
        </>
    )
}