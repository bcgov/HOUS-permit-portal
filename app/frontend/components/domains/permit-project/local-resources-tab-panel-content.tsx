import { Box, Flex, Heading, HStack, Text } from "@chakra-ui/react"
import { Folder } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { JurisdictionResourcesSection } from "../../shared/jurisdiction/jurisdiction-resources-section"

interface IProps {
  permitProject: IPermitProject
}

export const LocalResourcesTabPanelContent = observer(({ permitProject }: IProps) => {
  const { jurisdiction } = permitProject
  const { t } = useTranslation()

  const hasResources = jurisdiction?.resources && jurisdiction.resources.length > 0

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section">
        <HStack align="center" spacing={4} mb={6}>
          <Folder size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.localResources.title")}
          </Heading>
        </HStack>

        <Text color="text.secondary" mb={8}>
          {t("permitProject.localResources.description", { jurisdictionName: jurisdiction?.qualifiedName })}
        </Text>

        {hasResources ? (
          <JurisdictionResourcesSection jurisdiction={jurisdiction} showTitle={false} showDescription={false} />
        ) : (
          <CustomMessageBox
            status={EFlashMessageStatus.info}
            description={t("permitProject.localResources.empty", { jurisdictionName: jurisdiction?.qualifiedName })}
            mt={2}
          />
        )}
      </Box>
    </Flex>
  )
})
