// Legal documents (English). DRAFTS: written for BLEUSIM from scratch, structured after common travel-eSIM practice.
// Text in [square brackets] is a placeholder that must be completed, and every document needs review by a lawyer before launch.
export type Block = string | { list: string[] } | { table: { head: string[]; rows: string[][] } };
export interface LegalSection { id: string; title: string; blocks: Block[] }
export interface LegalDoc { title: string; updated: string; intro: string; sections: LegalSection[] }

const COMPANY = "[BLEUSIM legal entity name], [registered address], [company registration number]";

export const PRIVACY: LegalDoc = {
  title: "Privacy Policy",
  updated: "2026-11-26",
  intro: "This policy explains what personal data BLEUSIM collects when you visit our website, buy an eSIM data plan or contact us, why we use it, who we share it with and the choices you have. We collect only what we need to sell, deliver and support your eSIM.",
  sections: [
    { id: "who-we-are", title: "1. Who we are", blocks: [
      `BLEUSIM is operated by ${COMPANY} (“BLEUSIM”, “we”, “us”). We are the controller of the personal data described in this policy.`,
      "If you have a question about this policy or your data, contact us using the details in section 12.",
    ] },
    { id: "data-we-collect", title: "2. Personal data we collect", blocks: [
      "Depending on how you use BLEUSIM, we collect the following categories of data:",
      { list: [
        "Account data: your email address, a securely hashed password and your account preferences.",
        "Order data: the plans you buy, the destination, order amounts, currency, date and time, and the eSIM identifiers (such as the ICCID) assigned to your purchase.",
        "Payment data: payments are handled by our payment provider. We receive a payment reference, the payment status and limited card details (such as card brand and last four digits). We never see or store your full card number.",
        "Usage data for your eSIM: the data consumed on your plan and its activation status, received from our network partners so we can show your remaining data and validity.",
        "Support data: messages you send us and the details you share when asking for help.",
        "Technical data: IP address, browser type, device type, language and pages visited, collected through server logs and the essential storage described in our Cookie Preferences page.",
      ] },
      "We do not collect your location from your phone, the content of your browsing, or the websites and apps you use over your eSIM connection.",
    ] },
    { id: "how-we-use", title: "3. How and why we use your data", blocks: [
      { list: [
        "To create and secure your account and sign you in (performance of a contract).",
        "To process your order, take payment, issue your eSIM and deliver the QR code and installation details (performance of a contract).",
        "To show your data balance, process top-ups and help when something goes wrong (performance of a contract).",
        "To prevent fraud, abuse and payment chargebacks, and to keep our services secure (legitimate interests).",
        "To keep accounting and tax records and respond to lawful requests from authorities (legal obligation).",
        "To send service emails about your orders. Marketing emails are sent only if you opt in, and you can unsubscribe at any time (consent).",
        "To understand and improve how our website performs, using aggregated information (legitimate interests).",
      ] },
    ] },
    { id: "sharing", title: "4. Who we share data with", blocks: [
      "We do not sell your personal data. We share it only with service providers who need it to run BLEUSIM, under contracts that require them to protect it:",
      { list: [
        "Mobile network partners and eSIM platforms, to issue and activate your eSIM and report usage.",
        "Our payment provider, to process payments and prevent fraud.",
        "Hosting, email and customer support providers who process data on our behalf.",
        "Professional advisers, and authorities or courts when the law requires it.",
        "A buyer or successor if BLEUSIM is involved in a merger or sale, subject to this policy.",
      ] },
      "Current providers: [list of processors and their countries].",
    ] },
    { id: "transfers", title: "5. International transfers", blocks: [
      "Travel eSIMs work with networks around the world, so some data may be processed outside your country. When we transfer personal data from the European Economic Area, the United Kingdom or Morocco, we use safeguards recognised by law, such as adequacy decisions or standard contractual clauses.",
    ] },
    { id: "retention", title: "6. How long we keep data", blocks: [
      { list: [
        "Account data: for as long as your account is open, then deleted or anonymised within [period] of closure.",
        "Order and payment records: for as long as tax and accounting law requires, typically [number] years.",
        "Support messages: [period] after the conversation ends.",
        "Server logs: [period].",
      ] },
    ] },
    { id: "security", title: "7. Security", blocks: [
      "We protect your data with encryption in transit (HTTPS), hashed passwords, access controls for staff and regular security reviews. No system is perfectly secure; if a breach affects your data, we will notify you and the relevant authorities as the law requires.",
    ] },
    { id: "your-rights", title: "8. Your rights", blocks: [
      "Depending on where you live, you may have the right to:",
      { list: [
        "access the personal data we hold about you and receive a copy;",
        "correct inaccurate data;",
        "delete your data, subject to records we must keep by law;",
        "object to or restrict certain processing;",
        "receive your data in a portable format;",
        "withdraw consent at any time, without affecting processing that already happened.",
      ] },
      "European Economic Area and United Kingdom: you can also complain to your local data protection authority.",
      "Morocco: you have the rights of access, rectification and objection under Law 09-08, and you can contact the CNDP.",
      "United States: residents of states with privacy laws (such as California) can request access to or deletion of their data and are not discriminated against for doing so. We do not sell or share personal data for cross-context behavioural advertising.",
      "To exercise a right, email us at [privacy contact email]. We may need to verify your identity and will reply within the time the law requires.",
    ] },
    { id: "children", title: "9. Children", blocks: [
      "BLEUSIM is not intended for children under 16, and we do not knowingly collect their data. If you believe a child has given us personal data, contact us and we will delete it.",
    ] },
    { id: "cookies", title: "10. Cookies and similar technologies", blocks: [
      "We use only the storage needed to run the website, such as keeping you signed in and remembering your recent searches. See our Cookie Preferences page for the full list and your choices.",
    ] },
    { id: "changes", title: "11. Changes to this policy", blocks: [
      "We may update this policy when our services or the law change. We will post the new version here with a new date and, for important changes, tell you by email or on the website.",
    ] },
    { id: "contact", title: "12. Contact us", blocks: [
      `${COMPANY}. Email: [privacy contact email]. Data protection officer (if appointed): [name and contact].`,
    ] },
  ],
};

export const TERMS: LegalDoc = {
  title: "Terms of Service",
  updated: "2026-11-26",
  intro: "These terms are the agreement between you and BLEUSIM when you use our website and buy or use an eSIM data plan. Please read them before you buy. By placing an order you accept these terms.",
  sections: [
    { id: "about", title: "1. About these terms", blocks: [
      `The service is provided by ${COMPANY}. These terms apply together with our Privacy Policy and the plan details shown before you buy. If they conflict, the plan details shown at checkout apply to that plan.`,
    ] },
    { id: "service", title: "2. The service", blocks: [
      "BLEUSIM sells prepaid mobile data plans delivered as eSIM profiles for use while travelling. Plans are data only: they do not include a phone number, voice calls or SMS unless the plan clearly says so.",
      "Data connectivity is provided by our mobile network partners in each destination. BLEUSIM is not itself a mobile network operator.",
    ] },
    { id: "account", title: "3. Eligibility and your account", blocks: [
      "You must be at least 18 years old, or the age of majority where you live, to buy a plan. Keep your sign-in details confidential; you are responsible for activity on your account. Tell us straight away if you think your account has been misused.",
    ] },
    { id: "compatibility", title: "4. Device compatibility", blocks: [
      "To use BLEUSIM your device must support eSIM and must not be locked to a carrier. It is your responsibility to check compatibility before you buy. Some features, such as hotspot sharing, depend on your device and on the plan.",
    ] },
    { id: "plans", title: "5. Plans, installation, activation and validity", blocks: [
      { list: [
        "Each plan shows its data allowance, validity period, covered countries, network technology and activation rules before you buy.",
        "After payment we provide a QR code or installation link. An eSIM profile can usually be installed only once; do not delete it from your device while you still need it.",
        "A plan starts when the eSIM first connects to a supported network in a covered country, or at the latest at the end of the activation window shown with the plan, whichever happens first.",
        "Validity runs from activation. Unused data expires at the end of the validity period and cannot be carried over or exchanged for cash.",
        "Where a destination legally requires identity verification, you must complete it before the eSIM can be used there.",
      ] },
    ] },
    { id: "prices", title: "6. Prices and payment", blocks: [
      "Prices are shown in the currency you select and include applicable taxes unless stated otherwise. You pay in full at checkout through our payment provider. We may change prices for future purchases, but the price you paid applies to your order.",
    ] },
    { id: "refunds", title: "7. Cancellations and refunds", blocks: [
      { list: [
        "You can request a full refund for a plan that has not been installed or activated within [refund window] of purchase.",
        "Because an eSIM is a digital service that starts when it is installed or connects, you agree that your right of withdrawal ends once the eSIM is installed or activated, where the law allows this.",
        "If a plan does not work because of a fault on our side or our network partner’s side and we cannot fix it, we will refund the unused part of the plan or offer a replacement.",
        "Refunds are not available for plans that worked but were not fully used, or for problems caused by an incompatible or locked device.",
      ] },
      "To request a refund, contact us at [support email] with your order number.",
    ] },
    { id: "fair-use", title: "8. Fair use and acceptable use", blocks: [
      "Plans are for personal use while travelling. Unlimited plans are subject to the fair-use limits shown with the plan, after which speeds may be reduced. You must not use the service:",
      { list: [
        "for anything illegal, fraudulent or harmful;",
        "to resell, share commercially or run automated or machine-to-machine traffic, unless agreed in writing;",
        "to send spam, attack networks or interfere with other users;",
        "in a way that breaks the rules of the network partner in the destination.",
      ] },
    ] },
    { id: "coverage", title: "9. Coverage and service quality", blocks: [
      "We show coverage and network information supplied by our partners. Mobile coverage and speed vary with location, network load, buildings, terrain and your device, so we cannot guarantee uninterrupted service everywhere. Planned maintenance or events outside our control may affect the service.",
    ] },
    { id: "suspension", title: "10. Suspension and termination", blocks: [
      "We may suspend or end the service if you seriously break these terms, if we suspect fraud, or if the law or a network partner requires it. Where possible we will tell you first. You can close your account at any time; closing it does not refund plans you have already used.",
    ] },
    { id: "ip", title: "11. Intellectual property", blocks: [
      "The BLEUSIM name, logo, website, globe experience and content belong to BLEUSIM or its licensors. You may use them only to use the service as intended.",
    ] },
    { id: "disclaimers", title: "12. Disclaimers", blocks: [
      "Except as stated in these terms and to the extent the law allows, the service is provided “as is”. Nothing in these terms affects the rights you have as a consumer under the law of the country where you live.",
    ] },
    { id: "liability", title: "13. Limitation of liability", blocks: [
      "We are responsible for loss that is a foreseeable result of our breaking these terms or failing to use reasonable care. To the extent the law allows, our total liability for any claim relating to a plan is limited to the amount you paid for that plan. We are not liable for indirect losses, or for losses caused by your device, third-party apps or events outside our reasonable control. Nothing limits liability that cannot be limited by law, such as for death or personal injury caused by negligence, or for fraud.",
    ] },
    { id: "changes", title: "14. Changes to these terms", blocks: [
      "We may update these terms. The version shown when you place an order applies to that order. We will tell you about important changes in advance where the law requires it.",
    ] },
    { id: "law", title: "15. Governing law and disputes", blocks: [
      "These terms are governed by the laws of [country]. If you are a consumer, you also keep the protection of the mandatory laws of the country where you live and can bring a claim in your local courts. Please contact us first; most issues can be solved quickly. EU consumers can also use their national consumer dispute resolution bodies.",
    ] },
    { id: "contact", title: "16. Contact us", blocks: [
      `${COMPANY}. Email: [support email].`,
    ] },
  ],
};

export const COOKIES: LegalDoc = {
  title: "Cookie Policy",
  updated: "2026-11-26",
  intro: "This page explains the cookies and similar browser storage BLEUSIM uses and lets you choose which optional categories you allow.",
  sections: [
    { id: "what", title: "1. What cookies are", blocks: [
      "Cookies are small text files a website stores in your browser. Similar technologies, such as local storage, keep information on your device in the same way. Some are essential to make a website work; others are optional and used for analytics or advertising.",
    ] },
    { id: "what-we-use", title: "2. What BLEUSIM uses today", blocks: [
      "BLEUSIM currently uses only essential and functional storage. We do not use analytics or advertising cookies, and no third-party trackers are loaded on our pages.",
      { table: { head: ["Name", "Type", "Purpose", "Duration"], rows: [
        ["bs_session", "Essential cookie", "Keeps you signed in to your account securely.", "30 days"],
        ["bleusim.cookieConsent", "Essential (local storage)", "Remembers the choices you make on this page.", "Until you clear it"],
        ["bleusim.recent", "Functional (local storage)", "Remembers your recent destination searches on this device.", "Until you clear it"],
      ] } },
    ] },
    { id: "optional", title: "3. Optional categories", blocks: [
      "If we add analytics or marketing tools in the future, they will stay off until you allow them here, and this page will list each one before it is used.",
    ] },
    { id: "control", title: "4. Other ways to control cookies", blocks: [
      "You can also delete or block cookies in your browser settings. Blocking essential storage may stop parts of the site, such as signing in, from working.",
    ] },
    { id: "contact", title: "5. Contact us", blocks: [
      "Questions about cookies? Email [privacy contact email]. See our Privacy Policy for more about how we handle personal data.",
    ] },
  ],
};
