// Shared by the sign in, sign up and auth shell examples: made-up Acme customers (initials stand in for photos) and the
// generic sign in options an app might offer. Apps pass their own provider marks.
import type { AuthTestimonial } from "@/components/site/auth-shell";

export const ACME_TESTIMONIALS: AuthTestimonial[] = [
  { name: "Riley Park", company: "Founder @ Northwind", quote: "We had Acme wired into our onboarding in an afternoon. The docs answered every question before we had to ask it." },
  { name: "Sam Ortega", company: "Engineering lead @ Fernhill", quote: "Switching took less than a day. The API is clean, and the dashboard makes it easy to see what each request did." },
  { name: "Jordan Lee", company: "CTO @ Brightline", quote: "Our agents finally get clean data from every page. Acme removed a whole service we used to maintain." },
  { name: "Avery Chen", company: "Staff engineer @ Lumen", quote: "Self serve sign up, a key right away and great examples. We were testing with real traffic within the hour." },
];
