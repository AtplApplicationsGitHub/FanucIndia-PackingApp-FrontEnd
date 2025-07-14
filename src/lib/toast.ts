import { toast } from "sonner";

type ToastOpts = Parameters<typeof toast>[1];

export function showToast(message: string, opts?: ToastOpts) {
  toast(message, opts);
}
