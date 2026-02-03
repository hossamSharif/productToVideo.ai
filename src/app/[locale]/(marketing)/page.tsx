"use client";

import { Hero } from "@/components/landing/hero";
import { AnimatedShowcase } from "@/components/landing/animated-showcase";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Platforms } from "@/components/landing/platforms";
import { Languages } from "@/components/landing/languages";
import { TemplatesGallery } from "@/components/landing/templates-gallery";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <section id="hero" className="bg-background">
        <Hero />
      </section>

      <section id="showcase" className="bg-muted/50">
        <AnimatedShowcase />
      </section>

      <section id="how-it-works" className="bg-background">
        <HowItWorks />
      </section>

      <section id="platforms" className="bg-muted/50">
        <Platforms />
      </section>

      <section id="languages" className="bg-background">
        <Languages />
      </section>

      <section id="templates" className="bg-muted/50">
        <TemplatesGallery />
      </section>

      <section id="pricing" className="bg-background">
        <Pricing />
      </section>

      <section id="faq" className="bg-muted/50">
        <FAQ />
      </section>

      <footer className="bg-background">
        <Footer />
      </footer>
    </>
  );
}
