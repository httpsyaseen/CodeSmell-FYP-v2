"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Clock, Eye, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import Loading from "@/components/loading";

interface TeamMember {
  id: string;
  name: string;
  photo?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  members: TeamMember[];
  totalSmells: number;
  lastUpdated: string;
}

export default function GitHubProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/get-all-projects`
        );

        // Extract projects from response
        const fetchedProjects = response.data.data.projects.map(
          (project: any) => ({
            _id: project._id,
            title: project.title,
            description: project.description,
            members: project.members.length > 0 ? project.members : [],
            totalSmells: project.totalSmells,
            lastUpdated: project.lastUpdated,
          })
        );

        setProjects(fetchedProjects);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to fetch projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    [project.title, project.description].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 pb-8">
      {/* Header section */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
          <Button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-4 py-2 shadow-lg shadow-blue-500/25 transition-all"
            onClick={() => router.push("/upload")}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Search section */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search projects..."
              className="pl-12 h-11 rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Projects grid */}
        {filteredProjects.length > 0 ? (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <Card
                key={project._id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 group py-0"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-grow min-w-0">
                      {/* Project title & description */}
                      <div className="mb-3">
                        <a
                          href={`/code-editor/${project._id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/code-editor/${project._id}`);
                          }}
                          className="text-lg font-semibold text-slate-800 hover:text-blue-600 transition-colors inline-block"
                        >
                          {project.title}
                        </a>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                          {project.description}
                        </p>
                      </div>

                      {/* Meta info row */}
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Code smells */}
                        <div className="flex items-center gap-1.5 text-sm">
                          <AlertTriangle className={`h-4 w-4 ${
                            project.totalSmells === 0
                              ? "text-emerald-500"
                              : project.totalSmells < 10
                              ? "text-amber-500"
                              : "text-rose-500"
                          }`} />
                          <span className="text-slate-600 font-medium">{project.totalSmells}</span>
                          <span className="text-slate-400">issues</span>
                        </div>

                        <div className="w-px h-4 bg-slate-200" />

                        {/* Last updated */}
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>{formatDate(project.lastUpdated)}</span>
                        </div>

                        {project.members.length > 0 && (
                          <>
                            <div className="w-px h-4 bg-slate-200" />
                            
                            {/* Team members */}
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {project.members.slice(0, 3).map((member) => (
                                  <Avatar
                                    key={member.id}
                                    className="h-6 w-6 border-2 border-white ring-1 ring-slate-100"
                                  >
                                    <AvatarImage
                                      src={member.photo || "/placeholder.svg"}
                                      alt={member.name}
                                    />
                                    <AvatarFallback className="text-[9px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                      {member.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              {project.members.length > 3 && (
                                <span className="text-sm text-slate-400">
                                  +{project.members.length - 3}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <Button
                      size="sm"
                      className="h-9 px-4 text-sm font-medium bg-slate-50 text-slate-600 hover:bg-blue-500 hover:text-white border border-slate-200 hover:border-blue-500 rounded-lg transition-all duration-200 shrink-0"
                      onClick={() => router.push(`/report/${project._id}`)}
                    >
                      <Eye className="mr-1.5 h-4 w-4" />
                      View Report
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-slate-100 rounded-xl">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  No projects found
                </h3>
                <p className="text-sm text-slate-500">
                  Try adjusting your search.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
