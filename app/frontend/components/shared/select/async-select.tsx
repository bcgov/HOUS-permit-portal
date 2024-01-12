import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { RefAttributes } from "react"
import { GroupBase } from "react-select"
import AsyncReactSelect, { AsyncProps } from "react-select/async"
import AsyncCreatableSelect from "react-select/async-creatable"
import { AsyncCreatableProps } from "react-select/dist/declarations/src/AsyncCreatable"
import Select from "react-select/dist/declarations/src/Select"
import { SelectComponentsConfig } from "react-select/dist/declarations/src/components"
import { IOption } from "../../../types/types"

export type TAsyncSelectProps<
  TOption = IOption,
  TIsMulti extends boolean = false,
  TGroup extends GroupBase<TOption> = undefined,
> = (
  | ({
      isCreatable: true
    } & AsyncProps<TOption, TIsMulti, TGroup>)
  | ({ isCreatable: false } & AsyncCreatableProps<TOption, TIsMulti, TGroup>)
) &
  RefAttributes<Select<TOption, TIsMulti, TGroup>>
export const AsyncSelect = observer(function <
  TOption = IOption,
  TIsMulti extends boolean = false,
  TGroup extends GroupBase<TOption> = undefined,
>(props: TAsyncSelectProps<TOption, TIsMulti, TGroup>) {
  const { onChange, value, styles, components, ...rest } = props

  return (
    <SelectComponent
      components={
        R.mergeRight(
          {
            DropdownIndicator: null,
          },
          components
        ) as SelectComponentsConfig<TOption, TIsMulti, TGroup>
      }
      onChange={onChange}
      value={value}
      openMenuOnClick={false}
      styles={{
        control: (css, state) => ({
          ...css,
          borderColor: state.isFocused ? "var(--chakra-colors-focus)" : "var(--chakra-colors-border-light)",
          borderRadius: "6px",
          height: "var(--chakra-sizes-10)",
          margin: 0,
          marginBottom: 0,
          boxShadow: "none",
          backgroundColor: state.isDisabled ? "var(--chakra-colors-greys-grey10)" : "var(--chakra-colors-white)",
          fontSize: "var(--chakra-fontSizes-sm)",
          ":hover": {
            borderColor: "var(--chakra-colors-border-base)",
          },
        }),
        menu: (css, state) => ({
          boxShadow: "inset 0 1px 0 rgba(0, 0, 0, 0.1)",
          border: "1px solid",
          borderRadius: "6px",
          borderTop: "none",
          borderColor: "var(--chakra-colors-border-light)",
        }),
        option: (css, state) => ({
          ...css,
          cursor: "pointer",
          color: "var(--chakra-colors-text-primary)",
          "&:hover": {
            backgroundColor: "var(--chakra-colors-gray-100)",
          },
        }),
        input: (css, state) => ({
          ...css,
          fontSize: "var(--chakra-fontSizes-sm)",
          color: "var(--chakra-colors-text-primary)",
        }),
        placeholder: (css, state) => ({
          ...css,
          fontSize: "var(--chakra-fontSizes-sm)",
        }),
        ...styles,
      }}
      {...rest}
    />
  )
})

function SelectComponent<
  TOption = IOption,
  TIsMulti extends boolean = false,
  TGroup extends GroupBase<TOption> = undefined,
>({ isCreatable, ...props }: TAsyncSelectProps<TOption, TIsMulti, TGroup>) {
  return isCreatable ? <AsyncCreatableSelect {...props} /> : <AsyncReactSelect {...props} />
}
