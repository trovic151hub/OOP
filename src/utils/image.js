// Profile/passport photos only ever render at small (thumbnail/avatar) sizes,
// but an unresized upload from a phone camera can be several MB once
// base64-encoded — and that full string gets stored in Mongo and re-sent on
// every list fetch (e.g. GET /api/users) that includes the field. Resizing
// and re-encoding as JPEG before it's ever stored keeps documents small.
export function resizeImageToDataUrl(file, { maxDimension = 480, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
        const width = Math.round(img.width * scale)
        const height = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
