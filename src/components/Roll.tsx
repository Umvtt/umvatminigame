/** A number that rolls in from above whenever it changes. */
export default function Roll({ value }: { value: string | number }) {
  return (
    <span className="roll">
      <span key={value} className="roll-in">{value}</span>
    </span>
  );
}
