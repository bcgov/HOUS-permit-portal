import { Box, Button, Container, HStack, Heading, Menu, Portal, Text } from "@chakra-ui/react"
import { BracketsCurly, Export, FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { EExportFormat } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { DigitalBuildingPermitsList } from "../../requirement-template/digital-building-permits-list"

export const ExportTemplatesScreen = observer(function ExportTemplatesScreen() {
  const { t } = useTranslation()
  const { currentJurisdiction, error: jurisdictionError } = useJurisdiction()

  if (jurisdictionError) return <ErrorScreen error={jurisdictionError} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" w="full" p={8} as="main">
      <Box w="full" px={8}>
        <Heading as="h1" size="2xl">
          {t("requirementTemplate.export.title")}
        </Heading>
        <Text color="text.secondary" my={6}>
          {t("digitalBuildingPermits.index.selectPermit")}
        </Text>

        <DigitalBuildingPermitsList
          renderButton={(templateVersion) => (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button aria-label="Options" variant="secondary" px={2}>
                  {t("ui.export")}
                  <Export />
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item
                      onSelect={() => templateVersion.downloadExport(currentJurisdiction.id, EExportFormat.csv)}
                      value="item-0"
                    >
                      <HStack gap={2} fontSize={"sm"}>
                        <FileCsv size={24} />
                        <Text as={"span"}>{t("requirementTemplate.export.downloadCustomizationCsv")}</Text>
                      </HStack>
                    </Menu.Item>
                    <Menu.Item
                      onSelect={() => templateVersion.downloadExport(currentJurisdiction.id, EExportFormat.json)}
                      value="item-1"
                    >
                      <HStack gap={2} fontSize={"sm"}>
                        <BracketsCurly size={24} />
                        <Text as={"span"}>{t("requirementTemplate.export.downloadCustomizationJson")}</Text>
                      </HStack>
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}
        />
      </Box>
    </Container>
  )
})
