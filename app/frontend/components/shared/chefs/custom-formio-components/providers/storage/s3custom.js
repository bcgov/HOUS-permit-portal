/* tslint:disable */
const s3custom = function Provider(formio) {
  const requestPresignedUrl = (file, fileName) => {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        filename: fileName,
        type: file.type,
        size: file.size,
      })

      const xhr = new XMLHttpRequest()
      xhr.open("GET", `/api/storage/s3?${params.toString()}`, true)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.setRequestHeader("Accept", "application/json")

      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
          if (this.status === 200) {
            const response = JSON.parse(this.responseText)
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
        requestPresignedUrl(file, fileName)
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
                resolve({
                  storage: "s3custom",
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  fileInfo: {
                    url: presignedData.url,
                  },
                })
              } else if (xhr.status >= 200 && xhr.status < 300) {
                // Step 3: Resolve the promise with the file's URL on the storage service
                resolve({
                  storage: "s3custom",
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  bucket: xhr.response.bucket,
                  url: xhr.response.url,
                  fileInfo: {
                    url: xhr.response.url,
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
