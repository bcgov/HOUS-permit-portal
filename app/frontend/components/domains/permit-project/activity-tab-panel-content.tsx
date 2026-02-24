import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { ClockCounterClockwise } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"

interface IProps {
  permitProject: IPermitProject
}

export const ActivityTabPanelContent = observer(({ permitProject }: IProps) => {
  const { t } = useTranslation()

  // [AUDITED VIBES TODO]:
  // 1. Fetch activities from API on mount using useEffect + store action
  //    - Call permitProjectStore.fetchProjectActivities(permitProject.id, { page, perPage })
  //    - Or create a dedicated activity store if preferred
  //    - See: app/frontend/stores/permit-project-store.ts for store patterns
  //
  // 2. Display activities in reverse chronological order using <ActivityFeedItem>
  //    - See: app/frontend/components/domains/permit-project/activity-feed-item.tsx
  //
  // 3. Add pagination using <Paginator> and <PerPageSelect> components
  //    - Reuse: app/frontend/components/shared/base/inputs/paginator.tsx
  //    - Reuse: app/frontend/components/shared/base/inputs/per-page-select.tsx
  //    - Default: 20 items per page
  //    - Sync page state with URL query params (?page=N)
  //
  // 4. Add filter dropdowns: permit application name, username, jurisdiction name
  //    - Reuse: app/frontend/components/shared/filters/checkbox-filter.tsx
  //    - See existing filters in: app/frontend/components/domains/permit-project/
  //      (jurisdiction-filter.tsx, status-filter.tsx, etc.)
  //
  // 5. Add sort select: most recent (default) / least recent
  //    - Reuse: app/frontend/components/shared/select/selectors/sort-select.tsx
  //    - No A-Z sort needed for MVP
  //
  // 6. Handle empty state: "No activity yet" with help text
  // 7. Handle loading state: <LoadingScreen />
  // 8. Handle error state with "Unable to load activity" message + retry button

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <Flex align="center" gap={4} mb={6}>
          <ClockCounterClockwise size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.activity.title")}
          </Heading>
        </Flex>

        {/* [AUDITED VIBES TODO]: Replace this empty state with real activity list + pagination */}
        <CustomMessageBox
          status={EFlashMessageStatus.info}
          description={t("permitProject.overview.noActivityYet")}
          mt={2}
        />

        <VStack align="stretch" spacing={4} mt={6}>
          <Text color="text.secondary" fontSize="sm">
            {t("permitProject.overview.activityHelpText")}
          </Text>
        </VStack>
      </Box>
    </Flex>
  )
})
