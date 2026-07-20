import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Problems } from "./Problems";
import { AppPreview } from "./AppPreview";
import { HowItWorks } from "./HowItWorks";
import { Footer } from "./Footer";

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <main>
        <Hero />
        <Problems />
        <AppPreview />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
