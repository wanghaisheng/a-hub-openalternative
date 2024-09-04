import { cx } from "apps/web/app/utils/cva"
import type { HTMLAttributes } from "react"

type ErrorMessageProps = HTMLAttributes<HTMLElement> & {
  errors?: string[]
  showAll?: boolean
}

export const ErrorMessage = ({ className, errors, showAll, ...props }: ErrorMessageProps) => {
  if (!errors?.length) {
    return null
  }

  return (
    <p className={cx("text-xs text-red-600", className)} {...props}>
      {showAll ? errors.join(", ") : errors[0]}
    </p>
  )
}