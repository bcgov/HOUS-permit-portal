// src/hooks/useUppyS3.ts
import AwsS3 from "@uppy/aws-s3"
import Uppy from "@uppy/core"
import { useState } from "react"

// Define the type for the uploaded file
interface UploadedFile {
  name: string
  url: string
  key: string
}

interface UseUppyS3Props {
  onUploadSuccess?: (uploadedFile: UploadedFile) => void
  maxNumberOfFiles?: number
  autoProceed?: boolean
}

const useUppyS3 = ({ onUploadSuccess, maxNumberOfFiles = 1, autoProceed = false }: UseUppyS3Props = {}) => {
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: { maxNumberOfFiles },
      autoProceed,
      debug: process.env.NODE_ENV === "development",
    })
      .use(AwsS3, {
        endpoint: "/api",
      })
      .on("upload-success", (file, response) => {
        import.meta.env.DEV && console.log("Upload successful for file:", file.name)
        import.meta.env.DEV && console.log("Server response:", response)

        const fileKey = response.body.key
        const fileUrl = `https://${process.env.REACT_APP_S3_BUCKET}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${fileKey}`

        if (onUploadSuccess) {
          onUploadSuccess({ name: file.name, url: fileUrl, key: fileKey })
        }
      })
      .on("error", (error) => {
        console.error("Upload error:", error)
        // Optionally, you can handle errors here, e.g., show a notification
      })
  )
  return uppy
}

export default useUppyS3
