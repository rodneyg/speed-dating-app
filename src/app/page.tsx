import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Welcome to Speed Dating</h1>
      <Link href="/record">Start Recording</Link>
    </div>
  );
}