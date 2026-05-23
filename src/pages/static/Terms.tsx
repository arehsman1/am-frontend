import { StaticPage } from "@/components/StaticPage";

const Terms = () => (
  <StaticPage
    title="Terms of Service"
    intro="The rules that keep Amorematch safe, fair, and worth your time."
  >
    <h2>Account rules</h2>
    <ul>
      <li>You must be at least 18 years old.</li>
      <li>One real person, one account. Fake or duplicate accounts will be banned.</li>
      <li>The gender you select at signup is locked and cannot be changed.</li>
      <li>You're responsible for keeping your password and WhatsApp number secure.</li>
    </ul>

    <h2>Ban-worthy behaviour</h2>
    <ul>
      <li>Impersonating another person or using fake photos.</li>
      <li>Harassment, threats, hate speech or sexually explicit content.</li>
      <li>Soliciting money, scams, or commercial spam.</li>
      <li>Creating new accounts after being banned.</li>
    </ul>

    <h2>Wallet rules</h2>
    <ul>
      <li>Wallet funds are non-refundable except where required by law.</li>
      <li>Only the backend can debit or credit your wallet.</li>
      <li>Boost purchases and image unlocks deduct funds immediately.</li>
    </ul>

    <h2>Boost rules</h2>
    <ul>
      <li>Only female members can purchase boosts.</li>
      <li>A boost lasts for the exact duration listed at purchase time.</li>
      <li>Boosts increase ranking in Explore but do not guarantee matches.</li>
    </ul>
  </StaticPage>
);
export default Terms;
