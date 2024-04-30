import { Button, Container, Flex, Grid, GridItem, HStack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../../setup/root"
import { EExportFormat } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"

export const ExportTemplatesScreen = observer(function JurisdictionSubmissionInbox() {
  const { t } = useTranslation()
  const { templateVersionStore } = useMst()
  const { templateVersions, fetchTemplateVersions } = templateVersionStore
  const { currentJurisdiction, error } = useJurisdiction()

  useEffect(() => {
    fetchTemplateVersions()
  }, [])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction || !templateVersions) return <LoadingScreen />

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <Grid templateColumns="2fr 1fr" gap={4} border="1px solid" borderColor="border.light" borderRadius="md" p={4}>
        {templateVersions.map((v) => (
          <React.Fragment key={v.id}>
            <GridItem colSpan={1}>
              <Flex direction="column">
                <Text fontWeight="bold">{v.label}</Text>
                <Text>({v.status})</Text>
              </Flex>
            </GridItem>
            <GridItem colSpan={1}>
              <HStack spacing={2}>
                <Button
                  variant="primary"
                  onClick={() => v.downloadTemplateVersionExport(currentJurisdiction.id, EExportFormat.csv)}
                >
                  {t("requirementTemplate.export.downloadCsv")}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => v.downloadTemplateVersionExport(currentJurisdiction.id, EExportFormat.json)}
                >
                  {t("requirementTemplate.export.downloadJson")}
                </Button>
              </HStack>
            </GridItem>
          </React.Fragment>
        ))}
      </Grid>
    </Container>
  )
})
