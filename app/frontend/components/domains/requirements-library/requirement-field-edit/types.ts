import { FieldValues } from "react-hook-form"
import { FieldPath } from "react-hook-form/dist/types"
import { UseControllerProps } from "react-hook-form/dist/types/controller"

export interface IControlProps<TFieldValues extends FieldValues> {
  controlProps: Omit<UseControllerProps<TFieldValues, FieldPath<TFieldValues>>, "render">
}
