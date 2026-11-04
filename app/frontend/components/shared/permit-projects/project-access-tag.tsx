import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export type TProjectAccessLevel = "standard" | "expanded" | "full"

const accessBgMap: Record<TProjectAccessLevel, string> = {
  standard: "semantic.infoLight",
  expanded: "theme.green.100",
  full: "semantic.warningLight",
}

const accessBorderColorMap: Record<TProjectAccessLevel, string> = {
  standard: "focus",
  expanded: "semantic.success",
  full: "semantic.warning",
}

interface IProjectAccessTagProps extends TagProps {
  access: TProjectAccessLevel
}

export const ProjectAccessTag = React.forwardRef<HTMLSpanElement, IProjectAccessTagProps>(
  ({ access, ...rest }, ref) => {
    const { t } = useTranslation()

    return (
      <Tag
        ref={ref}
        p={1}
        bg={accessBgMap[access]}
        color="text.primary"
        fontWeight="medium"
        border="1px solid"
        borderColor={accessBorderColorMap[access]}
        minW="fit-content"
        textAlign="center"
        {...rest}
      >
        {t(`permitProject.people.access.${access}`)}
      </Tag>
    )
  }
)
