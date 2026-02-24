import { Box, Flex, Link, Text } from "@chakra-ui/react"
import React from "react"
import { Link as RouterLink } from "react-router-dom"

// [AUDITED VIBES TODO]: Replace this with a proper interface matching
// ProjectActivityBlueprint's :base view once the backend is wired up.
// Move to app/frontend/types/types.ts when finalized.
export interface IProjectActivity {
  id: string
  description: string
  timestamp: string
  userName: string
  permitName: string | null
  permitApplicationId: string | null
  permitApplicationNumber: string | null
  requirementBlockId: string | null
}

interface IProps {
  activity: IProjectActivity
}

export const ActivityFeedItem = ({ activity }: IProps) => {
  // [AUDITED VIBES TODO]:
  // 1. Display activity description text (activity.description)
  //    e.g. "Sarah Jones assigned to Structural Requirements"
  //
  // 2. Display timestamp formatted as "Jul 24, 2025 11:02 AM"
  //    - Use date-fns or Intl.DateTimeFormat for formatting
  //    - The raw timestamp comes from audit.created_at
  //
  // 3. Display optional permit link (clickable, navigates to permit detail)
  //    - Only show if activity.permitApplicationId is present
  //    - Link text: activity.permitName or activity.permitApplicationNumber
  //    - Link target: /permit-applications/{permitApplicationId}/edit
  //
  // 4. Bonus: Deep-link to specific requirement block within the permit
  //    - If activity.requirementBlockId is present, append it as a hash
  //      or query param to the permit link

  return (
    <Box py={3} borderBottom="1px" borderColor="border.light">
      <Flex direction="column" gap={1}>
        <Text fontSize="sm">{activity.description}</Text>
        <Text fontSize="xs" color="text.secondary">
          {activity.timestamp}
        </Text>
        {activity.permitApplicationId && activity.permitName && (
          <Link
            as={RouterLink}
            to={`/permit-applications/${activity.permitApplicationId}/edit`}
            fontSize="xs"
            color="text.link"
          >
            {activity.permitName}
          </Link>
        )}
      </Flex>
    </Box>
  )
}
