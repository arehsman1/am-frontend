import { StaticPage } from "@/components/StaticPage";

const Privacy = () => (
  <StaticPage
    title="Privacy Policy"
    intro="Your data is yours. Here's exactly what we collect and how we use it."
  >
    <h2>Data we collect</h2>
    <ul>
      <li>Email address and password (for authentication).</li>
      <li>Profile details you provide: name, age, gender, location, WhatsApp number, bio, interests, and photos.</li>
      <li>Wallet balance and transaction history (for boosts and image unlocks).</li>
      <li>Approximate location used to power location-based requests.</li>
    </ul>

    <h2>How we use your data</h2>
    <ul>
      <li>To match you with other members.</li>
      <li>To process wallet top-ups, boosts and image unlocks.</li>
      <li>To send notifications about requests, matches and account activity.</li>
    </ul>

    <h2>What we don't do</h2>
    <p>
      We do not sell your personal data. We do not share your WhatsApp number until both
      sides accept a match. We do not show your exact location to other users.
    </p>

    <h2>Wallet handling</h2>
    <p>
      Wallet balances are stored on our backend and never modified from the client.
      All payments are processed by Paystack — we never store your card details.
    </p>

    <h2>Your rights</h2>
    <p>
      You can request a copy of your data or delete your account at any time by emailing{" "}
      <a href="mailto:privacy@amorematch.app" className="text-accent underline">privacy@amorematch.app</a>.
    </p>
  </StaticPage>
);
export default Privacy;
