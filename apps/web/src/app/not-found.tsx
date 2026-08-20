import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Not found</h1>
      <p>There is no score on record for this market.</p>
      <Link href="/">← All markets</Link>
    </>
  );
}
