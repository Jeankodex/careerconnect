import Link from "next/link";
import { Briefcase, Mail, Phone, MapPin } from "lucide-react";
import {
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaGithub,
} from "react-icons/fa";

const footerSections = {
  product: {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
  },
  company: {
    title: "Company",
    links: ["About", "Careers", "Press", "Blog", "Contact"],
  },
  resources: {
    title: "Resources",
    links: [
      "Help Center",
      "Documentation",
      "API Status",
      "Community",
      "Security",
    ],
  },
  legal: {
    title: "Legal",
    links: [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "GDPR",
      "Accessibility",
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Briefcase className="h-5 w-5 text-white" />
              </div>

              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent">
                CareerConnect
              </span>
            </Link>

            <p className="mb-4 text-sm">
              Connecting talented professionals with innovative companies
              worldwide.
            </p>

            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Twitter"
                className="transition hover:text-blue-400"
              >
                <FaTwitter className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="transition hover:text-blue-400"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="transition hover:text-blue-400"
              >
                <FaFacebook className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="GitHub"
                className="transition hover:text-blue-400"
              >
                <FaGithub className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Navigation */}
          {Object.values(footerSections).map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 font-semibold text-white">
                {section.title}
              </h3>

              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition hover:text-blue-400"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="mt-8 border-t border-gray-800 pt-8">
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="break-all">support@careerconnect.com</span>
            </div>

            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} CareerConnect. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
