import { Button, HStack } from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { t } from "i18next"
import React, { useCallback } from "react"
import { debounce, handleScrollToTop } from "../../../utils/utility-functions"

interface IProps {
  isCollapsedAll: boolean
  setIsCollapsedAll: (boolean: boolean) => void
  renderSaveButton?: () => JSX.Element
}

export function BuilderBottomFloatingButtons({ isCollapsedAll, setIsCollapsedAll, renderSaveButton }: IProps) {
  const debouncedHandleClick = useCallback(debounce(onClickButton, 250), [onClickButton])

  return (
    <HStack
      spacing={4}
      justify="space-between"
      w="full"
      bg="greys.grey03"
      position="sticky"
      bottom={0}
      px={4}
      py={2.5}
      zIndex={10}
      borderWidth={1}
      borderColor="border.light"
      shadow="drop"
    >
      {renderSaveButton && renderSaveButton()}
      <HStack ml="auto">
        <Button variant="greyButton" leftIcon={<ArrowUp />} onClick={handleScrollToTop}>
          {t("requirementTemplate.edit.goToTop")}
        </Button>
        <Button variant="greyButton" onClick={debouncedHandleClick}>
          {isCollapsedAll ? t("ui.expandAll") : t("ui.collapseAll")}
        </Button>
      </HStack>
    </HStack>
  )

  function onClickButton() {
    setIsCollapsedAll(!isCollapsedAll)
  }
}
