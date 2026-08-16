import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-0 duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => onOpenChange?.(false)} 
      />
      <div className="relative z-50 w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl duration-200 sm:rounded-xl max-h-[85vh] flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ className, children, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left pb-4 border-b border-border", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function DialogClose({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-muted-foreground hover:text-foreground cursor-pointer"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
}
