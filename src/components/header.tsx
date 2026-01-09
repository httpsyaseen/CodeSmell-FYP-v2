"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiUser } from "react-icons/hi2";
import {
  LogOutIcon,
  Settings,
  ChevronDown,
  Stethoscope,
  PanelLeft,
} from "lucide-react";
import { useSidebarSafe } from "@/components/ui/sidebar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Safe sidebar trigger that checks context before rendering
function SafeSidebarTrigger() {
  const sidebar = useSidebarSafe();

  if (!sidebar) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={sidebar.toggleSidebar}
      className="p-2 hover:bg-slate-100 rounded-lg transition-colors mr-2 h-9 w-9"
    >
      <PanelLeft className="h-5 w-5 text-slate-600" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl w-full sticky top-0 z-[99] flex px-6 md:px-10 justify-between h-16 border-b border-slate-200/80 items-center shadow-sm">
      {/* Logo Section */}
      <div className="flex gap-3 items-center">
        {isAuthenticated && <SafeSidebarTrigger />}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-40" />
          <div className="relative p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Code Doctor
          </h1>
          <span className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
            Code Health Analyzer
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex gap-4 items-center">
        {isAuthenticated ? (
          <>
            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex gap-3 items-center cursor-pointer p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all duration-200 group">
                  {user?.photo ? (
                    <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-slate-200 group-hover:ring-blue-400 transition-all">
                      <Image
                        key={user.photo}
                        src={user.photo}
                        alt="User profile"
                        width={36}
                        height={36}
                        className="object-cover h-full w-full"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full ring-2 ring-slate-200 group-hover:ring-blue-400 transition-all shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {getInitials(user?.name || "U")}
                      </span>
                    </div>
                  )}
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-700">
                      {user?.name}
                    </span>
                    <span className="text-xs text-slate-400">Developer</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-2 rounded-xl shadow-xl p-2 bg-white border border-slate-200"
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                  onClick={() => router.push("/user-settings")}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer mt-1"
                >
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Settings className="text-slate-600 h-4 w-4" />
                  </div>
                  <span className="text-slate-700">Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg cursor-pointer mt-1"
                >
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <LogOutIcon className="text-red-500 h-4 w-4" />
                  </div>
                  <span className="text-red-600 font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
