import { Flex, Hide, Show } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { RemoveScroll } from "react-remove-scroll"
import { FloatingHelpDrawer } from "../../shared/floating-help-drawer"
import { FormSection } from "./form-section"
import { OverheatingToolNavBar } from "./nav-bar"
import { OverheatingNavLinks } from "./nav-bar/overheating-nav-links"
import { OverheatingToolSidebar } from "./sidebar"
import { SideBarDrawer } from "./sidebar/side-bar-drawer"

export const OverheatingToolStartScreen = observer(() => {
  const { t } = useTranslation() as any
  return (
    <RemoveScroll>
      <Flex
        direction="column"
        h="100vh"
        w="100vw"
        pos="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="modal"
        bg="white"
      >
        <OverheatingToolNavBar title={t("singleZoneCoolingHeatingTool.title")} NavLinks={<OverheatingNavLinks />} />
        <Flex flex={1} w="full" overflow="auto" position="relative">
          <Show above="lg">
            <Flex w={"sidebar.width"} boxShadow="md" borderRightWidth={1} borderColor="greys.grey02" overflow="auto">
              <OverheatingToolSidebar />
            </Flex>
          </Show>
          <Flex
            direction="column"
            flex={1}
            pos="sticky"
            overflow="auto"
            top={0}
            pl={{ base: 0, xl: 20 }}
            pt={10}
            pb={10}
            id="stepCodeScroll"
          >
            <Hide above="lg">
              <SideBarDrawer triggerProps={{ ml: 6, size: "md" }} />
            </Hide>

            <FloatingHelpDrawer top="24" zIndex={1} />
            <Flex direction="column" flex={1} w="full" px={6} py={3}>
              <FormSection />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </RemoveScroll>
  )
})
