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
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#0969da] border-[#d0d7de]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-white max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/report/${id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#24292f] hover:bg-[#f6f8fa]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#24292f]">
            Project Settings
          </h1>
          <p className="text-sm text-[#57606a]">{project?.title}</p>
        </div>
      </div>

      {/* Team Members Section */}
      <Card className="border border-[#d0d7de] rounded-md mb-6 py-0">
        <CardHeader className="border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-3">
          <CardTitle className="text-base font-semibold text-[#24292f] flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Add Member Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#24292f]">
              Add Team Member
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#57606a]" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-9 border-[#d0d7de] focus-visible:ring-[#0969da] focus-visible:border-[#0969da]"
              />
            </div>

            {/* Search Results */}
            {searchQuery.length > 1 && (
              <Card className="border border-[#d0d7de] rounded-md">
                <CardContent className="p-0">
                  {isSearching ? (
                    <div className="py-4 flex justify-center items-center">
                      <Loader2 className="animate-spin text-[#57606a]" />
                    </div>
                  ) : filteredSearchResults.length > 0 ? (
                    <ScrollArea className="max-h-48">
                      {filteredSearchResults.map((user) => (
                        <div
                          key={user._id}
                          className="p-3 flex justify-between items-center hover:bg-[#f6f8fa] border-b border-[#d0d7de] last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-[#d0d7de]">
                              <AvatarImage
                                src={user.photo || "/placeholder.svg"}
                                alt={user.name}
                              />
                              <AvatarFallback className="bg-[#f6f8fa] text-[#24292f]">
                                {user.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm text-[#24292f]">
                                {user.name}
                              </p>
                              <p className="text-xs text-[#57606a]">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addMember(user)}
                            disabled={isAddingMember === user._id}
                            className="h-8 text-xs bg-[#2da44e] hover:bg-[#2c974b] text-white"
                          >
                            {isAddingMember === user._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="mr-1 h-3.5 w-3.5" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="py-4 text-center text-[#57606a]">
                      <p className="text-sm">No users found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Current Members List */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#24292f]">
              Current Members
            </label>
            {members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="p-3 flex justify-between items-center rounded-md border border-[#d0d7de] bg-[#f6f8fa]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-[#d0d7de]">
                        <AvatarImage
                          src={member.photo || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-white text-[#24292f]">
                          {member.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-[#24292f]">
                          {member.name}
                        </p>
                        <p className="text-xs text-[#57606a]">
                          @{member.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member._id)}
                      disabled={isRemovingMember === member._id}
                      className="h-8 text-xs text-[#cf222e] hover:bg-[#ffebe9] hover:text-[#cf222e]"
                    >
                      {isRemovingMember === member._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <UserMinus className="mr-1 h-3.5 w-3.5" />
                          Remove
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-[#57606a] border border-[#d0d7de] rounded-md bg-[#f6f8fa]">
                <Users className="h-8 w-8 mx-auto mb-2 text-[#d0d7de]" />
                <p className="text-sm">No team members added yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone - Delete Project */}
      <Card className="border border-rounded rounded-md py-0 ">
        <CardHeader className="border-b border-[#cf222e] bg-[#ffebe9] px-4 py-3">
          <CardTitle className="text-base font-semibold text-[#cf222e] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#24292f]">
                Delete this project
              </h3>
              <p className="text-xs text-[#57606a] mt-1">
                Once you delete a project, there is no going back. Please be
                certain.
              </p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm font-medium text-[#cf222e] border-[#cf222e] hover:bg-[#ffebe9] hover:text-[#cf222e]"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-[#d0d7de] shadow-lg rounded-md">
                <DialogHeader>
                  <DialogTitle className="text-[#24292f] flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#cf222e]" />
                    Delete Project
                  </DialogTitle>
                  <DialogDescription className="text-[#57606a]">
                    Are you sure you want to delete{" "}
                    <strong className="text-[#24292f]">{project?.title}</strong>
                    ? This action cannot be undone. All project data, reports,
                    and analysis will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    className="border-[#d0d7de] text-[#24292f] hover:bg-[#f6f8fa]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    className="bg-[#cf222e] hover:bg-[#a40e26] text-white"
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
  );
}
