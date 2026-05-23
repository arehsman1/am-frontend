import { StaticPage } from "@/components/StaticPage";

const About = () => (
  <StaticPage
    title="About Amorematch"
    intro="A real matchmaking platform built for people who want real connections — not endless swiping."
  >
    <h2>What we do</h2>
    <p>
      Amorematch connects verified members through an intentional request-and-accept system.
      Every profile belongs to a real person, every match is mutual, and every conversation
      starts with intent.
    </p>

    <h2>How we operate</h2>
    <ul>
      <li>Profiles are verified at signup using a real WhatsApp number.</li>
      <li>Members can send or receive match requests — no mass messaging.</li>
      <li>When both sides accept a request, a match is confirmed.</li>
      <li>Female members can optionally boost their profile to gain more visibility.</li>
    </ul>

    <h2>Authentication & data</h2>
    <p>
      We use Supabase for authentication and data storage. Your password is never stored
      in plain text and your personal details are protected by row-level security policies
      that ensure only you can edit your own profile.
    </p>

    <h2>Safety first</h2>
    <p>
      Every member can report abuse, harassment, or fake profiles. Our admin team reviews
      reports daily and removes bad actors. Repeat offenders are permanently banned.
    </p>
  </StaticPage>
);
export default About;
