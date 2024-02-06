declare const s3custom: {
  (formio: any): {
    title: string
    name: string
    uploadFile(
      file: any,
      fileName: any,
      dir: any,
      progressCallback: any,
      url: any,
      options: any,
      fileKey: any,
      groupPermissions: any,
      groupId: any,
      abortCallback: any
    ): any
    deleteFile(fileInfo: any): any
    downloadFile(file: any): any
  }
  title: string
}
export default s3custom
