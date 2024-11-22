import { Box, Center, Flex } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { RemoveScroll } from "react-remove-scroll"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { StepCodeNavBar } from "../nav-bar"
import { Part3NavLinks } from "../nav-bar/part-3-nav-links"
import { FormSection } from "./form-section"
import { Sidebar } from "./sidebar"

export const Part3StepCodeForm = observer(function Part3StepCodeForm() {
  return (
    <RemoveScroll>
      <Flex direction="column" h="100vh" pos="fixed" top="0" left="0" right="0" bottom="0" zIndex="modal" bg="white">
        <StepCodeNavBar title={t("stepCode.part3.title")} NavLinks={<Part3NavLinks />} />
        <Suspense
          fallback={
            <Center p={50}>
              <SharedSpinner />
            </Center>
          }
        >
          <Flex flex={1} w="full" id="stepCodeScroll" overflow="auto">
            <Flex w={"sidebar.width"} boxShadow="md" borderRightWidth={1} borderColor="greys.grey02" overflow="auto">
              <Sidebar />
            </Flex>
            <Flex flex={1} pos="sticky" overflow="auto" top={0}>
              <FloatingHelpDrawer top="24" />
              <Box flex={1}>
                <FormSection />
              </Box>
            </Flex>
          </Flex>
        </Suspense>
      </Flex>
    </RemoveScroll>
  )
})
