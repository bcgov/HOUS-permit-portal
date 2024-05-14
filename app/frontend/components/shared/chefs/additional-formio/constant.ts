export const FILE_UPLOAD_CHUNK_SIZE =
  (import.meta.env.VITE_FILE_UPLOAD_CHUNK_SIZE && parseFloat(import.meta.env.VITE_FILE_UPLOAD_CHUNK_SIZE)) || 10
export const FILE_UPLOAD_CHUNK_SIZE_IN_BYTES = FILE_UPLOAD_CHUNK_SIZE * 1024 * 1024
export const FILE_UPLOAD_MAX_SIZE =
  (import.meta.env.VITE_FILE_UPLOAD_MAX_SIZE && parseFloat(import.meta.env.VITE_FILE_UPLOAD_MAX_SIZE)) || 100
export const MAX_NUMBER_OF_PARTS = FILE_UPLOAD_MAX_SIZE / FILE_UPLOAD_CHUNK_SIZE
