import { requestPresignedUrl, uploadFileInChunks } from "../../../../../../utils/uploads"

import { FILE_UPLOAD_CHUNK_SIZE } from "../../constant"

class StorageError extends Error {
  constructor(message, detail) {
    super(message) // Call the parent class constructor with the message
    this.detail = detail
  }
}

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
      import.meta.env.DEV && console.log("[DEV] file uploading with options", options)
      try {
        // Step 1: Request a pre-signed URL from your Shrine.rb backend
        const response = await requestPresignedUrl(file, fileName, url)
        if (!response.ok) {
          throw new StorageError(
            `HTTP error! status: ${response.status}`,
            "Failed to upload the file directly.  Please contact support."
          )
        }
        const presignedData = await response.json()

        // Step 2: Upload the file directly to the storage service using the pre-signed URL
        // Dell ECS S3 does not support POST object, we need to use PUT and chunked transfer encoding
        await uploadFileInChunks(
          presignedData.signedUrls,
          presignedData.headers,
          file,
          progressCallback,
          FILE_UPLOAD_CHUNK_SIZE * 1024 * 1024
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
        import.meta.env.DEV && console.log("[DEV] file upload error", error)
        throw new StorageError(error, "Failed to upload the file directly.  Please contact support.")
      }
    },
    deleteFile: async (fileInfo, options) => {
      //assume we will not have public-read acl, use shrine to generate the request
      try {
        //if there are no model / model_ids, and id starts with cache they ar part of cache
        const params = new URLSearchParams({
          id: fileInfo.id,
          ...(fileInfo.model && { model: fileInfo.model }),
          ...(fileInfo.modelId && { model_id: fileInfo.modelId }),
        })

        const response = await fetch(`/api/storage/s3/delete?${params.toString()}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
        //form.io assumes that the delete will just succeed, it always removes the link from the form
        //TODO: ALWAYS FORCE A SAVE ON THE FILE DATA WHEN IT IS DELETED
      } catch (error) {
        throw new StorageError(
          error,
          "An error occured during deletion, but please save the application and try again."
        )
      }
    },
    downloadFile: async (fileInfo, options) => {
      try {
        // Assume we will not have public-read acl, use shrine to generate the request
        // import.meta.env.DEV && console.log("s3 custom download files", fileInfo, options)
        // Return a file value, the file value must have a url
        const params = new URLSearchParams({
          id: fileInfo.id,
          ...(fileInfo.model && { model: fileInfo.model }),
          ...(fileInfo.modelId && { model_id: fileInfo.modelId }),
        })

        const response = await fetch(`/api/storage/s3/download?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new StorageError(`HTTP error! status: ${response.status}`, "Failed to get a valid download url.")
        }

        const responseJson = await response.json()
        window.open(responseJson.url, "_blank")
        return responseJson // Resolving the promise implicitly by returning the value
      } catch (error) {
        throw new StorageError(error, `Failed to download the file.`) // Rejecting the promise implicitly by throwing an error
      }
    },
  }
}
s3custom.title = "s3custom"
export default s3custom
