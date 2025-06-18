import React from "react"

const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      checked 
        ? 'bg-purple-500 focus:ring-purple-500' 
        : 'bg-gray-600 focus:ring-gray-500'
    } ${className}`}
    ref={ref}
    {...props}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
))
Switch.displayName = "Switch"

export { Switch }