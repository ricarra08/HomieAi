"use client";

import { motion } from "motion/react";
import type { Phase } from "@/lib/types";
import { PHASE_GUIDE_CONTENT } from "@/lib/phase-guide-content";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface PhaseWelcomeModalProps {
  phase: Phase;
  open: boolean;
  onClose: () => void;
  onAskHomie: () => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function PhaseWelcomeModal({
  phase,
  open,
  onClose,
  onAskHomie,
}: PhaseWelcomeModalProps) {
  const content = PHASE_GUIDE_CONTENT[phase];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl">{content.title}</DialogTitle>
          <DialogDescription>{content.subtitle}</DialogDescription>
        </DialogHeader>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2"
          variants={containerVariants}
          initial="hidden"
          animate={open ? "visible" : "hidden"}
        >
          {content.sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.label}
                variants={itemVariants}
                className="flex flex-col items-center gap-2 rounded-xl bg-muted p-3 text-center"
              >
                <div className="rounded-lg bg-card p-2 shadow-sm border border-border">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-medium leading-tight">
                  {section.label}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {section.description}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <DialogFooter className="sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Got it, let me explore
          </Button>
          <Button onClick={onAskHomie} className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Ask Homie to explain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
