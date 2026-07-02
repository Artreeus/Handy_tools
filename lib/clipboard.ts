import { toast } from 'sonner';

export async function copyToClipboard(
  text: string,
  successMessage = 'Copied to clipboard!',
  errorMessage = 'Failed to copy to clipboard'
) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error(errorMessage);
  }
}
