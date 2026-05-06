import { RadioGroup } from "@/components/ui/radio"
import { Box, Button, Container, Heading, List, Stack, Text, VStack } from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { EStepCodeType } from "../../../../types/enums"
import { BackButton } from "../../../shared/buttons/back-button"
import { defaultSectionCompletionStatus } from "../../step-code/part-3/sidebar/nav-sections"

export const SelectStepCodeRequirementsScreen = () => {
  const { t } = useTranslation()
  const { stepCodeStore } = useMst()
  const { createPart9StepCode, createPart3StepCode } = stepCodeStore
  const navigate = useNavigate()
  const [stepCodeTypeValue, setStepCodeTypeValue] = useState<EStepCodeType | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleNextClick = async () => {
    if (!stepCodeTypeValue) return

    setIsCreating(true)
    let result

    if (stepCodeTypeValue === EStepCodeType.part3StepCode) {
      result = await createPart3StepCode({
        checklistAttributes: { sectionCompletionStatus: defaultSectionCompletionStatus },
      })
      if (result?.ok) {
        navigate(`/part-3-step-code/${result.data.id}/start`)
      } else {
        setIsCreating(false)
      }
    } else if (stepCodeTypeValue === EStepCodeType.part9StepCode) {
      navigate(`/part-9-step-code/new`)
    }
  }

  return (
    <Container maxW="container.lg" py={16}>
      <VStack align="start" gap={8}>
        <BackButton />
        <VStack align="start" gap={4} w="100%">
          <Heading as="h1" size="lg">
            {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.title")}
          </Heading>
          <Text>{t("projectReadinessTools.startCheckStepCodeRequirementsScreen.description")}</Text>
          <Box pl={4}>
            <List.Root gap={3}>
              <List.Item>
                <Text>
                  <strong>
                    {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part3Buildings.title")}
                  </strong>
                  : {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part3Buildings.description")}
                </Text>
              </List.Item>
              <List.Item>
                <Text>
                  <strong>
                    {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part9Buildings.title")}
                  </strong>
                  : {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part9Buildings.description")}
                </Text>
              </List.Item>
              <List.Item>
                <Text>
                  <strong>
                    {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.otherBuildingTypes.title")}
                  </strong>
                  : {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.otherBuildingTypes.description")}
                </Text>
              </List.Item>
            </List.Root>
          </Box>
          <Text pt={4}>{t("projectReadinessTools.startCheckStepCodeRequirementsScreen.question")}</Text>
          <RadioGroup.Root
            onValueChange={(nextValue) => setStepCodeTypeValue(nextValue as EStepCodeType)}
            value={stepCodeTypeValue}
          >
            <Stack direction="column">
              <RadioGroup.Item value={EStepCodeType.part3StepCode}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>
                  {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part3")}
                </RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value={EStepCodeType.part9StepCode}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>
                  {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part9")}
                </RadioGroup.ItemText>
              </RadioGroup.Item>
            </Stack>
          </RadioGroup.Root>
          <Box pt={4}>
            <Button
              onClick={handleNextClick}
              variant="primary"
              disabled={!stepCodeTypeValue || isCreating}
              loading={isCreating}
            >
              {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.next")}
            </Button>
          </Box>
        </VStack>
      </VStack>
    </Container>
  )
}
