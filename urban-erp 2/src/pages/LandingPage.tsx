import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import FeatureGrid from '../components/FeatureGrid';
import AutomationGrid from '../components/AutomationGrid';
import PricingSection from '../components/PricingSection';
import WorkflowSection from '../components/WorkflowSection';
import ImpactSection from '../components/ImpactSection';
import FAQ from '../components/FAQ';
import Integrations from '../components/Integrations';
import ResourceCards from '../components/ResourceCards';
import FinalCTA from '../components/FinalCTA';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeatureGrid />
      <AutomationGrid />
      <PricingSection />
      <WorkflowSection />
      <ImpactSection />
      <FAQ />
      <Integrations />
      <ResourceCards />
      <FinalCTA />
    </>
  );
}
