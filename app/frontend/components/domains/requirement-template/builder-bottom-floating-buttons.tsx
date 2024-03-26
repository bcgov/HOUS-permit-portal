import { Button, Stack } from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { t } from "i18next"
import React, { useEffect, useState } from "react"
import { handleScrollToTop } from "../../../utils/utility-functions"

interface IProps {
  onToggleCallback: (isCollapsedAll: boolean) => void
  defaultAllCollapsed?: boolean
}

export function BuilderBottomFloatingButtons({ onToggleCallback, defaultAllCollapsed }: IProps) {
  const [allCollapsed, setAllCollapsed] = useState(!!defaultAllCollapsed)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    onToggleCallback(allCollapsed)
    setTimeout(() => setDisabled(false), 500) // prevent double-clicking by accident while expanding/collapsing
  }, [allCollapsed])

  return (
    <Stack spacing={4} position="fixed" bottom={6} right={10} alignItems={"flex-end"}>
      <Button variant="greyButton" leftIcon={<ArrowUp />} onClick={handleScrollToTop}>
        {t("requirementTemplate.edit.goToTop")}
      </Button>
      <Button variant="greyButton" onClick={onClickButton} isDisabled={disabled}>
        {allCollapsed ? t("ui.expandAll") : t("ui.collapseAll")}
      </Button>
    </Stack>
  )

  function onClickButton() {
    setDisabled(true)
    setAllCollapsed(!allCollapsed)
  }
}
