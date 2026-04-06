"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Save, X } from "lucide-react";
import { Button } from "./button";

interface ViewEditCardProps {
  title: string;
  subtitle?: string;
  saved: boolean;
  onSave: () => void;
  onCancel?: () => void;
  renderView: () => React.ReactNode;
  renderEdit: () => React.ReactNode;
  defaultOpen?: boolean;
  saveLabel?: string;
}

export function ViewEditCard({
  title,
  subtitle,
  saved,
  onSave,
  onCancel,
  renderView,
  renderEdit,
  defaultOpen = true,
  saveLabel = "Save",
}: ViewEditCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(!saved);

  function handleSave() {
    onSave();
    setEditing(false);
  }

  function handleCancel() {
    onCancel?.();
    setEditing(false);
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open); } }}
        className="w-full flex items-center justify-between p-6 text-left rounded-t-xl hover:bg-muted/40 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {open && saved && !editing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="flex items-center gap-1.5 text-sm text-accent font-medium hover:underline"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>
      {open && (
        <div className="px-6 pb-6 pt-0">
          {saved && !editing ? (
            renderView()
          ) : (
            <div className="space-y-4">
              {renderEdit()}
              <div className="flex justify-end gap-2 pt-2">
                {saved && (
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1.5" />
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {saveLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
