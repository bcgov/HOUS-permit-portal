import { Flex, FlexProps, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { PhaseIcon } from "./phase-icon"

interface IProps extends FlexProps {
  project: IPermitProject
}

export const PhaseBox = ({ project, ...rest }: IProps) => {
  const { t } = useTranslation()

  const { phase } = project

  return (
    <Flex align="center" justify="space-between" minW="220px" {...rest}>
      <Flex direction="column" align="flex-start">
        <Text color="text.secondary" mr={3}>
          {/* @ts-ignore */}
          {t(`permitProject.phase.${phase}`)}
        </Text>
        <Text fontSize="sm" color="greys.grey01">
          {project.phaseDescription}
        </Text>
      </Flex>
      <PhaseIcon phase={phase} />
    </Flex>
  )
}
