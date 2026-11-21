/** Ambient backdrop: drifting soft blobs + a dot grid that lights up around the pointer. */
export default function Background() {
  return (
    <div className="bg-fx" aria-hidden>
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="dots" />
      <div className="dots dots-lit" />
    </div>
  );
}
