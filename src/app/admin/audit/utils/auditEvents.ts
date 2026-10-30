/** One refresh event for every audit type: the planning table and the card counts listen to it. */
export const AUDITS_UPDATED_EVENT = "audits-updated";

export const notifyAuditsUpdated = () =>
  window.dispatchEvent(new Event(AUDITS_UPDATED_EVENT));

/** Same global snackbar the rest of DIMS uses. */
export function showGlobalMessage(
  message: string,
  severity: "success" | "error" | "info" | "warning",
) {
  window.dispatchEvent(
    new CustomEvent("show-global-message", { detail: { message, severity } }),
  );
}
