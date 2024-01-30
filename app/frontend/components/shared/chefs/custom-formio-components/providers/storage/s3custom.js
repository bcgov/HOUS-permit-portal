/* tslint:disable */
const s3custom = function Provider(formio) {
  const requestPresignedUrl = (file, fileName, url) => {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        filename: fileName,
        type: file.type,
        size: file.size,
      })

      const xhr = new XMLHttpRequest()
      xhr.open("GET", url == "undefined" ? `/api/storage/s3?${params.toString()}` : `${url}?${params.toString()}`, true)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.setRequestHeader("Accept", "application/json")

      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
          if (this.status === 200) {
            const response = JSON.parse(this.responseText)
            // console.log("***get signed url request", response)
            resolve(response)
          } else {
            reject("Failed to get pre-signed URL")
          }
        }
      }

      xhr.send()
    })
  }

  return {
    title: "s3custom",
    name: "s3custom",

    uploadFile(file, fileName, dir, progressCallback, url, options, fileKey, groupPermissions, groupId, abortCallback) {
      return new Promise((resolve, reject) => {
        // Step 1: Request a pre-signed URL from your Shrine.rb backend
        // console.log("***upload call", { fileName, dir, url, fileKey, options })
        requestPresignedUrl(file, fileName, url)
          .then((presignedData) => {
            // Step 2: Upload the file directly to the storage service using the pre-signed URL
            const xhr = new XMLHttpRequest()

            const formData = new FormData()
            // Add the fields to the form data
            Object.keys(presignedData.fields).forEach((key) => {
              formData.append(key, presignedData.fields[key])
            })
            // Add the file
            formData.append("file", file)

            xhr.open("POST", presignedData.url, true)

            xhr.upload.onprogress = (event) => {
              progressCallback(file, event) //custom update progress for form.io
            }

            xhr.onload = () => {
              if (xhr.status === 204) {
                //the file info needs to mathc what rails needs
                // console.log("*** success - upate with info", presignedData)
                resolve({
                  storage: "cache",
                  filename: fileName,
                  size: file.size,
                  type: file.type,
                  groupPermissions,
                  groupId,
                  id: (presignedData?.fields?.id || presignedData?.fields?.key).replace(/^cache\//, ""),
                  key: presignedData?.fields?.key,
                  url: presignedData?.fields?.url,
                  metadata: {
                    filename: file.name,
                    size: file.size,
                    mime_type: file.type,
                    content_disposition: presignedData?.fields?.["Content-Disposition"],
                  },
                })
              } else if (xhr.status >= 200 && xhr.status < 300) {
                // Step 3: Resolve the promise with the file's URL on the storage service
                resolve({
                  storage: "cache",
                  filename: fileName,
                  size: file.size,
                  type: file.type,
                  groupPermissions,
                  groupId,
                  id: (xhr.response?.fields?.id || xhr.response?.fields?.key).replace(/^cache\//, ""),
                  key: xhr.response?.fields?.key,
                  url: xhr.response?.fields?.url,
                  metadata: {
                    filename: fileName,
                    size: file.size,
                    mime_type: file.type,
                    content_disposition: xhr.response?.fields?.["Content-Disposition"],
                  },
                })
              } else {
                reject(xhr.response)
              }
            }

            xhr.onerror = () => reject(xhr.response)

            xhr.responseType = "json"
            // Set any additional headers required for the upload (if any)
            Object.entries(presignedData.headers || {}).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value)
            })

            // Perform the actual upload
            xhr.send(formData)
          })
          .catch(reject)
      })
    },
    deleteFile(fileInfo) {
      console.log(fileInfo)
    },
    downloadFile(file) {
      console.log(fileInfo)
    },

    // deleteFile(fileInfo) {
    //   const url = `${formio.formUrl}/storage/s3?bucket=${XHR.trim(fileInfo.bucket)}&key=${XHR.trim(fileInfo.key)}`
    //   return formio.makeRequest("", url, "delete")
    // },
    // downloadFile(file) {
    //   if (file.acl !== "public-read") {
    //     return formio.makeRequest(
    //       "file",
    //       `${formio.formUrl}/storage/s3?bucket=${XHR.trim(file.bucket)}&key=${XHR.trim(file.key)}`,
    //       "GET"
    //     )
    //   } else {
    //     return Promise.resolve(file)
    //   }
    // },
  }
}
s3custom.title = "s3custom"
export default s3custom
