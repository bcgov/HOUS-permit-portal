import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { CSSProperties, RefAttributes } from "react"
import { GroupBase } from "react-select"
import AsyncReactSelect, { AsyncProps } from "react-select/async"
import AsyncCreatableSelect from "react-select/async-creatable"
import { AsyncCreatableProps } from "react-select/dist/declarations/src/AsyncCreatable"
import Select from "react-select/dist/declarations/src/Select"
import { SelectComponentsConfig } from "react-select/dist/declarations/src/components"
import { StylesConfig } from "react-select/dist/declarations/src/styles"
import { IOption } from "../../../types/types"

export type TAsyncSelectProps<
  TOption = IOption,
  TIsMulti extends boolean = false,
  TGroup extends GroupBase<TOption> = undefined,
> = (
  | ({
      isCreatable: false
    } & AsyncProps<TOption, TIsMulti, TGroup>)
  | ({ isCreatable: true } & AsyncCreatableProps<TOption, TIsMulti, TGroup>)
) &
  RefAttributes<Select<TOption, TIsMulti, TGroup>> & {
    stylesToMerge?: {
      [key in
        | "control"
        | "menu"
        | "option"
        | "input"
        | "placeholder"
        | "menuList"
        | "container"
        | "valueContainer"]?: CSSProperties
    }
  }

export const AsyncSelect = observer(function <
  TOption = IOption,
  TIsMulti extends boolean = false,
  TGroup extends GroupBase<TOption> = undefined,
>(props: TAsyncSelectProps<TOption, TIsMulti, TGroup>) {
  const { onChange, value, styles, components, stylesToMerge, ...rest } = props

  const getMergedStyles = (): StylesConfig<TOption, TIsMulti, TGroup> => {
    return {
      container: (css, state) => ({
        ...css,
        ...(stylesToMerge?.container ?? {}),
      }),
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
        ...(stylesToMerge?.control ?? {}),
      }),
      menu: (css, state) => ({
        boxShadow: "inset 0 1px 0 rgba(0, 0, 0, 0.1)",
        border: "1px solid",
        borderRadius: "6px",
        borderTop: "none",
        borderColor: "var(--chakra-colors-border-light)",
        ...(stylesToMerge?.menu ?? {}),
      }),
      option: (css, state) => ({
        ...css,
        cursor: "pointer",
        color: "var(--chakra-colors-text-primary)",
        "&:hover": {
          backgroundColor: "var(--chakra-colors-gray-100)",
        },
        backgroundColor: state.isFocused ? "var(--chakra-colors-semantic-infoLight)" : undefined,
        ...(stylesToMerge?.option ?? {}),
      }),
      input: (css, state) => ({
        ...css,
        fontSize: "var(--chakra-fontSizes-sm)",
        color: "var(--chakra-colors-text-primary)",
        ...(stylesToMerge?.input ?? {}),
      }),
      placeholder: (css, state) => ({
        ...css,
        fontSize: "var(--chakra-fontSizes-sm)",
        ...(stylesToMerge?.placeholder ?? {}),
      }),
      menuList: (css, state) => ({
        ...css,
        backgroundColor: "var(--chakra-colors-greys-white)",
        borderRadius: "6px",
        ...(stylesToMerge?.menuList ?? {}),
      }),
      ...styles,
    }
  }
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
      styles={getMergedStyles()}
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
