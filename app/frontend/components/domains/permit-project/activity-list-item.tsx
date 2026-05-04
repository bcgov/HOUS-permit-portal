import { Flex, HStack, Text } from "@chakra-ui/react"
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
    <Flex align="center" justify="space-between" py={3} px={4} gap={4} minH={20}>
      <HStack align="center" spacing={1} flex={1} minW={0}>
        <Text>{description}</Text>
        {permitName && (
          <RouterLink to={permitApplicationId ? `/permit-applications/${permitApplicationId}/edit` : undefined}>
            {permitName}
          </RouterLink>
        )}
      </HStack>
      <Text variant="secondary">{format(createdAt, datefnsTableDateTimeFormat)}</Text>
    </Flex>
  )
})
