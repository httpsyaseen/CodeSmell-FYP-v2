"use client";

import * as React from "react";
import {
  FileIcon,
  HomeIcon,
  SearchIcon,
  UploadIcon,
  FolderOpen,
  Clock,
  AlertCircle,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

type Project = {
  _id: string;
  title: string;
  createdAt: string;
  latestVersion: {
    report: {
      totalSmells: number;
    };
  };
};

const navItems = [
  {
    title: "Dashboard",
    icon: HomeIcon,
    href: "/dashboard",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Upload Project",
    icon: UploadIcon,
    href: "/upload",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "All Projects",
    icon: FolderOpen,
    href: "/projects",
    gradient: "from-violet-500 to-purple-500",
  },
];

export function AppSidebar() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isActive, setIsActive] = React.useState("");
  const { user } = useAuth();
  const { toggleSidebar, state } = useSidebar();

  React.useEffect(() => {
    const handleRouteChange = () => {
      setIsActive(window.location.pathname);
    };

    handleRouteChange();
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  React.useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/project/recent-projects`);
        setProjects(response.data.projects);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSmellBadgeColor = (smells: number) => {
    if (smells === 0) return "bg-emerald-100 text-emerald-700";
    if (smells < 50) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
  };

  return (
    <Sidebar className="mt-16 border-r border-slate-200/80 bg-gradient-to-b from-slate-50 to-white">
      <SidebarContent className="px-3 py-4">
        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isCurrentActive = isActive === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      className={`group relative rounded-xl px-3 py-5 transition-all duration-200 ${
                        isCurrentActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                          : "hover:bg-slate-100"
                      }`}
                    >
                      <a
                        href={item.href}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div
                          className={`p-1.5 rounded-lg transition-all ${
                            isCurrentActive
                              ? "bg-white/20"
                              : `bg-gradient-to-br ${item.gradient} shadow-sm`
                          }`}
                        >
                          <item.icon
                            className={`h-4 w-4 ${
                              isCurrentActive ? "text-white" : "text-white"
                            }`}
                          />
                        </div>
                        <span
                          className={`font-medium ${
                            isCurrentActive
                              ? "text-white"
                              : "text-slate-700 group-hover:text-slate-900"
                          }`}
                        >
                          {item.title}
                        </span>
                        {isCurrentActive && (
                          <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Projects Section */}
        <SidebarGroup className="mt-1">
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              Recent Projects
            </span>
            {projects.length > 0 && (
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {projects.length}
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Search Input */}
            <div className="relative mb-3 px-1">
              <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search projects..."
                className="h-9 rounded-xl border-slate-200 bg-white pl-10 text-sm placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Project List */}
            <SidebarMenu className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-slate-50 animate-pulse">
                        <div className="h-8 w-8 rounded-lg bg-slate-200" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-24 rounded bg-slate-200" />
                          <div className="h-2 w-16 rounded bg-slate-200" />
                        </div>
                      </div>
                    </SidebarMenuItem>
                  ))
              ) : error ? (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-slate-500 bg-slate-50 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>{error}</span>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <Sparkles className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No projects found</p>
                  <a
                    href="/upload"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Upload your first project
                  </a>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <SidebarMenuItem key={project._id}>
                    <SidebarMenuButton
                      asChild
                      className="rounded-xl px-3 py-5 hover:bg-slate-100 transition-all group"
                    >
                      <a
                        href={`/report/${project._id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg group-hover:from-blue-100 group-hover:to-indigo-100 transition-all">
                          <FileIcon className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900">
                            {project.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatDistanceToNow(new Date(project.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSmellBadgeColor(
                            project.latestVersion?.report?.totalSmells || 0
                          )}`}
                        >
                          {project.latestVersion?.report?.totalSmells || 0}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="border-t border-slate-200/80 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-slate-200 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
              {getInitials(user?.name || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </SidebarFooter>

      {/* Toggle Arrow Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md hover:bg-slate-50 transition-all"
        title={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronLeft
          className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
            state === "collapsed" ? "rotate-180" : ""
          }`}
        />
      </button>

      <SidebarRail />
    </Sidebar>
  );
}
