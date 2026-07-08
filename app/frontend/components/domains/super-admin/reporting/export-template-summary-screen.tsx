import { Box, Button, Container, HStack, Heading, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { Export, FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { DigitalBuildingPermitsList } from "../../requirement-template/digital-building-permits-list"

export const ExportTemplateSummaryScreen = observer(function ExportTemplateSummaryScreen() {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" w="full" p={8} as="main">
      <Box w="full" px={8}>
        <Heading as="h1" size="2xl">
          {t("reporting.templateSummary.title")}
        </Heading>
        <Text color="text.secondary" my={6}>
          {t("digitalBuildingPermits.index.selectPermit")}
        </Text>

        <DigitalBuildingPermitsList
          renderButton={(templateVersion) => (
            <Menu>
              <MenuButton as={Button} aria-label="Options" variant="secondary" rightIcon={<Export />} px={2}>
                {t("ui.export")}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => templateVersion.downloadRequirementSummary()}>
                  <HStack spacing={2} fontSize={"sm"}>
                    <FileCsv size={24} />
                    <Text as={"span"}>{t("requirementTemplate.export.downloadSummaryCsv")}</Text>
                  </HStack>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        />
      </Box>
    </Container>
  )
})
