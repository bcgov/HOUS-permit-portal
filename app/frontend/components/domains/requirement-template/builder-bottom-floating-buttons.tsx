import { Button, Stack } from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"

interface IProps {
  onScrollToTop: () => void
  onCollapseAll: () => void
}

export function BuilderBottomFloatingButtons({ onScrollToTop, onCollapseAll }: IProps) {
  return (
    <Stack spacing={4} position="fixed" bottom={6} right={10} alignItems={"flex-end"}>
      <Button variant="greyButton" leftIcon={<ArrowUp />} onClick={onScrollToTop}>
        {t("requirementTemplate.edit.goToTop")}
      </Button>
      <Button variant="greyButton" onClick={onCollapseAll}>
        {t("ui.collapseAll")}
      </Button>
    </Stack>
  )
}
