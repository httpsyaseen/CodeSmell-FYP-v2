"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileCode,
  AlertCircle,
  Wand2,
  X,
  GitCompare,
  Plus,
  Minus,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import toast from "react-hot-toast";

// Simple diff algorithm to detect changes
function computeDiff(original: string[], refactored: string[]) {
  const result: Array<{
    type: "added" | "removed" | "unchanged";
    originalIndex: number | null;
    refactoredIndex: number | null;
    content: string;
  }> = [];

  let i = 0,
    j = 0;

  while (i < original.length || j < refactored.length) {
    if (i >= original.length) {
      // Only refactored lines left (additions)
      result.push({
        type: "added",
        originalIndex: null,
        refactoredIndex: j,
        content: refactored[j],
      });
      j++;
    } else if (j >= refactored.length) {
      // Only original lines left (removals)
      result.push({
        type: "removed",
        originalIndex: i,
        refactoredIndex: null,
        content: original[i],
      });
      i++;
    } else if (original[i] === refactored[j]) {
      // Lines match (unchanged)
      result.push({
        type: "unchanged",
        originalIndex: i,
        refactoredIndex: j,
        content: original[i],
      });
      i++;
      j++;
    } else {
      // Lines differ - look ahead to find matches
      let foundMatch = false;
      const lookAhead = 5;

      // Check if current original line appears in next few refactored lines
      for (let k = j + 1; k < Math.min(j + lookAhead, refactored.length); k++) {
        if (original[i] === refactored[k]) {
          // Found match ahead in refactored, mark intermediate as additions
          while (j < k) {
            result.push({
              type: "added",
              originalIndex: null,
              refactoredIndex: j,
              content: refactored[j],
            });
            j++;
          }
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        // Check if current refactored line appears in next few original lines
        for (let k = i + 1; k < Math.min(i + lookAhead, original.length); k++) {
          if (refactored[j] === original[k]) {
            // Found match ahead in original, mark intermediate as removals
            while (i < k) {
              result.push({
                type: "removed",
                originalIndex: i,
                refactoredIndex: null,
                content: original[i],
              });
              i++;
            }
            foundMatch = true;
            break;
          }
        }
      }

      if (!foundMatch) {
        // No match found, treat as removal + addition
        result.push({
          type: "removed",
          originalIndex: i,
          refactoredIndex: null,
          content: original[i],
        });
        result.push({
          type: "added",
          originalIndex: null,
          refactoredIndex: j,
          content: refactored[j],
        });
        i++;
        j++;
      }
    }
  }

  return result;
}

interface Smell {
  smellType: string;
  fileName: string;
  filePath: string;
  startLine: number;
  endLine: number;
  category: string;
  weight: number;
  _id: string;
}

interface FileData {
  fileName: string;
  content: string;
  _id: string;
}

interface CodeEditorProps {
  fileData: FileData[];
  smells: Smell[];
  projectId?: string;
}

interface RefactoredData {
  originalCode: string;
  refactoredCode: string;
  codeSmellAddressed: string;
  tokensUsed: number;
}

export default function CodeEditor({
  fileData,
  smells,
  projectId,
}: CodeEditorProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [refactoringSmell, setRefactoringSmell] = useState<string | null>(null);
  const [refactoredData, setRefactoredData] = useState<RefactoredData | null>(
    null
  );
  const [showComparison, setShowComparison] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(true);

  useEffect(() => {
    if (fileData.length > 0) {
      setSelectedFile(fileData[0]);
    }
  }, [fileData]);

  const handleRefactor = async (smell: Smell) => {
    if (!selectedFile) return;

    setRefactoringSmell(smell._id);
    try {
      const response = await api.post("/refactor/refactor", {
        code: selectedFile.content,
        codeSmell: smell.smellType,
      });

      if (response.data.status === "success") {
        setRefactoredData(response.data.data);
        setShowComparison(true);
        toast.success("Code refactored successfully!");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to refactor code");
    } finally {
      setRefactoringSmell(null);
    }
  };

  const closeComparison = () => {
    setShowComparison(false);
    setRefactoredData(null);
  };

  const getSmellsForFile = (fileName: string) => {
    return smells.filter((smell) => smell.fileName === fileName);
  };

  const getSmellColor = (weight: number) => {
    switch (weight) {
      case 4:
        return "border-red-500 bg-red-50";
      case 3:
        return "border-yellow-500 bg-yellow-50";
      case 2:
        return "border-green-500 bg-green-50";
      default:
        return "";
    }
  };

  const getSmellBadgeColor = (weight: number) => {
    switch (weight) {
      case 4:
        return "bg-red-100 text-red-800 border-red-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderComparison = () => {
    if (!refactoredData) return null;

    const originalLines = refactoredData.originalCode.split("\n");
    const refactoredLines = refactoredData.refactoredCode.split("\n");

    const diff = computeDiff(originalLines, refactoredLines);

    return (
      <div className="flex h-full">
        {/* Original Code */}
        <div className="flex-1 border-r">
          <div className="bg-red-50 border-b px-4 py-2 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Original Code
              </span>
            </div>
          </div>
          <div className="text-xs font-mono">
            {diff.map((line, index) => {
              if (line.type === "added") {
                // Don't show added lines in original column
                return null;
              }

              const bgClass =
                line.type === "removed" ? "bg-red-50" : "hover:bg-gray-50";
              const borderClass =
                line.type === "removed" ? "border-l-4 border-red-400" : "";

              return (
                <div
                  key={`original-${index}`}
                  className={cn("flex", bgClass, borderClass)}
                >
                  <div className="w-12 text-right pr-4 select-none text-gray-400 border-r border-gray-200 bg-gray-50 flex-shrink-0">
                    {line.originalIndex !== null ? line.originalIndex + 1 : ""}
                  </div>
                  <div className="pl-4 whitespace-pre-wrap break-all flex-grow py-0.5 flex items-center gap-2">
                    {line.type === "removed" && (
                      <Minus className="h-3 w-3 text-red-600 flex-shrink-0" />
                    )}
                    <span
                      className={line.type === "removed" ? "text-red-700" : ""}
                    >
                      {line.content || " "}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Refactored Code */}
        <div className="flex-1">
          <div className="bg-green-50 border-b px-4 py-2 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Refactored Code
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {refactoredData.codeSmellAddressed}
              </span>
              <span className="text-gray-500">
                {refactoredData.tokensUsed} tokens
              </span>
            </div>
          </div>
          <div className="text-xs font-mono">
            {diff.map((line, index) => {
              if (line.type === "removed") {
                // Don't show removed lines in refactored column
                return null;
              }

              const bgClass =
                line.type === "added" ? "bg-green-50" : "hover:bg-gray-50";
              const borderClass =
                line.type === "added" ? "border-l-4 border-green-400" : "";

              return (
                <div
                  key={`refactored-${index}`}
                  className={cn("flex", bgClass, borderClass)}
                >
                  <div className="w-12 text-right pr-4 select-none text-gray-400 border-r border-gray-200 bg-gray-50 flex-shrink-0">
                    {line.refactoredIndex !== null
                      ? line.refactoredIndex + 1
                      : ""}
                  </div>
                  <div className="pl-4 whitespace-pre-wrap break-all flex-grow py-0.5 flex items-center gap-2">
                    {line.type === "added" && (
                      <Plus className="h-3 w-3 text-green-600 flex-shrink-0" />
                    )}
                    <span
                      className={line.type === "added" ? "text-green-700" : ""}
                    >
                      {line.content || " "}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFileContent = () => {
    if (!selectedFile) return null;

    const lines = selectedFile.content.split("\n");
    const fileSmells = getSmellsForFile(selectedFile.fileName);

    // Create a map to track which lines should show smell titles
    const smellTitles: Record<number, Smell> = {};

    // Create a map to track which lines should be highlighted
    const highlightedLines: Record<number, { smell: Smell; isStart: boolean }> =
      {};

    // Process each smell to determine highlighting and title placement
    fileSmells.forEach((smell) => {
      // Add the smell title to the start line
      smellTitles[smell.startLine] = smell;

      // Determine how many lines to highlight
      const smellRange = smell.endLine - smell.startLine;
      const highlightEndLine =
        smellRange > 3 ? smell.startLine + 3 : smell.endLine;

      // Mark lines for highlighting
      for (let i = smell.startLine; i <= highlightEndLine; i++) {
        highlightedLines[i] = {
          smell,
          isStart: i === smell.startLine,
        };
      }
    });

    return (
      <div className="text-xs font-mono relative">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const highlight = highlightedLines[lineNumber];
          const smellTitle = smellTitles[lineNumber];

          const smellClasses = highlight
            ? `border-l-4 ${getSmellColor(highlight.smell.weight)}`
            : "";

          return (
            <div key={lineNumber} className="relative">
              {smellTitle && (
                <div className="absolute right-4 -top-6 z-10 flex items-center gap-2">
                  <div
                    className={`
                    px-3 py-1 rounded-t-md border shadow-sm font-medium
                    ${getSmellBadgeColor(highlight.smell.weight)}
                  `}
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      <span>{smellTitle.smellType}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRefactor(smellTitle)}
                    disabled={refactoringSmell === smellTitle._id}
                    className="px-3 py-1 rounded-t-md border shadow-sm font-medium bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Refactor this code smell"
                  >
                    <div className="flex items-center gap-1">
                      <Wand2 className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {refactoringSmell === smellTitle._id
                          ? "Refactoring..."
                          : "Refactor"}
                      </span>
                    </div>
                  </button>
                </div>
              )}
              <div className={cn("flex", smellClasses)}>
                <div className="w-12 text-right pr-4 select-none text-gray-400 border-r border-gray-200 flex-shrink-0">
                  {lineNumber}
                </div>
                <div className="pl-4 whitespace-pre-wrap break-all flex-grow text-xs py-0.5">
                  {line || " "}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* GitHub-like header */}
      <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowFilePanel(!showFilePanel)}
            className="flex items-center gap-1 p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title={showFilePanel ? "Hide file panel" : "Show file panel"}
          >
            {showFilePanel ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </button>
          {showComparison ? (
            <>
              <GitCompare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Refactored Comparison -{" "}
                {selectedFile?.fileName || "Select a file"}
              </span>
            </>
          ) : (
            <>
              <FileCode className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {selectedFile?.fileName || "Select a file"}
              </span>
            </>
          )}
        </div>
        {showComparison && (
          <button
            onClick={closeComparison}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            title="Close comparison"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        )}
      </div>

      <div className="flex h-[600px]">
        {/* File explorer */}
        <div
          className={cn(
            "border-r overflow-y-auto bg-gray-50 transition-all duration-300",
            showFilePanel ? "w-64" : "w-0 overflow-hidden border-r-0"
          )}
        >
          <div className="p-2 w-64">
            {fileData.map((file) => (
              <div
                key={file._id}
                className={cn(
                  "flex items-center p-2 cursor-pointer hover:bg-gray-200 rounded-md text-sm",
                  selectedFile?._id === file._id ? "bg-blue-100" : ""
                )}
                onClick={() => setSelectedFile(file)}
              >
                <FileCode className="h-4 w-4 mr-2 text-gray-500" />
                <span className="truncate">{file.fileName}</span>
                {getSmellsForFile(file.fileName).length > 0 && (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full">
                    {getSmellsForFile(file.fileName).length}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Code content */}
        <div className="flex-1 overflow-auto">
          {showComparison ? (
            renderComparison()
          ) : selectedFile ? (
            <div className="relative pt-6">{renderFileContent()}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a file to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
