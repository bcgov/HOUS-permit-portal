import { Button, Checkbox, CheckboxGroup, Divider, Flex, Menu, MenuButton, MenuList } from "@chakra-ui/react"
import { CaretDown, Funnel } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"

interface ISearchSortProps {
  i18nPrefix: string
  sortFields: string[]
}

export const PermitApplicationFiltersMenu: React.FC<ISearchSortProps> = observer(
  ({ i18nPrefix, sortFields }: ISearchSortProps) => {
    const { t } = useTranslation()
    const { permitApplicationStore } = useMst()
    const { hasCollaboratorFilter, setHasCollaboratorFilter, searchPermitApplications, resetFilters } =
      permitApplicationStore
    const [isOpen, setIsOpen] = useState(false)

    const handleCheckboxChange = (newHasCollaborator: boolean) => {
      setHasCollaboratorFilter(newHasCollaborator)
      searchPermitApplications()
    }

    const handleClear = () => {
      resetFilters()
      searchPermitApplications()
    }

    const toggleMenu = () => {
      setIsOpen(!isOpen)
    }

    return (
      <Flex direction="column" position="relative" zIndex={1}>
        <Menu isOpen={isOpen}>
          <MenuButton
            as={Button}
            variant="outline"
            size="md"
            leftIcon={<Funnel />}
            rightIcon={<CaretDown />}
            onClick={toggleMenu}
          >
            {t("ui.filter")}
          </MenuButton>
          <MenuList
            bg="greys.white"
            border="1px solid"
            borderColor="border.light"
            borderRadius="sm"
            boxShadow="md"
            p={4}
            zIndex={1}
          >
            <CheckboxGroup>
              <Flex direction="column">
                {hasCollaboratorFilter?.toString()}
                <Checkbox
                  checked={!!hasCollaboratorFilter}
                  onChange={(e) => handleCheckboxChange(!!e.target.checked)}
                  mb={2}
                >
                  {t(`${i18nPrefix}.filterMenu.collaborating`)}
                </Checkbox>
              </Flex>
            </CheckboxGroup>
            <Divider borderColor="greys.grey03" my={4} />
            <Button size="sm" variant="tertiary" onClick={handleClear}>
              {t("ui.reset")}
            </Button>
          </MenuList>
        </Menu>
      </Flex>
    )
  }
)
