import { Alternatives, BehindTheBuild, EarlyAccess, Footer, Pricing } from './Business'
import { Header } from './Header'
import { Hero } from './Hero'
import { DemoPreview, Features, Requirements } from './Product'
import { Audience, HowItWorks, Problem } from './Story'

export function LandingPage() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Problem />
        <Audience />
        <HowItWorks />
        <Features />
        <DemoPreview />
        <Requirements />
        <Alternatives />
        <Pricing />
        <BehindTheBuild />
        <EarlyAccess />
      </main>
      <Footer />
    </>
  )
}
