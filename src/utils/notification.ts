"use client";

import { toast } from "sonner";

export type NotificationType = "success" | "error" | "info" | "warning";

interface NotifyParams {
  title: string;
  message?: string;
  type?: NotificationType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notify = ({ title, message, type = "info", duration = 5000, action }: NotifyParams) => {
  const options = {
    description: message,
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  };

  switch (type) {
    case "success":
      toast.success(title, options);
      break;
    case "error":
      toast.error(title, options);
      break;
    case "warning":
      toast.warning(title, options);
      break;
    case "info":
    default:
      toast.info(title, options);
      break;
  }
};

// Exemples d'utilisation:
// notify({ title: "Émargement créé", message: "L'émargement a été créé avec succès", type: "success" });
// notify({
//   title: "Nouveau message",
//   message: "Vous avez reçu un nouveau message",
//   type: "info",
//   action: {
//     label: "Voir",
//     onClick: () => console.log("Action clicked"),
//   }
// });
