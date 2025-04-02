import { Tag } from "@chakra-ui/react"
import { FileLock, Lock } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EVisibility } from "../../types/enums"
import { toCamelCase } from "../../utils/utility-functions"

interface IVisibilityTagProps {
  visibility?: EVisibility
}

export const VisibilityTag = ({ visibility = EVisibility.any }: IVisibilityTagProps) => {
  const { t } = useTranslation()

  const backgroundColors = {
    [EVisibility.live]: "semantic.infoLight",
    [EVisibility.earlyAccess]: "semantic.warningLight",
  }

  const borderColors = {
    [EVisibility.live]: "semantic.info",
    [EVisibility.earlyAccess]: "semantic.warning",
  }

  const icons = {
    [EVisibility.live]: <Lock size={15} />,
    [EVisibility.earlyAccess]: <FileLock size={15} />,
  }

  if (visibility === EVisibility.any) return <></>

  return (
    <Tag
      p={1}
      px={2}
      backgroundColor={backgroundColors[visibility]}
      border="1px solid"
      borderColor={borderColors[visibility]}
      gap={1}
    >
      {icons[visibility]}
      {/* @ts-ignore */}
      {t(`requirementsLibrary.visibility.${toCamelCase(visibility)}`)}
    </Tag>
  )
}
