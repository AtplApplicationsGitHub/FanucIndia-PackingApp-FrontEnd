import { toast } from "sonner";

export function showToast(message: string, opts?: any) {
  toast(message, opts);
}
