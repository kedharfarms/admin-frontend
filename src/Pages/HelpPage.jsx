import { useEffect, useState } from "react";
import AccountDeletion from "../components/Help/AccountDeletion";
import PrivacyPolicy from "../components/Help/PrivacyPolicy";
import { useNavigate, useParams } from "react-router-dom";

// import PrivacyPolicy from "../Components/HelpCenter/PrivacyPolicy";
// import TermsConditions from "../Components/HelpCenter/TermsConditions";
// import ContactUs from "../Components/HelpCenter/ContactUs";

const sections = [
  {
    id: "account-deletion",
    title: "Account Deletion",
    component: AccountDeletion,
  },
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    component: PrivacyPolicy,
  },
  // {
  //   id: "terms",
  //   title: "Terms & Conditions",
  //   component: AccountDeletion,
  // },
  // {
  //   id: "contact",
  //   title: "Contact Us",
  //   component: ContactUs,
  // },
];

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState(sections[0]);

  const ActiveComponent = activeSection.component;
    
  const navigate = useNavigate();
  const { section } = useParams();

  // Update active section based on URL parameter
  useEffect(() => {
    const foundSection = sections.find((s) => s.id === section);
    if (foundSection) {
      setActiveSection(foundSection);
    } else {
      navigate("/help/account-deletion", { replace: true });
    }
  }, [section, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b flex items-center px-8">
        <h1 className="text-xl font-semibold">
          Kedhar Farms Help Center
        </h1>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <nav className="py-4 pl-5">
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => navigate(`/help/${section.id}`)}
                      className={`w-full text-left px-3 py-2 text-sm transition ${
                        activeSection.id === section.id
                          ? "border-l-2 border-green-600 text-black font-medium"
                          : "border-l-2 border-gray-200 text-gray-600 hover:text-black"
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 px-12 py-10">
          <div className="max-w-5xl">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
}