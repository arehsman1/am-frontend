import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export const Logo = ({ className = "" }: { className?: string }) => {
  const { session } = useAuth();
  const to = session ? "/explore" : "/";
  return (
    <Link to={to} className={`flex items-center gap-2 font-display font-bold text-xl text-primary ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      Amorematch
    </Link>
  );
};
