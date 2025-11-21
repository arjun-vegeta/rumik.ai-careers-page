"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

// Displays temporary notification messages with auto-dismiss
export default function Toast({ message, type = "success", onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for slide out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed top-8 right-8 z-[9999] transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
          type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        {type === "success" ? (
          <CheckCircle size={20} className="flex-shrink-0" />
        ) : (
          <XCircle size={20} className="flex-shrink-0" />
        )}
        <p className="font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="ml-2 hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
