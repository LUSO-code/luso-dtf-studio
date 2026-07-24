import { WorkflowState, WorkflowStep } from "./types";

const WORKFLOW_STORAGE_KEY = "luso_dtf_active_workflow";

export function getActiveWorkflow(): WorkflowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkflowState;
  } catch {
    return null;
  }
}

export function saveActiveWorkflow(state: Partial<WorkflowState>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getActiveWorkflow() || {};
    const updated: WorkflowState = {
      ...current,
      ...state,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

export function clearActiveWorkflow(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WORKFLOW_STORAGE_KEY);
  } catch {}
}
