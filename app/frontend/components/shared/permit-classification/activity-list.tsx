import { Box, Flex, FlexProps, Heading, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IActivity } from "../../../models/permit-classification"
import { IOption } from "../../../types/types"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { SharedSpinner } from "../base/shared-spinner"

interface IPermitTypeRadioSelect extends FlexProps {
  fetchOptions: () => Promise<IOption<IActivity>[]>
  isLoading: boolean
  permitTypeId?: string
}

export const ActivityList = ({ fetchOptions, isLoading, permitTypeId, ...rest }: IPermitTypeRadioSelect) => {
  const [activityOptions, setActivityOptions] = useState<IOption<IActivity>[]>([])

  useEffect(() => {
    ;(async () => {
      setActivityOptions(await fetchOptions())
    })()
  }, [permitTypeId])

  if (isLoading) return <SharedSpinner />

  return (
    <Flex direction="column" gap={4}>
      {activityOptions.map((option) => (
        <ActivityBox key={option.value.id} activity={option.value} />
      ))}
    </Flex>
  )
}

interface IActivityBoxProps {
  activity: IActivity
}

const ActivityBox = ({ activity }: IActivityBoxProps) => {
  const { t } = useTranslation()

  return (
    <Box
      borderRadius="lg"
      p={6}
      border={activity.enabled ? "1px solid" : "none"}
      borderColor="border.light"
      w="fit-content"
      minW={{ base: "full", sm: "473px" }}
      bg={activity.enabled ? "white" : "greys.grey03"}
    >
      <Flex gap={8}>
        <Flex direction="column" gap={3} flex={1}>
          <Heading fontSize="lg" color={activity.enabled ? "text.link" : "greys.grey90"}>
            {activity.name}
          </Heading>
          <Flex gap={3} justify="space-between" className="between">
            <Box flex={1}>
              <Text>{activity.description}</Text>
            </Box>
            <Box w="fit-content" className="aroundLink">
              {activity.enabled ? (
                <RouterLinkButton
                  variant="link"
                  rightIcon={<CaretRight size={24} />}
                  to={"#"}
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {t("ui.select")}
                </RouterLinkButton>
              ) : (
                <Text color="greys.grey01" fontWeight="bold" fontSize="lg" noOfLines={{ base: 2, md: 1 }}>
                  {t("ui.notAvailable")}
                </Text>
              )}
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
