import { Button, Stack } from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { t } from "i18next"
import React, { useCallback } from "react"
import { debounce, handleScrollToTop } from "../../../utils/utility-functions"

interface IProps {
  isCollapsedAll: boolean
  setIsCollapsedAll: (boolean: boolean) => void
}

export function BuilderBottomFloatingButtons({ isCollapsedAll, setIsCollapsedAll }: IProps) {
  const debouncedHandleClick = useCallback(debounce(onClickButton, 250), [onClickButton])

  return (
    <Stack spacing={4} position="fixed" bottom={6} right={6} alignItems={"flex-end"}>
      <Button variant="greyButton" leftIcon={<ArrowUp />} onClick={handleScrollToTop}>
        {t("requirementTemplate.edit.goToTop")}
      </Button>
      <Button variant="greyButton" onClick={debouncedHandleClick}>
        {isCollapsedAll ? t("ui.expandAll") : t("ui.collapseAll")}
      </Button>
    </Stack>
  )

  function onClickButton() {
    setIsCollapsedAll(!isCollapsedAll)
  }
}
