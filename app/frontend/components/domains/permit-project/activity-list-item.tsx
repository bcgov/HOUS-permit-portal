import { Flex, Text, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IProjectAudit } from "../../../models/project-audit"
import { RouterLink } from "../../shared/navigation/router-link"

interface IActivityListItemProps {
  projectAudit: IProjectAudit
}

export const ActivityListItem = observer(({ projectAudit }: IActivityListItemProps) => {
  const { createdAt, description, permitName, permitApplicationId } = projectAudit

  return (
    <Flex align="flex-start" justify="space-between" p={3} gap={4} minH={20}>
      <VStack align="stretch" spacing={3} flex={1} minW={0}>
        <Text>{description}</Text>
        {permitName && (
          <RouterLink
            to={permitApplicationId ? `/permit-applications/${permitApplicationId}/edit` : undefined}
            fontSize="sm"
          >
            {permitName}
          </RouterLink>
        )}
      </VStack>
      <Text variant="secondary" fontSize="sm">
        {format(createdAt, datefnsTableDateTimeFormat)}
      </Text>
    </Flex>
  )
})
