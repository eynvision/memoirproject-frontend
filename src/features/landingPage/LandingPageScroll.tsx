import ToolkitSection from "./ToolkitSection";
import PromptCarousel from "./PromptCarousel";
import ArtifactSection from "./ArtifactSection";
import ScatteredMemories from "./ScatteredMemories";
import CallToAction from "./CallToAction";

export default function LandingPageScroll() {
  return (
    <div className="flex flex-col w-full">
      <ScatteredMemories />
      <ToolkitSection />
      <PromptCarousel />
      <ArtifactSection />
      <CallToAction />

    </div>
  );
}