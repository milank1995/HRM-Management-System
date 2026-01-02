import { ReactNode } from "react";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: DialogProps) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Dialog Content */}
      <div className={`relative bg-white rounded-xl shadow-xl p-8 w-full mx-4 ${sizeClasses[size]}`}>
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {/* Horizontal Line */}
        <hr className="border-t border-gray-200 mb-6" />

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
