import { Flex, Text } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { RouterLink } from "../../../shared/navigation/router-link"

interface IProps {
  to: string
}

export function ProjectInfoSidebarLink({ to }: IProps) {
  return (
    <RouterLink to={to}>
      <Flex
        align="center"
        pl={6}
        py={2}
        gap={2}
        borderLeftWidth={6}
        borderColor="transparent"
        textAlign="left"
        color="text.primary"
      >
        <Text>{t("stepCode.goToStepCodePage")}</Text>
      </Flex>
    </RouterLink>
  )
}
