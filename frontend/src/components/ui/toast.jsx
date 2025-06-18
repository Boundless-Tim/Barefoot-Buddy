import * as React from "react"
import { cn } from "../../lib/utils"

const Toast = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border bg-background text-foreground",
    destructive: "destructive border-destructive bg-destructive text-destructive-foreground",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = "Toast"

export { Toast }