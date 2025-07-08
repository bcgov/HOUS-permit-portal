import { Box, Container, Heading, List, ListItem, Radio, RadioGroup, Stack, Text, VStack } from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { EStepCodeType } from "../../../../types/enums"
import { BackButton } from "../../../shared/buttons/back-button"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

export const StartCheckStepCodeRequirementsScreen = () => {
  const { t } = useTranslation()
  const [stepCodeTypeValue, setStepCodeTypeValue] = useState<EStepCodeType | null>(null)

  const stepCodeHrefs = {
    [EStepCodeType.part3StepCode]: "/part-3-step-code/start",
    // [EStepCodeType.part9StepCode]: "TODO",
  }

  return (
    <Container maxW="container.lg" py={16}>
      <VStack align="start" spacing={8}>
        <BackButton />
        <VStack align="start" spacing={4} w="100%">
          <Heading as="h1" size="lg">
            {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.title")}
          </Heading>
          <Text>{t("projectReadinessTools.startCheckStepCodeRequirementsScreen.description")}</Text>
          <Box pl={4}>
            <List spacing={3}>
              <ListItem>
                <Text>
                  <strong>
                    {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part3Buildings.title")}
                  </strong>
                  : {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part3Buildings.description")}
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  <strong>
                    {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part9Buildings.title")}
                  </strong>
                  : {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part9Buildings.description")}
                </Text>
              </ListItem>
              <ListItem>
                <Text>
                  <strong>
                    {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.otherBuildingTypes.title")}
                  </strong>
                  : {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.otherBuildingTypes.description")}
                </Text>
              </ListItem>
            </List>
          </Box>
          <Text pt={4}>{t("projectReadinessTools.startCheckStepCodeRequirementsScreen.question")}</Text>
          <RadioGroup
            onChange={(nextValue) => setStepCodeTypeValue(nextValue as EStepCodeType)}
            value={stepCodeTypeValue}
          >
            <Stack direction="column">
              <Radio value={EStepCodeType.part3StepCode}>
                {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part3")}
              </Radio>
              {/* <Radio value={EStepCodeType.part9StepCode}>
                {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.part9")}
              </Radio> */}
            </Stack>
          </RadioGroup>
          <Box pt={4}>
            <RouterLinkButton to={stepCodeHrefs[stepCodeTypeValue]} variant="primary" isDisabled={!stepCodeTypeValue}>
              {t("projectReadinessTools.startCheckStepCodeRequirementsScreen.next")}
            </RouterLinkButton>
          </Box>
        </VStack>
      </VStack>
    </Container>
  )
}
