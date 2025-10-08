'use client';
import Header from "./components/header";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Header />
      Click issue or verify to start.
    </div>
  );
}
