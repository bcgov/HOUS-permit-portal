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
            const xhr = new XMLHttpRequest()

            const formData = new FormData()
            // Add the fields to the form data
            Object.keys(presignedData.fields).forEach((key) => {
              formData.append(key, presignedData.fields[key])
            })
            // Add the file
            formData.append("file", file)

            xhr.open(presignedData.method, presignedData.url, true)

            xhr.upload.onprogress = (event) => {
              progressCallback(file, event) //custom update progress for form.io
            }

            xhr.onload = () => {
              if (xhr.status === 204) {
                //the file info needs to mathc what rails needs
                // console.log("*** success - upate with info", presignedData)
                resolve({
                  storage: "s3custom",
                  filename: fileName,
                  size: file.size,
                  type: file.type,
                  groupPermissions,
                  groupId,
                  id: (presignedData?.fields?.id || presignedData?.fields?.key).replace(/^cache\//, ""),
                  key: presignedData?.fields?.key.replace(/^cache\//, ""),
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
                  storage: "s3custom",
                  filename: fileName,
                  size: file.size,
                  type: file.type,
                  groupPermissions,
                  groupId,
                  id: (xhr.response?.fields?.id || xhr.response?.fields?.key).replace(/^cache\//, ""),
                  key: xhr.response?.fields?.key.replace(/^cache\//, ""),
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
