export function LoadingScreen() {
  return (
    <div className="loading-screen" role="status">
      <div className="loading-mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <span className="sr-only">Cargando Duet…</span>
    </div>
  )
}
