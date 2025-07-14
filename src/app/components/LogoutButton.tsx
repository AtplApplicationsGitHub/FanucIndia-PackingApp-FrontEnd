"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token"); 
    localStorage.removeItem("token"); 
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-red-500 underline hover:text-red-700 transition"
    >
      Logout
    </button>
  );
}
