import { StaticPage } from "@/components/StaticPage";

const Careers = () => (
  <StaticPage
    title="Careers at Amorematch"
    intro="We're a small, focused team building the most trusted matchmaking platform in Africa."
  >
    <h2>Why work with us</h2>
    <p>
      Every line of code we write affects real people meeting their real partners.
      If that excites you, we want to talk.
    </p>

    <h2>Open roles</h2>
    <ul>
      <li><strong>Senior Backend Engineer</strong> — Node.js, Supabase, scalable APIs.</li>
      <li><strong>Mobile / Frontend Engineer</strong> — React, TypeScript, mobile-first UI.</li>
      <li><strong>Trust & Safety Specialist</strong> — moderate reports, refine our policies.</li>
      <li><strong>Growth Marketer</strong> — own paid acquisition and brand campaigns.</li>
    </ul>

    <h2>How to apply</h2>
    <p>
      Send your CV and a short note about why you want to join to{" "}
      <a href="mailto:careers@amorematch.app" className="text-accent underline">careers@amorematch.app</a>.
      We respond to every application within 7 days.
    </p>
  </StaticPage>
);
export default Careers;
