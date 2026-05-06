import { Button, Checkbox, Flex, Menu, Portal, Separator } from "@chakra-ui/react"
import { CaretDown, Funnel } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"

export const PermitApplicationFiltersMenu = observer(() => {
  const { t } = useTranslation()
  const { permitApplicationStore } = useMst()
  const { hasCollaboratorFilter, setHasCollaboratorFilter, searchPermitApplications, resetFilters } =
    permitApplicationStore
  const [isOpen, setIsOpen] = useState(false)

  const handleCheckboxChange = (newHasCollaborator: boolean) => {
    setHasCollaboratorFilter(newHasCollaborator)
    searchPermitApplications()
  }

  return (
    <Flex direction="column" position="relative" zIndex={1}>
      <Menu.Root open={open} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
        <Menu.Trigger asChild>
          <Button variant="outline" size="md">
            <Funnel />
            {t("ui.filter")}
            <CaretDown />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Flex direction="column">
                <Checkbox.Root
                  onCheckedChange={(e) => handleCheckboxChange(!!e.target.checked)}
                  mb={2}
                  checked={!!hasCollaboratorFilter}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Label>{t(`permitApplication.filterMenu.collaborating`)}</Checkbox.Label>
                </Checkbox.Root>
              </Flex>
              <Separator borderColor="greys.grey03" my={4} />
              <Button size="sm" variant="tertiary" onClick={() => resetFilters()}>
                {t("ui.reset")}
              </Button>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Flex>
  )
})
