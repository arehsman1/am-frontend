import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2 md:gap-3">
          <Button asChild variant="ghost" size="sm" className="md:size-default">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="brand" size="sm" className="md:size-default">
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
