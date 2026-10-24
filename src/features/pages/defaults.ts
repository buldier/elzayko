import type { PageContent, PageSlug } from "./schemas";

/** Default copy used by the seed and as a fallback if a page row is missing. */
export const PAGE_DEFAULTS: { [S in PageSlug]: { title: string; content: PageContent<S> } } = {
  about: {
    title: "About",
    content: {
      heading: "Looking slowly, making carefully.",
      intro:
        "Elzayko is a photographer and filmmaker working between landscape, still life and the quiet architecture of everyday rooms.",
      portraitMediaId: null,
      biography:
        "Trained in printmaking before turning to the camera, Elzayko approaches photography as a craft of patience — returning to the same places across seasons, waiting for light to settle.\n\nHer work has been shown in small independent spaces and printed in limited editions. Alongside personal projects she collaborates with makers, studios and publications who share an interest in material, texture and time.",
      philosophy:
        "Fewer images, chosen with care. Natural light where possible. Colour that feels remembered rather than invented. Every series begins with a walk and ends with a print.",
      interests: ["Landscape", "Still life", "Architecture", "Analogue film", "Printmaking", "Short documentary"],
      highlights: [
        { year: "2026", title: "Field Notes", detail: "Solo exhibition of coastal studies, printed on cotton rag." },
        { year: "2025", title: "Rooms in Winter", detail: "A short film on light in domestic interiors." },
        { year: "2024", title: "Stone & Salt", detail: "Limited-edition photobook, 200 copies." },
      ],
      ctaHeading: "Working on something together?",
      ctaText: "Commissions, collaborations and print enquiries are always welcome.",
    },
  },
  contact: {
    title: "Contact",
    content: {
      heading: "Say hello.",
      intro:
        "For commissions, collaborations, print sales or simply a conversation about the work — send a note and it will reach me directly.",
      responseTime: "I usually reply within three working days.",
      privacyNote:
        "Your name, email and message are used only to reply to you and are kept for up to twelve months. See the privacy policy for details.",
    },
  },
  privacy: {
    title: "Privacy Policy",
    content: {
      lastUpdated: "Placeholder — review before publishing",
      body: "This is placeholder text and must be reviewed by the site owner (and, where appropriate, a legal professional) before this website is used in production.\n\n## What we collect\n- Messages you send through the contact form: your name, email address, subject and message.\n- A salted, one-way hash of your IP address, used only to prevent spam and abuse.\n- Standard server logs kept by the hosting provider.\n\n## How we use it\nContact form details are used solely to respond to your enquiry. They are not sold, shared for marketing, or used for profiling.\n\n## Embedded content\nVideos from YouTube are embedded in privacy-enhanced mode. YouTube may set cookies once you start playback; their privacy policy applies.\n\n## Retention\nMessages are kept for up to twelve months and then deleted.\n\n## Your rights\nYou may ask for a copy of, correction to, or deletion of your data at any time using the contact page.",
    },
  },
  terms: {
    title: "Terms of Use",
    content: {
      lastUpdated: "Placeholder — review before publishing",
      body: "This is placeholder text and must be reviewed by the site owner (and, where appropriate, a legal professional) before this website is used in production.\n\n## Copyright\nAll photographs, films and text on this website are © Elzayko unless stated otherwise. All rights reserved.\n\n## Downloads\nSome images are offered for download. Unless a different licence is stated alongside the image, downloads are for personal, non-commercial use only. Please credit \"Elzayko\" when sharing.\n\n## External content\nSome items link to or embed content hosted on third-party platforms. Their own terms apply to that content.\n\n## Changes\nThese terms may be updated from time to time. The date above shows when they last changed.",
    },
  },
};
