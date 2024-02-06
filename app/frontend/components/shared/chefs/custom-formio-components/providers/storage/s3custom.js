/* tslint:disable */
const s3custom = function Provider(formio) {
  const requestPresignedUrl = (file, fileName, url) => {
    const params = new URLSearchParams({
      filename: fileName,
      type: file.type,
      size: file.size,
    })

    return fetch(url == "undefined" ? `/api/storage/s3?${params.toString()}` : `${url}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
  }

  const uploadFileInChunks = async (signedUrl, headers, file, progressCallback, chunkSize = 1 * 1024 * 1024) => {
    // Default chunk size is 1MB
    let start = 0

    // Function to upload a single chunk
    async function uploadChunk(chunk, chunkNumber, contentRange) {
      const response = await fetch(signedUrl, {
        method: "PUT",
        headers: Object.assign({}, headers, {
          // "Content-Type": "application/octet-stream",
          // "Content-Range": contentRange,
          "Content-Length": chunk.size,
          "Transfer-Encoding": "chunked",
        }),
        body: chunk,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status} during chunk ${chunkNumber} upload.`)
      }
    }

    // Iterate over the file in chunks and upload each chunk
    let chunkNumber = 0

    let chunkUnits = Math.ceil(file.size / chunkSize)
    while (start < file.size) {
      let end = start + chunkSize
      const chunk = file.slice(start, end)
      const contentRange = `bytes ${start}-${end - 1}/${file.size}`

      // Await ensures each chunk is uploaded before the next one starts
      await uploadChunk(chunk, chunkNumber, contentRange)
      chunkNumber++
      console.log(`calling callback - ${chunkNumber} / ${chunkUnits}`)
      progressCallback(
        file,
        new ProgressEvent("progress", { lengthComputable: true, loaded: chunkNumber, total: chunkUnits })
      ) //update in format required

      start = end
    }
  }

  return {
    title: "s3custom",
    name: "s3custom",

    uploadFile: (
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
      return new Promise((resolve, reject) => {
        // Step 1: Request a pre-signed URL from your Shrine.rb backend
        // console.log("***upload call", { fileName, dir, url, fileKey, options })
        requestPresignedUrl(file, fileName, url)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
          })
          .then((presignedData) => {
            // Step 2: Upload the file directly to the storage service using the pre-signed URL
            // Dell ECS S3 does not support POST object, we need to use PUT and chunked transfer encoding
            uploadFileInChunks(presignedData.url, presignedData.headers, file, progressCallback, 1 * 1024 * 1024).then(
              (result) => {
                resolve({
                  storage: "s3custom",
                  filename: fileName,
                  size: file.size,
                  type: file.type,
                  groupPermissions,
                  groupId,
                  key: presignedData?.key.replace(/^cache\//, ""),
                  metadata: {
                    filename: file.name,
                    size: file.size,
                    mime_type: file.type,
                    content_disposition: presignedData?.headers?.["Content-Disposition"],
                  },
                })
              }
            )
          })
          .catch((error) => {
            reject("Failed to get pre-signed URL")
          })
      })
    },
    deleteFile: (fileInfo, options) => {
      //assume we will not have public-read acl, use shrine to generate the request
      // console.log("s3 custom delete file", fileInfo)
    },
    downloadFile: (fileInfo, options) => {
      return new Promise((resolve, reject) => {
        //assume we will not have public-read acl, use shrine to generate the request
        // console.log("s3 custom download files", fileInfo, options)
        //return a file value, the file value must have a url
        const params = new URLSearchParams({
          key: fileInfo.key,
        })
        fetch(`/api/storage/s3/download?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
          })
          .then((responseJson) => {
            window.open(responseJson.url, "_blank")
            resolve(responseJson)
          })
          .catch((error) => {
            reject("Failed to get pre-signed URL")
          })
      })
    },
  }
}
s3custom.title = "s3custom"
export default s3custom
