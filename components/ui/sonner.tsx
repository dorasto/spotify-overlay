"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-[#1a1d27] text-white border-white/[0.08] shadow-lg rounded-lg",
          description: "text-gray-400",
          actionButton:
            "bg-emerald-600 text-white hover:bg-emerald-500",
          cancelButton:
            "bg-white/[0.1] text-gray-300 hover:bg-white/[0.15]",
          success: "bg-emerald-500/10 border-emerald-500/20",
          error: "bg-red-500/10 border-red-500/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
