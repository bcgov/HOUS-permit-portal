import { Box, Button } from "@chakra-ui/react"
import React, { useState } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css" // Include the quill.snow.css stylesheet

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
      <ReactQuill theme="snow" value={value} onChange={handleOnChange} />
      {isDirty && (
        <Button onClick={handleSave} mt={3}>
          Save
        </Button>
      )}
    </Box>
  )
}
