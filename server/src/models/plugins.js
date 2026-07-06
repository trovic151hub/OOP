export const idTransform = {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
  },
}

export const timestampsOpt = { createdAt: 'createdAt', updatedAt: false }

// Page forms across the app send slightly different field sets for the same
// collection (e.g. medical records created via the UI include `treatment`/
// `prescription`/`patientId`, while demo-seeded records use `doctor`/`vitals`).
// strict:false keeps Mongo documents schemaless like Firestore was, so no
// field the frontend sends is silently dropped.
export const docSchemaOpts = {
  timestamps: timestampsOpt,
  strict: false,
  toJSON: { transform: idTransform.transform, virtuals: true },
}
