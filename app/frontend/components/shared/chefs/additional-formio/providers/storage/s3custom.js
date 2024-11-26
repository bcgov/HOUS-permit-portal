import { persistFileUpload, uploadFile } from "../../../../../../utils/uploads"

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
      try {
        const presignedUploadResponse = await uploadFile(file, fileName, progressCallback)

        const presignedPayload = {
          storage: "cache",
          filename: fileName || file.name,
          size: file.size,
          type: file.type,
          groupPermissions,
          groupId,
          id: presignedUploadResponse?.key?.startsWith("cache/")
            ? presignedUploadResponse.key.slice(6)
            : presignedUploadResponse?.key,
          metadata: {
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            content_disposition: presignedUploadResponse?.headers?.["Content-Disposition"], //if multiplart this is moved inline
          },
        }
        const presignedPermitApplicationPayload = {
          permit_application: {
            supporting_documents_attributes: [
              {
                file: presignedPayload,
                data_key: fileKey,
              },
            ],
          },
        }

        const persistedResponse = await persistFileUpload(
          options?.config?.formCustomOptions?.persistFileUploadAction,
          options?.config?.formCustomOptions?.persistFileUploadUrl,
          presignedPermitApplicationPayload,
          presignedPayload
        )

        return persistedResponse
      } catch (error) {
        import.meta.env.DEV && console.log("[DEV] file upload error", error)
        throw new StorageError(error, "Failed to upload the file directly.  Please contact support.")
      }
    },
    deleteFile: async (fileInfo, options) => {
      //By default form io always deletes the file, no matter success or failure from backend.
      //Only for files that are in cache (before a save), should have the delete call the cache directly.

      //assume we will not have public-read acl, use shrine to generate the request
      try {
        //if there is no model info, it is an unpersisted cache item
        if (fileInfo.id.startsWith("cache/")) {
          const params = new URLSearchParams({
            id: fileInfo.id,
          })
          const response = await fetch(`/api/storage/s3/delete?${params.toString()}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })
        } else {
          //form.io assumes that the delete will just succeed, it always removes the link from the form
        }
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
