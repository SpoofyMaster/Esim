import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy", description: "How BLEUSIM collects, uses and protects your personal data.", alternates: { canonical: "/privacy" } };

export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="26 November 2026"
      intro={<>
        <p>This Privacy Policy explains what personal data BLEUSIM collects when you visit bleusim.com, create an account, buy or use an eSIM data plan, or contact us, and what we do with it. “Personal data” means any information that identifies you directly or indirectly, such as your email address.</p>
        <p>Please read it together with our <a href="/terms">Terms of Service</a> and <a href="/cookies">Cookie Preferences</a>.</p>
      </>}
      sections={[
        { id: "who", title: "Who we are", body: <>
          <p>BLEUSIM is operated by <Fill>company legal name</Fill>, a company registered in <Fill>country</Fill> under number <Fill>registration number</Fill>, with its registered office at <Fill>address</Fill> (“BLEUSIM”, “we”, “us”). We are the controller of the personal data described in this policy.</p>
          <p>You can contact us about privacy at <Fill>privacy contact email</Fill>. <Fill>Data protection officer or representative, if one is appointed</Fill>.</p>
        </> },
        { id: "collect", title: "The data we collect", body: <>
          <p>We only collect what we need to sell you a plan, deliver your eSIM and support you:</p>
          <ul>
            <li><strong>Account data:</strong> your email address and a securely hashed password. We never store your password in readable form.</li>
            <li><strong>Order data:</strong> the plan you chose, its price and currency, the order status and timestamps.</li>
            <li><strong>eSIM data:</strong> identifiers needed to issue and manage your eSIM (such as the ICCID), its installation details, activation status, validity dates and the data usage reported by our network partner.</li>
            <li><strong>Payment data:</strong> payments are handled by our payment provider. We receive a payment reference and status, and may see limited card details (for example the brand and last four digits). We never receive or store your full card number or security code.</li>
            <li><strong>Support data:</strong> the messages you send us and the information needed to resolve your request.</li>
            <li><strong>Technical data:</strong> your IP address, browser type, device type and server logs, used to run the site securely and prevent abuse.</li>
            <li><strong>Identity data, only where the law requires it:</strong> some destinations require identity checks before a plan can be used. When a plan is marked “identity check required”, we or our partner will ask for the documents that local rules require, and use them only for that purpose.</li>
          </ul>
        </> },
        { id: "use", title: "How we use your data and why", body: <>
          <ul>
            <li><strong>To provide the service</strong> (performance of our contract with you): creating your account, taking your order, issuing your eSIM, showing your usage, processing top-ups and refunds.</li>
            <li><strong>To meet legal obligations:</strong> keeping accounting and tax records, answering lawful requests from authorities, and identity checks required by telecom rules.</li>
            <li><strong>For our legitimate interests:</strong> keeping the site secure, preventing fraud and payment abuse, fixing errors, and improving our plans and pages. We balance these interests against your rights.</li>
            <li><strong>With your consent:</strong> optional features such as remembering your recent searches, and marketing emails if you sign up for them. You can withdraw consent at any time.</li>
          </ul>
          <p>We do not use automated decision-making that produces legal or similarly significant effects on you.</p>
        </> },
        { id: "share", title: "Who we share it with", body: <>
          <p>We do not sell your personal data. We share it only with service providers who need it to deliver BLEUSIM, under contracts that require them to protect it:</p>
          <ul>
            <li><strong>eSIM network partners</strong>, to issue and activate your eSIM and report usage: <Fill>partner names</Fill>.</li>
            <li><strong>Payment provider</strong>, to take payment and prevent fraud: <Fill>provider name</Fill>.</li>
            <li><strong>Hosting and infrastructure</strong>, to run the website and databases: <Fill>provider names</Fill>.</li>
            <li><strong>Email delivery</strong>, to send your QR code, receipts and account emails: <Fill>provider name</Fill>.</li>
            <li><strong>Authorities and advisers</strong>, when the law requires it or to establish or defend legal claims.</li>
          </ul>
        </> },
        { id: "transfers", title: "International transfers", body: <>
          <p>Because eSIMs work across borders, some partners may process data outside your country. When data leaves the European Economic Area, the United Kingdom or Morocco, we use the safeguards the applicable law requires, such as adequacy decisions, standard contractual clauses or prior authorisation from the competent authority. <Fill>confirm transfer mechanisms per provider</Fill>.</p>
        </> },
        { id: "retention", title: "How long we keep it", body: <>
          <p>We keep your account data while your account is open. Order and payment records are kept for <Fill>period required by accounting and tax law</Fill>. Technical logs are kept for <Fill>e.g. 30 days</Fill> unless needed to investigate a security incident. When data is no longer needed, we delete or anonymise it.</p>
        </> },
        { id: "security", title: "How we protect it", body: <>
          <p>We use encryption in transit (HTTPS), store eSIM activation codes encrypted at rest, keep sign-in sessions in secure, HTTP-only cookies, and limit staff access by role with an audit log of administrative actions. No system is perfectly secure, so if a breach affects your data we will tell you and the authorities when the law requires it.</p>
        </> },
        { id: "rights", title: "Your rights", body: <>
          <p>Depending on where you live, you can ask us to access, correct or delete your data, restrict or object to how we use it, receive it in a portable format, and withdraw consent you gave. To exercise a right, email <Fill>privacy contact email</Fill> from the address linked to your account. We answer within the time the law requires.</p>
          <p>You can also complain to your data protection authority, for example the CNDP in Morocco or the authority in your EU country.</p>
        </> },
        { id: "children", title: "Children", body: <p>BLEUSIM is not intended for children. You must be at least 18, or the age of majority where you live, to buy a plan. We do not knowingly collect data from children.</p> },
        { id: "cookies", title: "Cookies", body: <p>We use only the cookies and browser storage needed to run the site, plus optional features you can switch off. See <a href="/cookies">Cookie Preferences</a> for the full list and your choices.</p> },
        { id: "changes", title: "Changes to this policy", body: <p>We may update this policy when our service or the law changes. We will post the new version here with a new date, and tell you by email about significant changes.</p> },
        { id: "contact", title: "Contact us", body: <p>Questions about this policy: <Fill>privacy contact email</Fill>, or by post to <Fill>company legal name and address</Fill>.</p> },
      ]}
    />
  );
}
