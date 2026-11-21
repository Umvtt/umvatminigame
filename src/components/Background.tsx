/** Paper backdrop: faint grain + a dot grid that inks in around the pointer. */
export default function Background() {
  return (
    <div className="bg-fx" aria-hidden>
      <div className="dots" />
      <div className="dots dots-lit" />
      <div className="grain" />
    </div>
  );
}
