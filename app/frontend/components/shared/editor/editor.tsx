import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useRef } from "react"
import ReactQuill, { Quill, ReactQuillProps } from "react-quill"
// importing Quill CSS directly from NPM package doesn't work with Vite
// instead, we import from this CSS file which imports the CSS from the CDN URL
// this URL is specific to the current quill versions and should be updated accordingly
import { isQuillEmpty } from "../../../utils/utility-functions"
import { CustomImageBlot } from "./custom-extensions/image-blot"
import { CustomLinkBlot } from "./custom-extensions/link-blot"
import ImageUploader from "./custom-extensions/quill-image-uploader/imageUploader.js"
import "./quill.css"

Quill.register(CustomImageBlot)
Quill.register(CustomLinkBlot)
Quill.register("modules/imageUploader", ImageUploader)

// from https://stackoverflow.com/questions/11300906/check-if-a-string-starts-with-http-using-javascript
export const getValidUrl = (url = "") => {
  let newUrl = window.decodeURIComponent(url)
  newUrl = newUrl?.trim()?.replace(/\s/g, "")

  if (/^(:\/\/)/.test(newUrl)) {
    return `https${newUrl}`
  }
  if (!/^(f|ht)tps?:\/\//i.test(newUrl)) {
    return `https://${newUrl}`
  }

  return newUrl
}

type TToolbarItemName =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "header"
  | "blockquote"
  | "code-block"
  | "link"
  | "image"
  | "list"

export interface IEditorProps extends Partial<ReactQuillProps> {
  richText?: boolean
  readonly?: boolean
  placeholder?: string
  onChange?: (htmlValue: string) => void
  htmlValue?: string
  autoFocus?: boolean
  shouldContainRichTextToolbarItem?: (
    item: TToolbarItemName | string | { [key: TToolbarItemName | string]: any }
  ) => boolean
}

export const Editor = observer(
  ({
    richText = true,
    readonly,
    placeholder,
    onChange,
    htmlValue = "",
    autoFocus = false,
    shouldContainRichTextToolbarItem = () => true,
    ...rest
  }: IEditorProps) => {
    const editorRef = useRef<ReactQuill>()

    // the types from react quill are not being imported properly so using any. Supposedly fixed in v2.00 beta
    const handleChange = (content: string, delta: any, source: any, editor: any) => {
      onChange?.(isQuillEmpty(content) ? "" : content)
    }

    // This modules cannot be reactive
    // using use memo so that values don't change after initial render
    const modules = useMemo(
      () => ({
        toolbar: richText
          ? {
              container: [
                ["bold", "italic", "underline", { list: "bullet" }, { list: "ordered" }, "link"], // TODO: image neeeds to be added when object storage is implemented
              ]
                .map((toolbarRow) => toolbarRow.filter((item) => shouldContainRichTextToolbarItem(item)))
                .filter((toolbarRow) => toolbarRow.length > 0),
              handlers: {
                link: function (value) {
                  let href = prompt("Enter the URL of the link:")
                  if (value && href) {
                    const validUrl = getValidUrl(href)
                    const editor = this?.quill
                    const selectionRange = editor?.getSelection()
                    if (selectionRange?.length === 0) {
                      editor?.insertText(editor?.getSelection()?.index, href, "link", { href: validUrl })
                    } else {
                      this.quill.format("link", { href: validUrl })
                    }
                  } else {
                    this.quill.format("link", false)
                  }
                },
              },
            }
          : false, // removes toolbar when rich text is not enabled
        // TODO: implement image uploader when object storage is ready
        // ...(richText
        //   ? {
        //       imageUploader: {
        //         upload: (file) => {
        //           return new Promise((resolve, reject) => {
        //             environment.api.getPresignedUrlForEditorAssets(file.name, file.type).then((res) => {
        //               const uploadFailureToastOptions: UseToastOptions = {
        //                 title: "Image upload failed",
        //                 description: "Please try again later.",
        //                 status: "error",
        //                 duration: 2000,
        //                 isClosable: true,
        //                 position: "bottom-right",
        //               }
        //
        //               const rejectionMessage = "Image upload failed. Something went wrong"
        //
        //               if (res.ok) {
        //                 const { url: presignedUploadUrl, method, s3FileUrlAfterUpload } = res.data.data
        //
        //                 const myHeaders = new Headers({ "Content-Type": file.type })
        //
        //                 fetch(presignedUploadUrl, {
        //                   method,
        //                   headers: myHeaders,
        //                   body: file,
        //                 })
        //                   .then((response) => {
        //                     if (response.status >= 200 && response.status < 300) {
        //                       resolve(s3FileUrlAfterUpload)
        //                     } else {
        //                       toast(uploadFailureToastOptions)
        //                       reject(rejectionMessage)
        //                     }
        //                   })
        //                   .catch((e) => {
        //                     toast(uploadFailureToastOptions)
        //                     reject(e)
        //                   })
        //               } else {
        //                 toast(uploadFailureToastOptions)
        //
        //                 reject(rejectionMessage)
        //               }
        //             })
        //           })
        //         },
        //       },
        //     }
        //   : {}),
      }),
      []
    )

    const debouncedHandleChangeEditor = debounce(handleChange, 500)

    useEffect(() => {
      if (autoFocus) {
        const editor = editorRef?.current?.getEditor()
        editor?.focus?.()
      }
    }, [autoFocus])

    return (
      <ReactQuill
        ref={editorRef}
        theme={!readonly && richText ? "snow" : "bubble"}
        defaultValue={htmlValue}
        readOnly={readonly}
        value={htmlValue}
        onChange={debouncedHandleChangeEditor}
        modules={modules}
        placeholder={placeholder}
        {...rest}
      />
    )
  }
)
