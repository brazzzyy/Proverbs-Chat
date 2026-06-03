import Chat from "./ui/chat";
import Splash from "./ui/splash";
import SidebarLayout from "./ui/sidebar-layout";

export default function Home() {
  return (
    <SidebarLayout>
      <Splash />
      <main className="flex min-h-screen w-full flex-col items-center">
        <Chat />
      </main>
    </SidebarLayout>
  );
}
