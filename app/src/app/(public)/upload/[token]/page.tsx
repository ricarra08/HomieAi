"use client";

import { useEffect, useState, useCallback } from "react";
import { Upload, CheckCircle2, Loader2, AlertTriangle, FileText } from "lucide-react";
import { useParams } from "next/navigation";

interface LinkInfo {
  valid: boolean;
  dealId: string;
  recipientRole: string;
  propertyAddress: string;
  requestedDocuments: string[] | null;
}

interface UploadedFile {
  name: string;
  status: "uploading" | "success" | "error";
}

export default function CollaboratorUploadPage() {
  const params = useParams();
  const token = params.token as string;
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetch(`/api/collaborator/validate?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Invalid or expired link");
        }
        return res.json();
      })
      .then((data) => setLinkInfo(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleUpload = useCallback(async (file: File) => {
    setUploads((prev) => [...prev, { name: file.name, status: "uploading" }]);

    const formData = new FormData();
    formData.append("token", token);
    formData.append("file", file);

    try {
      const res = await fetch("/api/collaborator/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      setUploads((prev) => prev.map((u) => u.name === file.name ? { ...u, status: "success" } : u));
    } catch {
      setUploads((prev) => prev.map((u) => u.name === file.name ? { ...u, status: "error" } : u));
    }
  }, [token]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(handleUpload);
  }, [handleUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) Array.from(e.target.files).forEach(handleUpload);
  }, [handleUpload]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !linkInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold text-foreground">Link Unavailable</h1>
          <p className="text-muted-foreground">{error ?? "This upload link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-start justify-center pt-16">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Upload Documents</h1>
          <p className="text-muted-foreground mt-1">
            For <span className="font-medium text-foreground">{linkInfo.propertyAddress}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Uploading as <span className="capitalize">{linkInfo.recipientRole}</span>
          </p>
        </div>

        {linkInfo.requestedDocuments && linkInfo.requestedDocuments.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Requested Documents</p>
            <ul className="space-y-1">
              {linkInfo.requestedDocuments.map((d, i) => (
                <li key={i} className="text-sm text-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  {d.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
          }`}
        >
          <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-base font-medium text-foreground mt-3">Drag & drop files here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          <input type="file" accept=".pdf" multiple onChange={handleFileSelect} className="hidden" />
        </label>

        {uploads.length > 0 && (
          <div className="space-y-2">
            {uploads.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                {file.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-accent shrink-0" />}
                {file.status === "success" && <CheckCircle2 className="w-4 h-4 text-primary-foreground shrink-0" />}
                {file.status === "error" && <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />}
                <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {file.status === "uploading" ? "Uploading..." : file.status === "success" ? "Done" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Powered by HomeBuyer Pro &middot; Files are encrypted and secure
        </p>
      </div>
    </div>
  );
}
