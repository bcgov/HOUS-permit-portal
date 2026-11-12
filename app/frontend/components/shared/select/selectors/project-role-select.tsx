import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import Select, { StylesConfig } from "react-select"
import { EGeneralContactType, EProfessionalContactType } from "../../../../types/enums"
import { IOption } from "../../../../types/types"

interface IProjectRoleSelectProps {
  roleTags: string[]
  onChange: (roleTags: string[]) => void
  isDisabled?: boolean
  menuIsOpen?: boolean
  onMenuClose?: () => void
}

const selectStyles: StylesConfig<IOption, true> = {
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
  menuPortal: (css) => ({
    ...css,
    zIndex: 10,
  }),
  option: (css, state) => ({
    ...css,
    cursor: "pointer",
    color: "var(--chakra-colors-text-primary)",
    backgroundColor: state.isFocused ? "var(--chakra-colors-semantic-infoLight)" : undefined,
  }),
}

export const ProjectRoleSelect = ({
  roleTags,
  onChange,
  isDisabled,
  menuIsOpen,
  onMenuClose,
}: IProjectRoleSelectProps) => {
  const { t } = useTranslation()

  const groups = useMemo(() => {
    const toOptions = (values: string[], group: "general" | "professional") =>
      values.map((value) => {
        const label = t(`contact.contactTypes.${group}.${value}` as any) as string
        return { label, value: label }
      })

    return [
      {
        label: t("permitProject.people.roleGroups.general"),
        options: toOptions(Object.values(EGeneralContactType), "general"),
      },
      {
        label: t("permitProject.people.roleGroups.professional"),
        options: toOptions(Object.values(EProfessionalContactType), "professional"),
      },
    ]
  }, [t])

  const knownOptions = groups.flatMap((group) => group.options)
  const value = roleTags.map((tag) => knownOptions.find((option) => option.value === tag) ?? { label: tag, value: tag })

  return (
    <Select<IOption, true>
      isMulti
      isDisabled={isDisabled}
      autoFocus={menuIsOpen !== undefined}
      menuIsOpen={menuIsOpen}
      onMenuClose={onMenuClose}
      closeMenuOnSelect={false}
      options={groups}
      value={value}
      placeholder={t("permitProject.people.projectRole")}
      menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
      menuPosition="fixed"
      styles={selectStyles}
      onChange={(options) => onChange((options ?? []).map((option) => option.value))}
    />
  )
}
