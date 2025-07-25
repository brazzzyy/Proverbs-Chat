import Chat from "./ui/chat";
import NavHeader from "./ui/nav";
 
export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <NavHeader />
      <Chat />
    </main>
  );
}
