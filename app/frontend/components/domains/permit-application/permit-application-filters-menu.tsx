// Filename: PermitApplicationFiltersMenu.tsx

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  Menu,
  MenuButton,
  MenuList,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Funnel, CaretDown } from "@phosphor-icons/react"
import { ISearch } from "../../../lib/create-search-model";
import { EPermitApplicationSortCollaboratingFields } from "../../../types/enums";

interface ISearchSortProps {
  searchModel: ISearch;
  i18nPrefix: string;
  sortFields: string[];
}

export const PermitApplicationFiltersMenu: React.FC<ISearchSortProps> = ({
  searchModel,
  i18nPrefix,
  sortFields,
}: ISearchSortProps) => {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const options = Object.values(EPermitApplicationSortCollaboratingFields); 
  const [isOpen, setIsOpen] = useState(false)
  const { applySort, fetchData } = searchModel

  const handleCheckboxChange = (newSelectedOptions: string[]) => {
    setSelectedOptions(newSelectedOptions);
    applySort({
      hasCollaborator: newSelectedOptions,
    })
    fetchData()
  };

  const handleClear = () => {
    setSelectedOptions([]);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Flex direction="column" position="relative" zIndex={1}>
      <Menu isOpen={isOpen}>
        <MenuButton as={Button} variant="outline" size="md" leftIcon={<Funnel />} rightIcon={<CaretDown />} onClick={toggleMenu}>
          {t("ui.filter")}
        </MenuButton>
        <MenuList
          bg="greys.white"
          border="2px solid"
          borderColor="border.base"
          borderRadius="sm"
          boxShadow="md"
          p={4}
          zIndex={1}
        >
          <CheckboxGroup
            value={selectedOptions}
            onChange={handleCheckboxChange}
          >
            <Flex direction="column">
              {options.map((option) => (
                <Checkbox key={option} value={option} mb={2}>
                  {t(`${i18nPrefix}.filterMenu.${option}`)}
                </Checkbox>
              ))}
            </Flex>
          </CheckboxGroup>
          <Divider borderColor="greys.grey03" my={4} />
          <Button size="sm" variant="tertiary" onClick={handleClear}>
            {t("ui.reset")}
          </Button>
        </MenuList>
      </Menu>
    </Flex>
  );
};
