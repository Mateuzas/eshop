import Link from "next/link";

import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

// Internal placeholder routes — pages don't exist yet, add them when the
// corresponding content/phase is built.
const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "New Arrivals", href: "/products?category=new-arrivals" },
      { label: "Men", href: "/products?category=men" },
      { label: "Women", href: "/products?category=women" },
      { label: "Accessories", href: "/products?category=accessories" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Shipping & Returns", href: "/help/shipping" },
      { label: "FAQ", href: "/help/faq" },
      { label: "Contact", href: "/help/contact" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Sustainability", href: "/about/sustainability" },
    ],
  },
] as const;

// Placeholder — swap in real profile URLs when they exist.
const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border pb-safe">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Handcrafted clothing, made with care in Lithuania.
            </p>
            <NewsletterForm />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-16">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading} className="flex flex-col gap-4">
                <span className="kicker text-muted-foreground">
                  {column.heading}
                </span>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EShop. All rights reserved.
          </p>
          <div className="flex gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="kicker text-muted-foreground transition-colors hover:text-foreground"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
