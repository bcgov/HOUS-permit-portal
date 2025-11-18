import { Box, Button } from "@chakra-ui/react"
import React, { useState } from "react"
import { Editor } from "./editor"

// Define your component's props and state as needed
interface IProps {
  initialValue: string
  onSave: () => void
  // You can include other props as necessary
}

const SavableEditor: React.FC<IProps> = ({ initialValue, onSave }) => {
  const [value, setValue] = useState<string>(initialValue)
  const [isDirty, setIsDirty] = useState<boolean>(false)

  const handleOnChange = (content: string) => {
    setValue(content)
    setIsDirty(true) // Mark the editor's content as modified
  }

  const handleSave = () => {
    onSave()
    setIsDirty(false)
  }

  return (
    <Box>
      <Editor htmlValue={value} onChange={handleOnChange} />
      {isDirty && (
        <Button onClick={handleSave} mt={3}>
          Save
        </Button>
      )}
    </Box>
  )
}
