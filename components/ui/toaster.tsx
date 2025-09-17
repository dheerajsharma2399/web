// apps/web/components/ui/toaster.tsx
"use client"

import { Toaster as RadixToaster } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <RadixToaster>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <RadixToaster.Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <RadixToaster.ToastTitle>{title}</RadixToaster.ToastTitle>}
              {description && (
                <RadixToaster.ToastDescription>
                  {description}
                </RadixToaster.ToastDescription>
              )}
            </div>
            {action}
            <RadixToaster.ToastClose />
          </RadixToaster.Toast>
        )
      })}
    </RadixToaster>
  )
}
