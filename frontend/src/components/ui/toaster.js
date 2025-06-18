import React from "react"
import { useToast } from "../../hooks/use-toast"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

const Toaster = () => {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex max-h-screen w-full max-w-sm flex-col p-4">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <div
            key={id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg p-4 pr-8 shadow-2xl transition-all mb-2",
              "bg-gray-900/95 backdrop-blur-sm text-white border-2 border-cyan-400/50 neon-border"
            )}
            {...props}
          >
            <div className="grid gap-1 flex-1">
              {title && (
                <div className="text-sm font-bold text-white">
                  {title}
                </div>
              )}
              {description && (
                <div className="text-sm text-gray-200">
                  {description}
                </div>
              )}
            </div>
            {action}
            <button
              className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-white focus:opacity-100 focus:outline-none transition-colors"
              onClick={() => props.onOpenChange?.(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export { Toaster }