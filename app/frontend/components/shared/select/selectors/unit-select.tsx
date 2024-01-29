import { Button, Menu, MenuButton, MenuDivider, MenuItem, MenuList } from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { getUnitDisplayLabel, getUnitOptionLabel, unitGroups } from "../../../../constants"
import { ENumberUnit } from "../../../../types/enums"

interface IProps {
  value: ENumberUnit
  onChange: (value: ENumberUnit) => void
}

export const UnitSelect = observer(function UnitSelect({ value, onChange }: IProps) {
  const unitGroupEntries = Object.entries(unitGroups)
  return (
    <Menu>
      <MenuButton
        as={Button}
        aria-haspopup={"listbox"}
        fontSize={"sm"}
        lineHeight="27px"
        borderRadius="sm"
        px={3}
        py={"0.375rem"}
        _disabled={{
          bg: "greys.grey10",
        }}
        border={"1px solid"}
        borderColor="border.light"
        bg={"white"}
        _hover={{ borderColor: "border.base" }}
        sx={{
          "&:focus": { borderColor: "focus" },
        }}
        rightIcon={<CaretDown />}
      >
        {getUnitDisplayLabel(value)}
      </MenuButton>
      <MenuList aria-multiselectable={false} aria-label={"Unit options"} role={"listbox"} w={"200px"}>
        <MenuItem
          fontSize={"sm"}
          role={"option"}
          _focus={{ bg: value === undefined ? undefined : "semantic.infoLight" }}
          bg={value === undefined ? "semantic.info" : undefined}
          color={value === undefined ? "white" : "text.primary"}
          onClick={() => onChange(undefined)}
          aria-selected={value === undefined}
        >
          {getUnitOptionLabel()}
        </MenuItem>
        <MenuDivider />
        {unitGroupEntries.map(([unitGroupKey, units], index) => (
          <React.Fragment key={unitGroupKey}>
            {units.map((unit) => (
              <MenuItem
                key={unit}
                fontSize={"sm"}
                role={"option"}
                _focus={{ bg: value === unit ? undefined : "semantic.infoLight" }}
                bg={value === unit ? "semantic.info" : undefined}
                color={value === unit ? "white" : "text.primary"}
                onClick={() => onChange(unit)}
                aria-selected={value === unit}
              >
                {getUnitOptionLabel(unit)}
              </MenuItem>
            ))}
            {unitGroupEntries.length - 1 !== index && <MenuDivider />}
          </React.Fragment>
        ))}
      </MenuList>
    </Menu>
  )
})
