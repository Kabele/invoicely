
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
    >
      <path d="M4 3h16v16l-2.5-2.5L15 19l-2.5-2.5L10 19l-2.5-2.5L5 19z" fill="#000020" stroke="none" />
      <path d="M4.5 3.5h15v12h-15z" fill="white" stroke="none" />
      <path d="M7 7h4" stroke="currentColor" />
      <path d="M7 10h10" stroke="currentColor" />
      <path d="M7 13h3" stroke="currentColor" />
      <path d="M12 13h5" stroke="currentColor" strokeDasharray="2 2" />
      <path d="M10 5l4 6h-4l4 6" fill="yellow" stroke="orange" />
      <path d="M4 3h16v-1h-16z" fill="#000020" stroke="none" />
      <path d="M6 3.5l-2.5 3h2l-2.5 3h2l-2.5 3" fill="none" stroke="#22c55e" strokeWidth="1.5" />
    </svg>
  );
}
