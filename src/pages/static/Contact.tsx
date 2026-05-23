import { StaticPage } from "@/components/StaticPage";

const Contact = () => (
  <StaticPage
    title="Contact us"
    intro="We read every message. Most replies go out within 24 hours on weekdays."
  >
    <h2>Support</h2>
    <p>
      For account issues, wallet problems, or refunds:{" "}
      <a href="mailto:support@amorematch.app" className="text-accent underline">support@amorematch.app</a>.
    </p>

    <h2>Report abuse</h2>
    <p>
      The fastest way to report a fake profile or abusive behaviour is the in-app report
      button. You can also email{" "}
      <a href="mailto:safety@amorematch.app" className="text-accent underline">safety@amorematch.app</a>.
    </p>

    <h2>Response times</h2>
    <ul>
      <li>Safety reports — reviewed within 24 hours.</li>
      <li>Wallet & payment issues — resolved within 2 business days.</li>
      <li>General questions — answered within 3 business days.</li>
    </ul>
  </StaticPage>
);
export default Contact;
