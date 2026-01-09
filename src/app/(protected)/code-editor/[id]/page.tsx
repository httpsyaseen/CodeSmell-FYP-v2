"use client";

import CodeEditor from "@/components/code-editor";
import Loading from "@/components/loading";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface codeInfo {
  fileData: {
    fileName: string;
    fileContent: string;
  }[];
  smells: {
    smellType: string;
    fileName: string;
    filePath: number;
    startLine: number;
    endLine: number;
    category: string;
  };
}

export default function Page() {
  const params = useParams();
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const id = params.id;

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get(`/project/getcodeinfo/${id}`);
        setData(data);
      } catch (err: any) {
        toast.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="px-4 py-2">
      <CodeEditor fileData={data.fileData} smells={data.smells} />;
    </div>
  );
}
