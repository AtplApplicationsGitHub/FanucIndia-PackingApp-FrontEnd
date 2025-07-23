"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth";
import { toast } from "sonner";
import { useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  /** Additional Tailwind or custom classes */
  className?: string;
  /** ShadCN button variant (e.g. 'link', 'ghost', 'redOutline', etc.) */
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export default function LogoutButton({
  className,
  variant = "redOutline",
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      toast.success("You have been logged out.");
      router.replace("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant={variant}
      className={clsx(
        "rounded-none px-6 py-2 mr-10",
        className
      )}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {loading ? "LOGGING OUT..." : "LOGOUT"}
    </Button>
  );
}