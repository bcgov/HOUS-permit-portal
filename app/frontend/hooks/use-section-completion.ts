import React from "react"
import { useFormContext } from "react-hook-form"

interface IUseSectionCompletionProps {
  key: string
  requiredFields?: string[]
  validate?: (values: any) => boolean
}

export const useSectionCompletion = ({ key, requiredFields, validate }: IUseSectionCompletionProps) => {
  const { watch, getValues } = useFormContext()
  const [isComplete, setIsComplete] = React.useState(false)
  const allValues = watch()

  React.useEffect(() => {
    const values = getValues()
    let valid = false

    if (validate) {
      valid = validate(values)
    } else if (requiredFields) {
      const getNested = (obj: any, path: string) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj)
      const hasVal = (v: any) => v !== undefined && v !== null && String(v).toString().trim() !== ""
      valid = requiredFields.every((p) => hasVal(getNested(values, p)))
    }

    setIsComplete(valid)

    window.dispatchEvent(new CustomEvent("szch:section", { detail: { key, complete: valid } }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allValues, key, requiredFields, validate])

  return isComplete
}
