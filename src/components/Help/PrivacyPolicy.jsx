const PRIVACY_POLICY_SECTIONS = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide during registration and while using the app, including your name, mobile number, email address, delivery address, and order details.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use your information to create and manage your account, process orders, arrange deliveries, provide customer support, and improve our services.",
  },
  {
    title: "Payments",
    content:
      "Payments are processed through trusted third-party payment providers. We do not store complete card details or payment credentials on our servers.",
  },
  {
    title: "Location Information",
    content:
      "If location access is granted, it may be used to improve delivery services and provide location-based functionality within the app.",
  },
  {
    title: "Data Sharing",
    content:
      "We do not sell your personal information. Information may be shared with delivery partners, payment providers, and service providers only as necessary to operate the service.",
  },
  {
    title: "Data Security",
    content:
      "We take reasonable measures to protect your information from unauthorized access, disclosure, or misuse. However, no method of electronic storage or transmission is completely secure.",
  },
  {
    title: "Account Deletion",
    content:
      "Users can request deletion of their account through the app or by contacting our support team. Personal information associated with the account will be removed unless retention is required by law.",
  },
  {
    title: "Contact Us",
    content:
      "If you have questions about this Privacy Policy or how your information is handled, please contact us at kedharfarms@gmail.com.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        Legal
      </p>

      <h1 className="text-4xl font-bold mb-6">
        Privacy Policy
      </h1>

      <p className="text-lg text-gray-600 leading-8 mb-10">
        This Privacy Policy explains how Kedhar Farms collects, uses, and
        protects information when you use our application and services.
      </p>

      {PRIVACY_POLICY_SECTIONS.map((section) => (
        <section key={section.title} className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">
            {section.title}
          </h2>

          <p className="text-gray-700 leading-7">
            {section.content}
          </p>
        </section>
      ))}
    </div>
  );
}