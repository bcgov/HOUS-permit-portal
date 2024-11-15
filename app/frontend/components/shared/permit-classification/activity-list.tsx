import { Box, Button, Flex, FlexProps, Heading, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IActivity } from "../../../models/permit-classification"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { SharedSpinner } from "../base/shared-spinner"
import SandboxHeader from "../sandbox/sandbox-header"

interface IPermitTypeRadioSelect extends FlexProps {
  fetchOptions: () => Promise<IOption<IActivity>[]>
  dependencyArray?: any[]
}

export const ActivityList = observer(({ fetchOptions, dependencyArray, ...rest }: IPermitTypeRadioSelect) => {
  const [activityOptions, setActivityOptions] = useState<IOption<IActivity>[]>([])

  useEffect(() => {
    ;(async () => {
      setActivityOptions(await fetchOptions())
    })()
  }, dependencyArray)

  const { permitClassificationStore } = useMst()
  const { isActivityLoading } = permitClassificationStore

  if (isActivityLoading) return <SharedSpinner />

  return (
    <Flex direction="column" gap={4}>
      {activityOptions.map((option) => (
        <ActivityBox key={option.value.id} activity={option.value} />
      ))}
    </Flex>
  )
})

interface IActivityBoxProps {
  activity: IActivity
}

const ActivityBox = observer(({ activity }: IActivityBoxProps) => {
  const { t } = useTranslation()

  const { setValue, formState, watch } = useFormContext()

  const siteWatch = watch("site")

  return (
    <Box
      borderRadius="lg"
      p={8}
      border={activity.enabled ? "1px solid" : "none"}
      borderColor="border.light"
      maxW={{ base: "100%", sm: "473px" }}
      bg={activity.enabled ? "white" : "greys.grey03"}
      position="relative"
    >
      <SandboxHeader />
      <Flex gap={8}>
        <Flex direction="column" gap={3} flex={1}>
          <Heading as="h3" fontSize="lg" color={activity.enabled ? "text.link" : "greys.grey90"}>
            {activity.name}
          </Heading>
          <Flex gap={3} justify="space-between" className="between">
            <Box flex={1}>
              <Text>{activity.description}</Text>
            </Box>
            <Box w="fit-content" className="aroundLink">
              {activity.enabled ? (
                <Button
                  type="submit"
                  disabled={!siteWatch}
                  isDisabled={!siteWatch}
                  onClick={() => setValue("activityId", activity.id)}
                  variant="link"
                  rightIcon={<CaretRight size={24} />}
                  fontWeight="bold"
                  fontSize="lg"
                  isLoading={formState.isSubmitting}
                >
                  {t("ui.select")}
                </Button>
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
})
