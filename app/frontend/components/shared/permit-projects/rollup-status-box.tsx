import { Flex, FlexProps, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { RollupStatusIcon } from "./rollup-status-icon"

interface IProps extends FlexProps {
  project: IPermitProject
}

export const RollupStatusBox = ({ project, ...rest }: IProps) => {
  const { t } = useTranslation()

  const { rollupStatus } = project
  return (
    <Flex align="center" justify="space-between" minW="220px" {...rest}>
      <Flex direction="column" align="flex-start">
        <Text color="text.secondary" mr={3}>
          {/* @ts-ignore */}
          {t(`permitProject.rollupStatus.${rollupStatus}`)}
        </Text>
        <Text fontSize="sm" color="greys.grey01">
          {project.rollupStatusDescription}
        </Text>
      </Flex>
      <RollupStatusIcon rollupStatus={rollupStatus} />
    </Flex>
  )
}
