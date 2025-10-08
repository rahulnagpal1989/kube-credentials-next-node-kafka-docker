'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [page, setPage] = useState<string | null>(null);

  const handleLinkClick = (href: string) => {
    setPage(href);
    router.push(href);
  };

  return (
    <div className="flex flex-col justify-between items-center">
      <h1 className="text-2xl font-bold">Kube Credential</h1>
      <nav className="flex gap-2 items-center">
        <button 
          onClick={() => handleLinkClick('/')} 
          className={`btn btn-primary ${pathname === '/' ? 'btn-active' : ''} ${page === '/' ? 'loading' : ''}`}
          disabled={pathname === '/'}
        >
          {page === '/' ? 'Loading...' : 'Home'}
        </button>
        <button 
          onClick={() => handleLinkClick('/issue')} 
          className={`btn btn-primary ${pathname === '/issue' ? 'btn-active' : ''} ${page === '/issue' ? 'loading' : ''}`}
          disabled={pathname === '/issue/'}
        >
          {page === '/issue' ? 'Loading...' : 'Issue'}
        </button>
        <button 
          onClick={() => handleLinkClick('/verify')} 
          className={`btn btn-primary ${pathname === '/verify' ? 'btn-active' : ''} ${page === '/verify' ? 'loading' : ''}`}
          disabled={pathname === '/verify/'}
        >
          {page === '/verify' ? 'Loading...' : 'Verify'}
        </button>
      </nav>
    </div>
  );
}