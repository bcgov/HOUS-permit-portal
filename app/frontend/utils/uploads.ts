export const requestPresignedUrl = (file, fileName, url = "undefined") => {
  const params = new URLSearchParams({
    filename: fileName,
    type: file.type,
    size: file.size,
    // checksum: file.checksum,
  })

  return fetch(url == "undefined" ? `/api/storage/s3?${params.toString()}` : `${url}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
}

//TODO: expect an array of signedUrls in the future
export const uploadChunk = async (signedUrl, headers, chunk, chunkNumber, contentRange) => {
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
  //no catch here, let error bubble up
}

export const uploadFileInChunks = async (
  signedUrls,
  headers,
  file,
  progressCallback = undefined,
  chunkSize = 1 * 1024 * 1024
) => {
  //TODO: expect an array of signedUrls in the future

  // Default chunk size is 1MB
  let start = 0

  // Iterate over the file in chunks and upload each chunk
  let chunkNumber = 0

  let chunkUnits = Math.ceil(file.size / chunkSize)
  while (start < file.size) {
    let end = start + chunkSize
    const chunk = file.slice(start, end)
    const contentRange = `bytes ${start}-${end - 1}/${file.size}`
    const signedUrl = signedUrls[chunkNumber]
    // Await ensures each chunk is uploaded before the next one starts
    await uploadChunk(signedUrl, headers, chunk, chunkNumber, contentRange)
    chunkNumber++

    if (progressCallback) {
      progressCallback(
        file,
        new ProgressEvent("progress", { lengthComputable: true, loaded: chunkNumber, total: chunkUnits })
      ) //update in format required
    }

    start = end
  }

  return {
    url: signedUrls[-1],
  }
}
