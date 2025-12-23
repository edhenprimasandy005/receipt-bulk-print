import { toast as sonnerToast } from 'sonner';

type ToastOptions = {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

/**
 * Custom toast wrapper around Sonner for easier setup and customization
 */
export const toast = {
  /**
   * Show a success toast
   */
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, {
      duration: options?.duration || 3000,
      description: options?.description,
      action: options?.action,
      position: 'top-right',
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
      position: 'top-right',
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast.info(message, {
      duration: options?.duration || 3000,
      description: options?.description,
      action: options?.action,
      position: 'top-right',
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: ToastOptions) => {
    return sonnerToast.warning(message, {
      duration: options?.duration || 3000,
      description: options?.description,
      action: options?.action,
      position: 'top-right',
    });
  },

  /**
   * Show a loading toast (returns a toast ID that can be used to update/dismiss)
   */
  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      duration: options?.duration || Infinity, // Loading toasts don't auto-dismiss
      description: options?.description,
      position: 'top-right',
    });
  },

  /**
   * Show a promise toast (automatically handles loading, success, and error states)
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      duration: options?.duration,
      description: options?.description,
      position: 'top-right',
    });
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    sonnerToast.dismiss();
  },
};
