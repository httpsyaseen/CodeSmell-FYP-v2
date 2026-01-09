"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  Loader2,
  UserPlus,
  UserMinus,
  Trash2,
  Users,
  AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Member {
  _id: string;
  name: string;
  username: string;
  photo?: string;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isAddingMember, setIsAddingMember] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectSettings = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/project/get-project-settings/${id}`);
        setProject(data.project);
        setMembers(data.project.members || []);
      } catch (error) {
        console.log(error);
        console.error("Error fetching project settings:", error);
        toast.error("Failed to load project settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectSettings();
  }, [id]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchTimeout(setTimeout(() => fetchUsers(value), 500));
  };

  const fetchUsers = async (query: string) => {
    try {
      const { data } = await api.get(`/user/userinfo/${query}`);
      // Store raw results - filtering happens at render time
      setSearchResults(data.user ? [data.user] : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter search results to exclude existing members and owner
  const filteredSearchResults = searchResults.filter(
    (user) =>
      !members.some((member) => member._id === user._id) &&
      user._id !== project?.owner
  );

  const addMember = async (user: Member) => {
    const userId = user._id || (user as any).id;
    console.log("Adding member:", user, "userId:", userId);
    setIsAddingMember(userId);
    try {
      await api.patch(`/project/add-member/${project._id}`, {
        memberId: userId,
      });
      setMembers([...members, user]);
      setSearchResults((prev) => prev.filter((u) => u._id !== user._id));
      setSearchQuery("");
      toast.success(`${user.name} added to project`);
    } catch (error: any) {
      console.error("Add member error:", error);
      toast.error(error?.response?.data?.message || "Failed to add member");
    } finally {
      setIsAddingMember(null);
    }
  };

  const removeMember = async (userId: string) => {
    setIsRemovingMember(userId);
    try {
      await api.patch(`/project/remove-member/${project._id}`, {
        memberId: userId,
      });
      setMembers(members.filter((member) => member._id !== userId));
      toast.success("Member removed from project");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove member");
    } finally {
      setIsRemovingMember(null);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/project/delete-project/${project._id}`);
      toast.success("Project deleted successfully");
      router.push("/projects");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-5">
          <div className="flex items-center gap-4">
            <Link href={`/report/${id}`}>
              <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Project Settings
              </h1>
              <p className="text-sm text-slate-500">{project?.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-6 space-y-6">
        {/* Team Members Section */}
        <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden py-0">
          <CardHeader className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              Team Members
              <span className="ml-auto text-sm font-normal text-slate-500">
                {members.length} members
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-5">
            {/* Add Member Search */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                Add Team Member
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-12 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              {/* Search Results */}
              {searchQuery.length > 1 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  {isSearching ? (
                    <div className="py-6 flex justify-center items-center">
                      <Loader2 className="animate-spin text-slate-400 h-6 w-6" />
                    </div>
                  ) : filteredSearchResults.length > 0 ? (
                    <ScrollArea className="max-h-48">
                      {filteredSearchResults.map((user) => (
                        <div
                          key={user._id}
                          className="p-3 flex justify-between items-center hover:bg-white border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-slate-200">
                              <AvatarImage
                                src={user.photo || "/placeholder.svg"}
                                alt={user.name}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                {user.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm text-slate-800">
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addMember(user)}
                            disabled={isAddingMember === user._id}
                            className="h-9 px-4 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-blue-500/25"
                          >
                            {isAddingMember === user._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="mr-1.5 h-4 w-4" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-sm text-slate-500">No users found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Current Members List */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                Current Members
              </label>
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member._id}
                      className="p-3 flex justify-between items-center rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-slate-200">
                          <AvatarImage
                            src={member.photo || "/placeholder.svg"}
                            alt={member.name}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                            {member.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            {member.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            @{member.username}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member._id)}
                        disabled={isRemovingMember === member._id}
                        className="h-9 px-3 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors"
                      >
                        {isRemovingMember === member._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserMinus className="mr-1.5 h-4 w-4" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="p-3 bg-slate-100 rounded-xl w-fit mx-auto mb-3">
                    <Users className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">
                    No team members added yet
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Search for users above to add them
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Delete Project */}
        <Card className="bg-white border border-rose-200 rounded-xl overflow-hidden py-0">
          <CardHeader className="border-b border-rose-200 bg-rose-50 px-5 py-4">
            <CardTitle className="text-base font-semibold text-rose-700 flex items-center gap-2">
              <div className="p-1.5 bg-rose-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </div>
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Delete this project
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Once deleted, all data will be permanently removed.
                </p>
              </div>
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-4 text-sm font-medium text-rose-600 border-rose-300 hover:bg-rose-50 hover:border-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border border-slate-200 shadow-xl rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-slate-800 flex items-center gap-2">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-rose-600" />
                      </div>
                      Delete Project
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 pt-2">
                      Are you sure you want to delete{" "}
                      <strong className="text-slate-800">
                        {project?.title}
                      </strong>
                      ? This action cannot be undone. All project data, reports,
                      and analysis will be permanently removed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteProject}
                      disabled={isDeleting}
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-lg shadow-rose-500/25"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Project
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
