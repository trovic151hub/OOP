// Tells every connected client "collection X changed" so it can refetch —
// no document data goes over the socket, just the collection key, so this
// needs no auth and is safe to call from any mutation handler.
export function emitChanged(req, collection) {
  req.app.get('io')?.emit('changed', { collection })
}
