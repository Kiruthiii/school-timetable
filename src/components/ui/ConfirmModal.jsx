import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle, Trash2, Info } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  const iconMap = {
    danger: <Trash2 className="size-6 text-red-600" />,
    warning: <AlertTriangle className="size-6 text-amber-600" />,
    info: <Info className="size-6 text-blue-600" />,
  };

  const bgMap = {
    danger: "bg-red-100",
    warning: "bg-amber-100",
    info: "bg-blue-100",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div className={`p-3.5 rounded-full ${bgMap[variant] || bgMap.danger} mb-4`}>
          {iconMap[variant] || iconMap.danger}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {title}
        </h3>

        <p className="text-slate-600 text-sm mb-6 max-w-xs">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-1/2"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            className="w-1/2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
