export default function JourneyLoading() {
  return <div role="status" aria-live="polite" className="ns-route-loading">
    <div className="ns-route-loading-mark" aria-hidden="true" />
    <p>Opening your next step…</p>
  </div>;
}
