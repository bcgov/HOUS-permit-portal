import { Box, Button, Text, Wrap, WrapItem } from "@chakra-ui/react"
import { Check } from "@phosphor-icons/react"
import React, { useId } from "react"

type FilterPillsProps = {
  label: string
  value: string | null
  options: string[]
  allLabel: string
  onChange: (value: string | null) => void
}

export function FilterPills({ label, value, options, allLabel, onChange }: FilterPillsProps) {
  const labelId = useId()

  return (
    <Box minW={0}>
      <Text id={labelId} fontWeight="bold" mb={3}>
        {label}
      </Text>
      <Wrap spacing={2} role="radiogroup" aria-labelledby={labelId}>
        <WrapItem>
          <FilterPill label={allLabel} isSelected={value == null} onClick={() => onChange(null)} />
        </WrapItem>
        {options.map((option) => (
          <WrapItem key={option}>
            <FilterPill label={option} isSelected={value === option} onClick={() => onChange(option)} />
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}

function FilterPill({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      role="radio"
      aria-checked={isSelected}
      variant={isSelected ? "primary" : "greyButton"}
      size="sm"
      borderRadius="full"
      leftIcon={isSelected ? <Check size={14} weight="bold" aria-hidden /> : undefined}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
