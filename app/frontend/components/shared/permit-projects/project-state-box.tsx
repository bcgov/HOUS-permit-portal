import { Flex, FlexProps, Text } from "@chakra-ui/react"
import React from "react"
import { IPermitProject } from "../../../models/permit-project"
import { ProjectStateTag } from "./project-state-tag"

interface IProps extends FlexProps {
  project: IPermitProject
}

export const ProjectStateBox = ({ project, ...rest }: IProps) => {
  return (
    <Flex align="center" justify="space-between" minW="220px" {...rest}>
      <Flex direction="column" align="flex-start" gap={1}>
        <ProjectStateTag state={project.state} />
        <Text fontSize="sm" color="greys.grey01">
          {project.applicationsSummary}
        </Text>
      </Flex>
    </Flex>
  )
}
