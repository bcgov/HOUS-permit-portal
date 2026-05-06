import { Flex, HStack, Text, Tooltip } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IProjectAudit } from "../../../models/project-audit"
import { EPermitApplicationStatus } from "../../../types/enums"
import { RouterLink } from "../../shared/navigation/router-link"

interface IActivityListItemProps {
  projectAudit: IProjectAudit
  fromInbox?: boolean
}

export const ActivityListItem = observer(({ projectAudit, fromInbox = false }: IActivityListItemProps) => {
  const { createdAt, description, permitName, permitApplicationId, permitApplicationStatus } = projectAudit
  const { t } = useTranslation()
  const permitApplicationPath =
    permitApplicationId &&
    (fromInbox ? `/permit-applications/${permitApplicationId}` : `/permit-applications/${permitApplicationId}/edit`)
  const suppressPermitApplicationLink = fromInbox && permitApplicationStatus === EPermitApplicationStatus.newDraft

  return (
    <Flex align="center" justify="space-between" py={3} px={4} gap={4} minH={20}>
      <HStack align="center" spacing={1} flex={1} minW={0}>
        <Text>{description}</Text>
        {permitName &&
          (suppressPermitApplicationLink ? (
            <Tooltip label={t("permitProject.activity.unsubmittedPermitApplication")} hasArrow>
              <Text as="span" color="text.secondary" cursor="not-allowed">
                {permitName}
              </Text>
            </Tooltip>
          ) : (
            <RouterLink to={permitApplicationPath ?? undefined}>{permitName}</RouterLink>
          ))}
      </HStack>
      <Text variant="secondary">{format(createdAt, datefnsTableDateTimeFormat)}</Text>
    </Flex>
  )
})
