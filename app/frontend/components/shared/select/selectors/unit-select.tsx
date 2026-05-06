import { Button, Menu, Portal } from "@chakra-ui/react"
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
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
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
          css={{
            "& &:focus": { borderColor: "focus" },
          }}
        >
          {getUnitDisplayLabel(value)}
          <CaretDown />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item
              fontSize={"sm"}
              role={"option"}
              _focus={{ bg: value === undefined ? undefined : "semantic.infoLight" }}
              bg={value === undefined ? "semantic.info" : undefined}
              color={value === undefined ? "white" : "text.primary"}
              onSelect={() => onChange(undefined)}
              aria-selected={value === undefined}
              value="item-0"
            >
              {getUnitOptionLabel()}
            </Menu.Item>
            <Menu.Separator />
            {unitGroupEntries.map(([unitGroupKey, units], index) => (
              <React.Fragment key={unitGroupKey}>
                {units.map((unit) => (
                  <Menu.Item
                    key={unit}
                    fontSize={"sm"}
                    role={"option"}
                    _focus={{ bg: value === unit ? undefined : "semantic.infoLight" }}
                    bg={value === unit ? "semantic.info" : undefined}
                    color={value === unit ? "white" : "text.primary"}
                    onSelect={() => onChange(unit)}
                    aria-selected={value === unit}
                    value="item-1"
                  >
                    {getUnitOptionLabel(unit)}
                  </Menu.Item>
                ))}
                {unitGroupEntries.length - 1 !== index && <Menu.Separator />}
              </React.Fragment>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
})
