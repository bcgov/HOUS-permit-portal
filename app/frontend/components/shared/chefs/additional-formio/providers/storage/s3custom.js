import { requestPresignedUrl, uploadFileInChunks } from "../../../../../../utils/uploads"
/* tslint:disable */
const s3custom = function Provider(formio) {
  return {
    title: "s3custom",
    name: "s3custom",

    uploadFile: async (
      file,
      fileName,
      dir,
      progressCallback,
      url,
      options,
      fileKey,
      groupPermissions,
      groupId,
      abortCallback
    ) => {
      try {
        // Step 1: Request a pre-signed URL from your Shrine.rb backend
        const response = await requestPresignedUrl(file, fileName, url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const presignedData = await response.json()

        // Step 2: Upload the file directly to the storage service using the pre-signed URL
        // Dell ECS S3 does not support POST object, we need to use PUT and chunked transfer encoding
        await uploadFileInChunks(
          presignedData.signedUrls,
          presignedData.headers,
          file,
          progressCallback,
          10 * 1024 * 1024
        )
        //if there is an error along the way, it will throw and an error

        return {
          storage: "s3custom",
          filename: fileName,
          size: file.size,
          type: file.type,
          groupPermissions,
          groupId,
          id: presignedData?.key || presignedData?.id,
          metadata: {
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            content_disposition: presignedData?.headers?.["Content-Disposition"],
          },
        }
      } catch (error) {
        throw new Error("Failed to get pre-signed URL")
      }
    },
    deleteFile: (fileInfo, options) => {
      //assume we will not have public-read acl, use shrine to generate the request
      // console.log("s3 custom delete file", fileInfo)
    },
    downloadFile: async (fileInfo, options) => {
      try {
        // Assume we will not have public-read acl, use shrine to generate the request
        // console.log("s3 custom download files", fileInfo, options)
        // Return a file value, the file value must have a url
        const params = new URLSearchParams({
          id: fileInfo.id,
          model: fileInfo.model,
          model_id: fileInfo.modelId,
        })

        const response = await fetch(`/api/storage/s3/download?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseJson = await response.json()
        window.open(responseJson.url, "_blank")
        return responseJson // Resolving the promise implicitly by returning the value
      } catch (error) {
        throw new Error("Failed to get pre-signed URL") // Rejecting the promise implicitly by throwing an error
      }
    },
  }
}
s3custom.title = "s3custom"
export default s3custom
