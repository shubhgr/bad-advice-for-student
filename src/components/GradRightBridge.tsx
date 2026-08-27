"use client";

import Image from "next/image";
import { useAppStoreUrl } from "@/hooks/useAppStoreUrl";
import { trackAppDownloadClick } from "@/lib/track";

const FEATURES = [
  {
    id: "shortlist",
    icon: "school",
    label: "SHORTLIST",
    detail: "Find universities",
  },
  {
    id: "finance",
    icon: "payments",
    label: "FINANCE",
    detail: "Explore funding options",
  },
  {
    id: "learn",
    icon: "menu_book",
    label: "LEARN",
    detail: "Discover courses & certifications",
  },
  {
    id: "connect",
    icon: "groups",
    label: "CONNECT",
    detail: "Meet like-minded students",
  },
] as const;

export default function GradRightBridge({ userName }: { userName?: string }) {
  const appStoreUrl = useAppStoreUrl();

  function handleAppLinkClick(button: string) {
    trackAppDownloadClick({
      href: appStoreUrl,
      location: "bridge",
      button,
      name: userName,
    });
  }

  return (
    <div className="bridge-screen animate-fade-in">
      <div className="bridge-content">
        <a
          href="https://gradright.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bridge-logo-link"
          aria-label="Visit GradRight website"
        >
          <Image
            src="/gradright-logo.svg"
            alt="GradRight"
            width={140}
            height={32}
            className="bridge-logo"
            priority
          />
        </a>

        <div className="bridge-pitch">
          <h2 className="bridge-headline">
            <span className="bridge-headline-strong">
              Education is a second chance
            </span>
            <span className="bridge-headline-soft">
              sometimes in a degree, sometimes in a certificate
            </span>
          </h2>

          <div className="bridge-features" role="list">
            {FEATURES.map((feature) => (
              <a
                key={feature.id}
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bridge-feature"
                role="listitem"
                data-track="bad_advice_download_click"
                aria-label={`${feature.label}: ${feature.detail}`}
                onClick={() => handleAppLinkClick(feature.label)}
              >
                <span
                  className="material-symbols-outlined bridge-feature-icon"
                  aria-hidden="true"
                >
                  {feature.icon}
                </span>
                <span className="bridge-feature-label">{feature.label}</span>
                <span className="bridge-feature-detail">{feature.detail}</span>
              </a>
            ))}
          </div>
        </div>

        <section className="bridge-cta-section">
          <p className="bridge-body">
            Whether you&apos;re figuring out your university, funding your
            education, building your profile or simply trying to decide
            what&apos;s next...
          </p>

          <div className="bridge-cta-block">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bridge-cta-btn"
              data-track="bad_advice_download_click"
              onClick={() => handleAppLinkClick("Download the App now!")}
            >
              Download the App now!
            </a>
          </div>
        </section>
      </div>

      <footer className="bridge-trust" aria-label="Trust badges">
        <p className="good-advice-trust-headline">
          Trusted by 2.5 lakh students
        </p>
        <div className="good-advice-trust-row">
          <div className="good-advice-trust-item">
            <span className="good-advice-trust-icon-wrap" aria-hidden="true">
              <Image
                src="/images/google-favicon.svg"
                alt=""
                width={34}
                height={34}
                className="good-advice-trust-icon"
              />
            </span>
            <div className="good-advice-trust-copy">
              <p className="good-advice-trust-title">Google Rating</p>
              <div className="good-advice-trust-rating">
                <span className="good-advice-trust-score">4.8</span>
                <span className="good-advice-trust-stars" aria-hidden="true">
                  ★★★★★
                </span>
              </div>
            </div>
          </div>

          <div className="good-advice-trust-item">
            <span className="good-advice-trust-icon-wrap" aria-hidden="true">
              <Image
                src="/images/iso-27001.png"
                alt=""
                width={34}
                height={34}
                className="good-advice-trust-icon"
              />
            </span>
            <div className="good-advice-trust-copy">
              <p className="good-advice-trust-title">ISO Certified</p>
              <span className="good-advice-trust-verified" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8" fill="#22c55e" />
                  <path
                    d="M5.5 9.2l2.1 2.1 4.9-4.9"
                    stroke="#14532d"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
