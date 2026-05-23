import { StaticPage } from "@/components/StaticPage";

const Press = () => (
  <StaticPage
    title="Press"
    intro="News, announcements and press resources for Amorematch."
  >
    <h2>Platform overview</h2>
    <p>
      Amorematch is a verified matchmaking platform built for serious daters in Africa.
      We use a request-and-accept system instead of swiping, and integrate WhatsApp for
      verified, real-world contact.
    </p>

    <h2>Latest announcement</h2>
    <p>
      <strong>Public launch.</strong> Amorematch is now open to verified members across
      Nigeria. Profile boosts and the wallet system are live for female members.
    </p>

    <h2>Press contact</h2>
    <p>
      For interviews, statements, or media kits, reach{" "}
      <a href="mailto:press@amorematch.app" className="text-accent underline">press@amorematch.app</a>.
      We typically respond within 48 hours.
    </p>
  </StaticPage>
);
export default Press;
