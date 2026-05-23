import { StaticPage } from "@/components/StaticPage";

const Cookies = () => (
  <StaticPage
    title="Cookie Policy"
    intro="We use a small number of cookies to keep the platform working."
  >
    <h2>What we use</h2>
    <ul>
      <li><strong>Authentication tokens</strong> — keep you signed in across sessions.</li>
      <li><strong>Preferences</strong> — remember UI choices like theme.</li>
      <li><strong>Analytics</strong> — anonymous usage stats so we can improve the product.</li>
    </ul>

    <h2>What we don't use</h2>
    <p>
      We don't use third-party advertising cookies. We don't sell or share cookie data
      with advertisers.
    </p>

    <h2>Your control</h2>
    <p>
      You can clear cookies in your browser settings at any time. Clearing your auth
      cookie will sign you out.
    </p>
  </StaticPage>
);
export default Cookies;
