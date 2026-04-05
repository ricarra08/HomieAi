import { ProgressStepper } from "@/components/layout/ProgressStepper";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { AICopilotButton, AICopilotPanel } from "@/components/copilot/AICopilot";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ProgressStepper />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 xl:p-10 min-w-0">
          <div className="max-w-[1152px] mx-auto w-full">
            {children}
          </div>
        </main>
        <AICopilotPanel />
      </div>
      <GlobalFooter />
      <AICopilotButton />
    </div>
  );
}
