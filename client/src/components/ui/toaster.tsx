import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, variant, ...props }) {
        const isDestructive = variant === "destructive"
        return (
          <Toast key={id} variant={variant} duration={2000} {...props}>
            {isDestructive
              ? <XCircle className="w-4 h-4 shrink-0" />
              : <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
            }
            {title && <ToastTitle>{title}</ToastTitle>}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
