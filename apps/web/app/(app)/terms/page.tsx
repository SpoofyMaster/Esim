import type { Metadata } from "next";
import { Fill, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service", description: "The terms that apply when you buy and use a BLEUSIM eSIM data plan.", alternates: { canonical: "/terms" } };

export default function Page() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="26 November 2026"
      intro={<>
        <p>These Terms of Service (“Terms”) form the agreement between you and <Fill>company legal name</Fill> (“BLEUSIM”, “we”, “us”) when you use bleusim.com, create an account, or buy or use a BLEUSIM eSIM data plan. By placing an order you accept these Terms. Please also read our <a href="/privacy">Privacy Policy</a>.</p>
      </>}
      sections={[
        { id: "service", title: "The service", body: <>
          <p>BLEUSIM sells prepaid, data-only eSIM plans for travel. Each plan states its data allowance, validity period, covered countries, network technology, hotspot rules, activation window and any identity-check requirement before you buy.</p>
          <p>Plans are delivered through mobile network partners. Coverage, speed and availability depend on local networks, your device, your location and network conditions, and can vary. Plans do not include a phone number, calls or SMS.</p>
        </> },
        { id: "account", title: "Eligibility and your account", body: <>
          <p>You must be at least 18, or the age of majority where you live, to buy a plan. You are responsible for keeping your sign-in details safe and for activity on your account. Tell us straight away at <Fill>support email</Fill> if you think someone else has accessed it.</p>
        </> },
        { id: "device", title: "Device compatibility", body: <>
          <p>Before buying, check that your phone supports eSIM and is not locked to a carrier. An eSIM installed on an incompatible or locked device may not work, and this is not a fault in the service.</p>
        </> },
        { id: "orders", title: "Orders, prices and payment", body: <>
          <p>Prices are shown in the currency displayed at checkout and include <Fill>applicable taxes, e.g. VAT, where required</Fill>. You pay in full when you order, through our payment provider. Your order is accepted when we confirm it by email or on your order page. We may refuse or cancel an order that appears fraudulent, in which case any payment is refunded.</p>
        </> },
        { id: "activation", title: "Delivery, installation and activation", body: <>
          <ul>
            <li>After payment, we show your eSIM QR code and manual installation details on your order page and send them by email.</li>
            <li>Install the eSIM while you have a stable internet connection, ideally before you travel. Each eSIM can usually be installed only once, so do not delete it after installing.</li>
            <li>A plan activates when the eSIM first connects to a supported network in a covered country, or at the end of the activation window stated for the plan, whichever comes first. The validity period starts at activation.</li>
            <li>Unused data expires at the end of the validity period and cannot be carried over or refunded, except as set out in section 8.</li>
          </ul>
        </> },
        { id: "use", title: "Fair and acceptable use", body: <>
          <p>Plans are for personal use by travellers. You must not resell plans, use them for automated or machine-to-machine traffic, run servers, send spam, or use the service for anything unlawful or that harms the network. Unlimited plans may be subject to the fair-use limits shown on the plan, after which speed can be reduced. We may suspend a plan that is used in breach of this section.</p>
        </> },
        { id: "topups", title: "Top-ups", body: <p>Where a plan offers top-ups, you can add data to the same eSIM from My eSIMs. Each top-up is a separate purchase under these Terms, with its own allowance and validity as shown before you pay.</p> },
        { id: "refunds", title: "Cancellations and refunds", body: <>
          <p>Because an eSIM is a digital service delivered immediately, you may lose the right to cancel once the eSIM is installed or activated, where the law allows this. We will refund a plan if <Fill>refund conditions, e.g. the eSIM has not been installed and you ask within 30 days of purchase</Fill>, or if we cannot provide the service because of a fault on our side or our partner’s.</p>
          <p>To request a refund, contact <Fill>support email</Fill> with your order number. Refunds go back to the original payment method. Nothing in these Terms limits your statutory consumer rights.</p>
        </> },
        { id: "availability", title: "Service availability", body: <p>We work to keep BLEUSIM available and reliable, but we cannot guarantee uninterrupted service, coverage in every location, or particular speeds, because these depend on third-party networks and conditions outside our control. We may carry out maintenance or change partners to keep the service running.</p> },
        { id: "liability", title: "Our liability", body: <p>We are responsible for losses that are a foreseeable result of our breach of these Terms or our negligence. We are not responsible for losses that were not foreseeable, for business losses, or for losses caused by events outside our reasonable control. <Fill>liability cap, e.g. the amount you paid for the affected plan</Fill>, except where the law does not allow liability to be limited, such as for death or personal injury caused by negligence, or fraud.</p> },
        { id: "suspension", title: "Suspension and termination", body: <p>You can close your account at any time. We may suspend or close an account, or a plan, if you seriously or repeatedly breach these Terms, if required by law or a network partner for legal or security reasons, or to prevent fraud. Where possible we will tell you first and explain why.</p> },
        { id: "ip", title: "Intellectual property", body: <p>The BLEUSIM name, logo, website design, text, images and software belong to us or our licensors. You may use the site for its intended purpose, but you may not copy, modify or redistribute it without our permission.</p> },
        { id: "changes", title: "Changes to these Terms", body: <p>We may update these Terms. The version that applies to an order is the one shown when you placed it. We will tell you about significant changes to terms that affect active plans before they take effect.</p> },
        { id: "law", title: "Governing law and disputes", body: <p>These Terms are governed by the laws of <Fill>governing law</Fill>. If you are a consumer, you also keep the protection of the mandatory laws of the country where you live, and may bring proceedings there. Please contact us first so we can try to resolve any issue.</p> },
        { id: "contact", title: "Contact us", body: <p><Fill>company legal name</Fill>, <Fill>address</Fill>. Email: <Fill>support email</Fill>.</p> },
      ]}
    />
  );
}
