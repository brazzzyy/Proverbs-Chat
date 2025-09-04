"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      setIsLoggedIn(data.isLoggedIn);
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      // Call the new logout API route
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        setIsLoggedIn(false); // update state immediately
        router.push("/login"); // redirect after logout
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (!isLoggedIn) return null; // hide button if not logged in

  return (
    <button
      onClick={handleLogout}
      className="cursor-pointer px-2 w-20 h-10 text-white rounded"
    >
      Logout
    </button>
  );
}
