import { Box, Flex, HStack, Heading, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useRequirementTemplate } from "../../../../../hooks/resources/use-requirement-template"
import { useMst } from "../../../../../setup/root"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { BackButton } from "../../../../shared/buttons/back-button"
import { FloatingHelpDrawer } from "../../../../shared/floating-help-drawer"
import { BrowserSearchPrompt } from "../../../../shared/permit-applications/browser-search-prompt"
import { PermitApplicationStatusTag } from "../../../../shared/permit-applications/permit-application-status-tag"
import { RequirementForm } from "../../../../shared/permit-applications/requirement-form"
import { ChecklistSideBar } from "../../../permit-application/checklist-sidebar"

interface IEarlyAccessRequirementTemplateScreenProps {}

export const EarlyAccessRequirementTemplateScreen = observer(({}: IEarlyAccessRequirementTemplateScreenProps) => {
  const { t } = useTranslation()

  const { userStore, permitApplicationStore } = useMst()
  const { getEphemeralPermitApplication } = permitApplicationStore
  const currentUser = userStore.currentUser

  const { requirementTemplate, error } = useRequirementTemplate()

  const permitHeaderRef = useRef()
  const formRef = useRef(null)

  // @ts-ignore
  const permitHeaderHeight = permitHeaderRef?.current?.offsetHeight ?? 0

  const [completedBlocks, setCompletedBlocks] = useState({})

  if (error) return <ErrorScreen error={error} />
  if (!currentUser || !requirementTemplate?.isFullyLoaded) return <LoadingScreen />

  const ephemeralPermitApplication = getEphemeralPermitApplication(requirementTemplate)

  return (
    <Box as="main" id="submitter-view-permit">
      <Flex id="permitHeader" direction="column" position="sticky" top={0} zIndex={12} ref={permitHeaderRef}>
        <Flex
          w="full"
          px={6}
          py={3}
          bg="theme.blue"
          justify="space-between"
          color="greys.white"
          position="sticky"
          top="0"
          zIndex={12}
          flexDirection={{ base: "column", md: "row" }}
        >
          <HStack gap={4} flex={1}>
            <PermitApplicationStatusTag permitApplication={ephemeralPermitApplication} />

            <Flex direction="column" w="full">
              <Heading fontSize="xl">{requirementTemplate.nickname}</Heading>
              <Text noOfLines={1}>{requirementTemplate.label}</Text>
            </Flex>
          </HStack>
          <HStack
            flexDir={{
              base: "column",
              md: "row",
            }}
            gap={4}
          >
            <BrowserSearchPrompt />
            <BackButton variant="secondaryInverse" />
          </HStack>
        </Flex>
        <FloatingHelpDrawer top={permitHeaderHeight + 20} position="absolute" />
      </Flex>
      <Box id="sidebar-and-form-container" sx={{ "&:after": { content: `""`, display: "block", clear: "both" } }}>
        <ChecklistSideBar permitApplication={ephemeralPermitApplication} completedBlocks={completedBlocks} />

        <Flex flex={1} direction="column" pt={8} position={"relative"} id="permitApplicationFieldsContainer">
          <RequirementForm
            formRef={formRef}
            permitApplication={ephemeralPermitApplication}
            onCompletedBlocksChange={setCompletedBlocks}
            showHelpButton
            isEditing={true}
          />
        </Flex>
      </Box>
    </Box>
  )
})
