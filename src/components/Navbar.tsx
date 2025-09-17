import Link from "next/link";

export function Navbar() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="#">
        <SweetIcon className="h-6 w-6" />
        <span className="sr-only">Sweet Shop</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="/admin/sweets"
        >
          Admin
        </Link>
      </nav>
    </header>
  );
}

function SweetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M15.5 10c-1.38.81-2.5 2.5-2.5 4.5 0 2.5 1.5 4.5 1.5 4.5" />
      <path d="M8.5 10c1.38.81 2.5 2.5 2.5 4.5 0 2.5-1.5 4.5-1.5 4.5" />
      <path d="M12 14.5c-2.5 0-4.5-1.5-4.5-1.5" />
      <path d="M12 14.5c2.5 0 4.5-1.5 4.5-1.5" />
      <path d="M12 11V9" />
      <path d="M10 7h4" />
    </svg>
  );
}
