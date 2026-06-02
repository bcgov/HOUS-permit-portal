import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import Select from "react-select"
import { ITemplateCategory } from "../../../../models/template-category"
import { IOption } from "../../../../types/types"

interface ITemplateCategorySelectProps {
  templateCategories: ITemplateCategory[]
  selectedCategoryId?: string | null
  onChange: (categoryId: string | null) => void
  placeholder?: string
  isLoading?: boolean
  [x: string]: any
}

export const TemplateCategorySelect = observer(function TemplateCategorySelect({
  templateCategories,
  selectedCategoryId,
  onChange,
  placeholder,
  isLoading,
  styles,
  ...rest
}: ITemplateCategorySelectProps) {
  const options = useMemo<IOption[]>(
    () => templateCategories.map((category) => ({ label: category.label, value: category.id })),
    [templateCategories]
  )
  const selectedOption = options.find((option) => option.value === selectedCategoryId) ?? null

  return (
    <Select<IOption>
      isClearable
      isLoading={isLoading}
      options={options}
      value={selectedOption}
      onChange={(option) => onChange(option?.value ?? null)}
      placeholder={placeholder}
      styles={{
        control: (css, state) => ({
          ...css,
          borderColor: state.isFocused ? "var(--chakra-colors-focus)" : "var(--chakra-colors-border-light)",
          borderRadius: "6px",
          minHeight: "var(--chakra-sizes-10)",
          boxShadow: "none",
          fontSize: "var(--chakra-fontSizes-sm)",
          ":hover": {
            borderColor: "var(--chakra-colors-border-base)",
          },
        }),
        menu: (css) => ({
          ...css,
          zIndex: 3,
        }),
        option: (css, state) => ({
          ...css,
          cursor: "pointer",
          color: "var(--chakra-colors-text-primary)",
          backgroundColor: state.isFocused ? "var(--chakra-colors-semantic-infoLight)" : undefined,
          ":hover": {
            backgroundColor: "var(--chakra-colors-gray-100)",
          },
        }),
        ...styles,
      }}
      {...rest}
    />
  )
})
