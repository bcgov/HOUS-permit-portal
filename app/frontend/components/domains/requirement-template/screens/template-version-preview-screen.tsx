import { Box, Flex, HStack, Heading, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useRef, useState } from "react"
import { useTemplateVersion } from "../../../../hooks/resources/use-template-version"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { BackButton } from "../../../shared/buttons/back-button"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { PermitApplicationStatusTag } from "../../../shared/permit-applications/permit-application-status-tag"
import { RequirementForm } from "../../../shared/permit-applications/requirement-form"
import { ChecklistSideBar } from "../../permit-application/checklist-sidebar"

export const TemplateVersionPreviewScreen = observer(() => {
  const { permitApplicationStore } = useMst()
  const { templateVersion, error } = useTemplateVersion()

  const permitHeaderRef = useRef<HTMLDivElement>(null)
  const formRef = useRef(null)

  const [completedBlocks, setCompletedBlocks] = useState({})

  if (error) return <ErrorScreen error={error} />
  if (!templateVersion?.isFullyLoaded) return <LoadingScreen />

  const permitHeaderHeight = permitHeaderRef.current?.offsetHeight ?? 0
  const ephemeralPermitApplication = permitApplicationStore.getEphemeralPermitApplication(templateVersion)

  return (
    <Box as="main" id="submitter-view-permit">
      <Flex id="permitHeader" direction="column" position="sticky" top={0} zIndex={12} ref={permitHeaderRef} h="66px">
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
            <PermitApplicationStatusTag status={ephemeralPermitApplication.status} />

            <Flex direction="column" w="full">
              <Heading fontSize="xl">{templateVersion.nickname ?? templateVersion.label}</Heading>
              <Text noOfLines={1}>{templateVersion.label}</Text>
            </Flex>
          </HStack>
          <HStack flexDir={{ base: "column", md: "row" }} gap={4}>
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
            isEditing
          />
        </Flex>
      </Box>
    </Box>
  )
})
