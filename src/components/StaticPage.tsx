import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

type Props = {
  title: string;
  intro?: string;
  children: ReactNode;
};

export const StaticPage = ({ title, intro, children }: Props) => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="container max-w-3xl py-12 md:py-16 flex-1">
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
      <div className="prose prose-neutral mt-8 max-w-none text-foreground/90 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:my-1">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);
