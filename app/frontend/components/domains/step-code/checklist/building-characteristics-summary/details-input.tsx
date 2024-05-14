import { Box, Button } from "@chakra-ui/react"
import { Plus, XCircle } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { i18nPrefix } from "./i18n-prefix"

export const DetailsInput = ({ fieldName, isRemovable, isLast, onAdd, onRemove }) => {
  return (
    <>
      <TextFormControl fieldName={fieldName} />
      {isRemovable && (
        <Box pos="absolute" bg="white" right={0} top={0} onClick={onRemove}>
          <XCircle size={20} color="var(--chakra-colors-greys-grey01)" weight="fill" />
        </Box>
      )}
      {isLast && (
        <Button size="sm" variant="link" leftIcon={<Plus />} onClick={onAdd}>
          {t(`${i18nPrefix}.addLine`)}
        </Button>
      )}
    </>
  )
}
