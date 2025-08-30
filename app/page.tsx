import Header from "./ui/nav";
import Chat from "./ui/chat";
 
export default function Home() { 
  return (
    <main className="flex flex-col items-center">
      <Header />
      <Chat />
    </main>
  );
}