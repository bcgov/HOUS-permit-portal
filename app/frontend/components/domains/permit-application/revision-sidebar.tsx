import { Box, Center, Flex, Hide, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMountStatus } from "../../../hooks/use-mount-status"
import { IPermitApplication } from "../../../models/permit-application"

interface IRevisionSideBarProps {
  permitApplication: IPermitApplication
}

export const RevisionSideBar = observer(({ permitApplication }: IRevisionSideBarProps) => {
  const { t } = useTranslation()
  const isMounted = useMountStatus()

  const [topHeight, setTopHeight] = useState<number>()

  useEffect(() => {
    const permitHeaderHeight = document.getElementById("permitHeader")?.offsetHeight
    setTopHeight(permitHeaderHeight)
  }, [isMounted, window.innerWidth, window.innerHeight])

  return (
    <Hide below="md">
      <Flex
        direction="column"
        boxShadow="md"
        borderRight="1px solid"
        borderRightColor="theme.yellow"
        width="var(--app-sidebar-width)"
        position="sticky"
        top={topHeight}
        bottom="0"
        height={`calc(100vh - ${topHeight}px)`}
        float="left"
        id="permit-revision-sidebar"
        bg="theme.yellowLight"
      >
        <Box overflowY="auto">
          <Center p={8} textAlign="center" borderBottom="1px solid" borderColor="border.light">
            <Text fontStyle="italic">{t("permitApplication.show.clickQuestion")}</Text>
          </Center>
        </Box>
      </Flex>
    </Hide>
  )
})
