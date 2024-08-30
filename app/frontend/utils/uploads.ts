import {
  FILE_UPLOAD_CHUNK_SIZE_IN_BYTES,
  MAX_NUMBER_OF_PARTS,
} from "../components/shared/chefs/additional-formio/constant"
import { getCsrfToken } from "./utility-functions"

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

export const uploadFile = async (file, fileName, progressCallback = undefined) => {
  try {
    const numberOfParts = Math.ceil(file.size / FILE_UPLOAD_CHUNK_SIZE_IN_BYTES)

    let presignedData
    // Step 1: Request a pre-signed URL from your Shrine.rb backend
    if (numberOfParts == 1) {
      const response = await requestPresignedUrl(file, fileName)
      if (!response.ok) {
        throw new Error("Error on upload.")
      }
      presignedData = await response.json()
      await uploadFileOneChunk(presignedData.signed_url, presignedData.headers, file)
      return presignedData
    } else if (numberOfParts > MAX_NUMBER_OF_PARTS) {
      throw new Error(`Chunk max exceeded`)
    } else {
      const initiateResponse = await requestMultipart(file, fileName)
      const startMultipartResponse = await initiateResponse.json()
      const { uploadId, key, headers } = startMultipartResponse
      const partNumbers = Array.from({ length: numberOfParts }, (_, i) => i + 1)
      const getSignedUrls = await getMultipartSignedUrls(uploadId, key, partNumbers)
      const { presignedUrls } = await getSignedUrls.json()

      // Step 2: Upload the file directly to the storage service using the pre-signed URL
      // Dell ECS S3 does not support POST object, we need to use PUT and chunked transfer encoding
      const parts = await uploadFileInChunks(presignedUrls, headers, file, numberOfParts, progressCallback)
      //if there is an error along the way, it will throw and an error
      const completeResponse = await completeMultipart(uploadId, key, parts)
      const parsedCompleteResponse = await completeResponse.json()
      const { location } = parsedCompleteResponse
      import.meta.env.DEV &&
        console.log("[DEV]", initiateResponse.headers, completeResponse.headers, {
          url: location,
          headers: headers,
          key: key,
        })
      return { url: location, headers: headers, key: key }
    }
  } catch (error) {
    throw error
  }
}

export const requestPresignedUrl = async (file, fileName) => {
  try {
    const params = new URLSearchParams({
      filename: fileName,
      type: file.type,
      size: file.size,
      // checksum: file.checksum,
    })

    return fetch(`/api/storage/s3?${params.toString()}`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
  } catch (error) {
    throw error
  }
}

export const uploadFileOneChunk = async (signedUrl, headers, file) => {
  try {
    const response = await fetch(signedUrl, {
      method: "PUT",
      credentials: "same-origin",
      headers: Object.assign({}, headers, {
        "Content-Length": file.size,
        "Transfer-Encoding": "chunked",
      }),
      body: file,
    })

    if (!response.ok) {
      throw new Error(`Upload file failed.`)
    }
    return
  } catch (error) {
    throw error
  }
}

export const requestMultipart = async (file, fileName) => {
  try {
    const params = JSON.stringify({
      filename: fileName,
      type: file.type,
      size: file.size,
    })

    return fetch(`/api/storage/s3/multipart`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": getCsrfToken(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: params,
    })
  } catch (error) {
    throw error
  }
}

export const getMultipartProgress = async (uploadId) => {
  try {
    return fetch(`/api/storage/s3/multipart/${uploadId}`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
  } catch (error) {
    throw error
  }
}

export const getMultipartSignedUrls = async (uploadId, key, partNumbers) => {
  try {
    const params = new URLSearchParams({
      key: key,
      partNumbers: partNumbers,
    })
    return fetch(`/api/storage/s3/multipart/${uploadId}/batch?${params.toString()}`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
  } catch (error) {
    throw error
  }
}

export const completeMultipart = async (uploadId, key, parts) => {
  try {
    const params = JSON.stringify({
      key: key,
      parts: parts,
    })
    return fetch(`/api/storage/s3/multipart/${uploadId}/complete`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-CSRF-Token": getCsrfToken(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: params,
    })
  } catch (error) {
    throw error
  }
}

export const uploadFileInChunks = async (signedUrls, headers, file, partCount, progressCallback = undefined) => {
  try {
    let chunkSize = FILE_UPLOAD_CHUNK_SIZE_IN_BYTES
    // Default chunk size is 1MB
    let start = 0

    // Iterate over the file in chunks and upload each chunk
    let partNumber = 1
    let parts = []

    while (start < file.size) {
      let end = start + chunkSize
      const chunk = file.slice(start, end)
      import.meta.env.DEV && (await sleep(1500))

      // const contentRange = `bytes ${start}-${end - 1}/${file.size}`
      const signedUrl = signedUrls[`${partNumber}`]
      // Await ensures each chunk is uploaded before the next one starts
      const response = await fetch(signedUrl, {
        method: "PUT",
        credentials: "same-origin",
        headers: Object.assign({}, headers, {
          // "Content-Range": contentRange,
          "Content-Length": chunk.size,
          "Transfer-Encoding": "chunked",
        }),
        body: chunk,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status} during chunk ${partNumber} upload.`)
      }
      parts.push({ PartNumber: `${partNumber}`, ETag: response.headers.get("Etag") })

      partNumber++

      if (progressCallback) {
        progressCallback(
          new ProgressEvent("progress", { lengthComputable: true, loaded: partNumber, total: partCount })
        ) //update in format required
      }

      start = end
    }
    import.meta.env.dev && console.log("[DEV] chunk count matches", partNumber - 1 == partCount)

    return parts
  } catch (error) {
    throw error
  }
}

export const persistFileUpload = async (persistFileUploadAction, persistFileUploadUrl, updatePayload, filePayload) => {
  //takes an S3 file and persists it based on the setting path
  //conversts file id from cache/key to model/modelId/key
  //persiste model and modelId as part of the metadata
  //fileKey specifies the key identifier inside form io for the owner of this file

  //multifile would do a loop of these responses
  try {
    const response = await fetch(persistFileUploadUrl, {
      method: persistFileUploadAction,
      headers: {
        "X-CSRF-Token": getCsrfToken(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(updatePayload),
    })
    if (!response.ok) {
      throw new Error(`Could not persist the file from cache to storage.`)
    }
    const result = await response.json()
    //assumes one file returns per update
    const fileDetails = result?.data?.[0]
    return {
      ...filePayload,
      ...{ storage: "s3custom" },
      ...(fileDetails ? { id: fileDetails.id, modelId: fileDetails.modelId, model: fileDetails.model } : {}),
    }
  } catch (error) {
    throw error
  }
}
