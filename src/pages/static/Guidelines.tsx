import { StaticPage } from "@/components/StaticPage";

const Guidelines = () => (
  <StaticPage
    title="Community Guidelines"
    intro="The standards everyone on Amorematch is expected to follow."
  >
    <h2>Be real</h2>
    <ul>
      <li>Use your real name and recent photos of yourself.</li>
      <li>Don't pretend to be someone you're not.</li>
      <li>Don't use celebrity or AI-generated photos.</li>
    </ul>

    <h2>Be respectful</h2>
    <ul>
      <li>No harassment, threats, or hate speech.</li>
      <li>No sexually explicit content or unsolicited explicit photos.</li>
      <li>Respect a "no" — don't keep messaging someone who hasn't accepted you.</li>
    </ul>

    <h2>No scams</h2>
    <p>
      Don't ask other members for money, gifts or financial help. Don't promote services,
      crypto schemes, or "investment opportunities". This is grounds for an immediate ban.
    </p>

    <h2>How to report</h2>
    <p>
      Tap the report button on any profile or message. Our admin team reviews every
      report within 24 hours. Repeat offenders are permanently banned and their wallet
      funds are forfeited.
    </p>
  </StaticPage>
);
export default Guidelines;
