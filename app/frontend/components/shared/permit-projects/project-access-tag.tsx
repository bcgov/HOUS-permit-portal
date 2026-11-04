import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EProjectAccess } from "../../../types/enums"

const accessBgMap: Record<EProjectAccess, string> = {
  [EProjectAccess.standard]: "semantic.infoLight",
  [EProjectAccess.expanded]: "theme.green.100",
  [EProjectAccess.full]: "semantic.warningLight",
}

const accessBorderColorMap: Record<EProjectAccess, string> = {
  [EProjectAccess.standard]: "focus",
  [EProjectAccess.expanded]: "semantic.success",
  [EProjectAccess.full]: "semantic.warning",
}

interface IProjectAccessTagProps extends TagProps {
  access: EProjectAccess
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
        w="fit-content"
        maxW="fit-content"
        textAlign="center"
        {...rest}
      >
        {t(`permitProject.people.access.${access}`)}
      </Tag>
    )
  }
)
