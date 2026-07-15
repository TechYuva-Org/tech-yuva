import { db } from "./index.ts";
import { 
  siteSettings, 
  seoSettings, 
  heroContent, 
  founderContent, 
  homepageSettings, 
  aboutCards, 
  offerings, 
  gallery, 
  sponsors, 
  testimonials, 
  announcements,
  analyticsSnapshots
} from "./schema.ts";
import { sql } from "drizzle-orm";

export async function seedCMSDatabase() {
  try {
    console.log("[CMS-SEED] Checking site settings population...");
    const existingSettings = await db.execute(sql`SELECT count(*) FROM site_settings`);
    const count = Number(existingSettings.rows[0]?.count || 0);

    if (count > 0) {
      console.log("[CMS-SEED] CMS Database tables already seeded.");
      return;
    }

    console.log("[CMS-SEED] Empty CMS tables detected. Seeding high-fidelity default corporate records...");

    // 1. Seed Site Settings
    const defaultSiteSettings = {
      id: "global",
      communityName: "Tech Yuva",
      logo: "▲",
      themeColors: JSON.stringify({
        primary: "#1E90FF",
        secondary: "#FF7A00",
        accent: "#00BFFF",
        emerald: "#22C55E",
        bgPrimary: "#0A0A0A",
        bgSecondary: "#111827"
      }),
      contactEmail: "dakshchaudhary2668@gmail.com",
      contactPhone: "+91 99999 99999",
      contactAddress: "New Delhi Grid, NCR Area, IN",
      socialLinks: JSON.stringify({
        github: "https://github.com",
        twitter: "https://twitter.com",
        discord: "https://discord.gg"
      }),
      footerText: "The flagship student-led innovation guild empowering developers to launch real systems securely.",
      registrationToggle: true,
      maintenanceMode: false
    };

    await db.insert(siteSettings).values(defaultSiteSettings).onConflictDoNothing();

    // 2. Seed SEO Settings
    const defaultSeoSettings = {
      id: "global",
      metaTitle: "Tech Yuva - Where Youth Meet To Build Future Tech",
      metaDescription: "The premier developer community for young tech architects, organizing physical 36-hour hackathons, API-focused bootcamps, and direct startup incubation grants.",
      ogImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop",
      keywords: "Tech Yuva, Developer, Hackathon, Web3, Generative AI, Bootcamps, Incubation, Lakshay Soni, Daksh Chaudhary",
      canonicalUrl: "https://techyuva.org",
      jsonLd: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "Tech Yuva",
        "url": "https://techyuva.org",
        "logo": "https://techyuva.org/logo.png"
      })
    };

    await db.insert(seoSettings).values(defaultSeoSettings).onConflictDoNothing();

    // 3. Seed Hero Content
    const defaultHeroContent = {
      id: "global",
      badge: "COHORT 2026 ACTIVE",
      title: "TECH YUVA",
      subtitle: "Where Youth Meet To Build Future Tech",
      description: "An elite technology incubator and developer ecosystem curated fully by young creators and student software-craft engineers.",
      ctaButton1Text: "SECURE PASS",
      ctaButton1Link: "#upcoming-events-section",
      ctaButton2Text: "ARCHITECT SPECS",
      ctaButton2Link: "#architect-specs",
      announcementBanner: "📢 ANNOUNCEMENT: YuvaHack 2026 physical passes are officially live now! Register before seats exhaust.",
      stats: JSON.stringify([
        { label: "Active Builders", value: "500+" },
        { label: "Workshops", value: "20+" },
        { label: "Funding Grants", value: "$25K+" }
      ]),
      mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
      terminalCode: `const yuva = {
  dream: "Build Future Tech",
  activeBuilders: 500,
  niches: ["GenAI", "Web3", "SaaS"],
  launch: () => "🚀 Ready to deploy on port 3000"
};`
    };

    await db.insert(heroContent).values(defaultHeroContent).onConflictDoNothing();

    // 4. Seed Founder Content
    const defaultFounderContent = {
      id: "global",
      name: "Lakshay Soni",
      role: "Lead Architect & Founder",
      photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=600&auto=format&fit=crop",
      introVideo: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34281-large.mp4",
      quote: "Tech Yuva is built to bypass standard academic limits and expose student developers directly to elite Silicon Valley style architectures.",
      biography: "Lakshay is a youth software architect and open-source enthusiast organizing physical hacker camps and building secure serverless engines."
    };

    await db.insert(founderContent).values(defaultFounderContent).onConflictDoNothing();

    // 5. Seed Homepage Core settings
    const defaultHomepageSettings = {
      id: "global",
      heroContentId: "global",
      founderContentId: "global",
      seoSettingsId: "global",
      siteSettingsId: "global"
    };

    await db.insert(homepageSettings).values(defaultHomepageSettings).onConflictDoNothing();

    // 6. Seed About Cards
    const defaultAboutCards = [
      {
        id: "a1",
        heading: "Innovation First",
        description: "Work alongside multi-agent LLM systems, write smart contracts, and explore edge deployments using modern full-stack architectures.",
        icon: "cpu",
        displayOrder: 1,
        image: ""
      },
      {
        id: "a2",
        heading: "Youth Community",
        description: "Connect directly with corporate leaders and student coders. Tech Yuva brings high-calibre developer guilds directly to young students.",
        icon: "users",
        displayOrder: 2,
        image: ""
      },
      {
        id: "a3",
        heading: "Startup Path",
        description: "Refine, pitch, and scale your concepts. Get direct funding fellowships, angel reviews, and server deployment sponsorships for student MVPs.",
        icon: "award",
        displayOrder: 3,
        image: ""
      }
    ];

    for (const card of defaultAboutCards) {
      await db.insert(aboutCards).values(card).onConflictDoNothing();
    }

    // 7. Seed Offerings
    const defaultOfferings = [
      {
        id: "o1",
        title: "36-Hour Hackathons",
        description: "Join hundreds of intense student teams in our iconic annual sprints. Code non-stop, build genuine database-driven apps, eat pizza, and win cash seeds.",
        icon: "code",
        displayOrder: 1,
        status: "active" as const
      },
      {
        id: "o2",
        title: "API Workshops",
        description: "No empty theory. We write live server logic and compile files directly on host port levels to see code run.",
        icon: "terminal",
        displayOrder: 2,
        status: "active" as const
      },
      {
        id: "o3",
        title: "Corporate Tech Talks",
        description: "Direct syncs with elite architects modeling web platforms and explaining system-level file behaviors.",
        icon: "presentation",
        displayOrder: 3,
        status: "active" as const
      },
      {
        id: "o4",
        title: "Generative AI Bootcamps",
        description: "Master natural language embeddings, structured schemas, model temperature tuning, tool-calling APIs, and streaming interfaces securely using server-side proxies.",
        icon: "cpu",
        displayOrder: 4,
        status: "active" as const
      }
    ];

    for (const off of defaultOfferings) {
      await db.insert(offerings).values(off).onConflictDoNothing();
    }

    // 8. Seed Gallery Items
    const defaultGallery = [
      {
        id: "g1",
        title: "Grand Hackathon Stage",
        category: "YuvaHack 2025",
        statLabel: "Active Hackers",
        statValue: "340+",
        mediaType: "image" as const,
        mediaUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop",
        highlightText: "Teams built 80+ working prototypes integrated in just 36 sleep-deprived hours.",
        featured: true
      },
      {
        id: "g2",
        title: "Intense Pitch Arena",
        category: "Startup Nights V2",
        statLabel: "Founders Funded",
        statValue: "4 Teams",
        mediaType: "image" as const,
        mediaUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop",
        highlightText: "Four student projects secured incubation grants totaling $25,000.",
        featured: true
      },
      {
        id: "g3",
        title: "Hands-On GenAI Labs",
        category: "Bootcamp V1",
        statLabel: "Students Certified",
        statValue: "180+",
        mediaType: "image" as const,
        mediaUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop",
        highlightText: "Participants built client proxy endpoints utilizing server-side API configurations.",
        featured: true
      },
      {
        id: "g4",
        title: "Networking & Mentorship",
        category: "Elite Mixer",
        statLabel: "Industry Mentors",
        statValue: "15+",
        mediaType: "image" as const,
        mediaUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=600&auto=format&fit=crop",
        highlightText: "Direct speed-mentorship linking corporate engineers to fresh student builders.",
        featured: true
      }
    ];

    for (const gal of defaultGallery) {
      await db.insert(gallery).values(gal).onConflictDoNothing();
    }

    // 9. Seed Sponsors
    const defaultSponsors = [
      {
        id: "s1",
        name: "Vercel",
        logo: "▲",
        website: "https://vercel.com",
        tier: "platinum" as const,
        displayOrder: 1,
        featured: true,
        statusText: "Premier Partner",
        contribution: "Cloud hosting & Edge credits sponsor",
        domain: "Frontends"
      },
      {
        id: "s2",
        name: "Linear",
        logo: "⧉",
        website: "https://linear.app",
        tier: "gold" as const,
        displayOrder: 2,
        featured: true,
        statusText: "Workflow Supporter",
        contribution: "Community project management licenses provider",
        domain: "Issue Tracking"
      },
      {
        id: "s3",
        name: "Stripe",
        logo: "💳",
        website: "https://stripe.com",
        tier: "platinum" as const,
        displayOrder: 3,
        featured: true,
        statusText: "Prize Sponsor",
        contribution: "Hackathon prize pool & processing provider",
        domain: "Payments Node"
      },
      {
        id: "s4",
        name: "GitHub",
        logo: "🐙",
        website: "https://github.com",
        tier: "platinum" as const,
        displayOrder: 4,
        featured: true,
        statusText: "Ecosystem Supporter",
        contribution: "Student Developer Pack and merchandise provider",
        domain: "Developer Tools"
      }
    ];

    for (const sps of defaultSponsors) {
      await db.insert(sponsors).values(sps).onConflictDoNothing();
    }

    // 10. Seed Testimonials
    const defaultTestimonials = [
      {
        id: "t1",
        name: "Siddharth Mehta",
        role: "Lead UI Developer / Hackathon Winner",
        organization: "BuildFuture Labs",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop",
        rating: 5,
        quote: "Tech Yuva changed my developer trajectory. I went from tweaking styling files to leading a multi-framework React App that got acquired right out of a 36-hour hackathon! The networking here is unparalleled.",
        approved: true,
        displayOrder: 1
      },
      {
        id: "t2",
        name: "Ananya Iyer",
        role: "AI Research Fellow",
        organization: "Nexis Cognitive",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
        rating: 5,
        quote: "The workshops aren't just generic slideshows. We write actual server-side API routes, inspect tokens, and integrate complex models. You build alongside world-class mentors who actually code.",
        approved: true,
        displayOrder: 2
      },
      {
        id: "t3",
        name: "Kabir Sen",
        role: "Student Founder",
        organization: "Plutos.co",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
        rating: 5,
        quote: "Startup Culture is baked into Tech Yuva. I pitched Plutos at Accelerator Day to real angel investors and got my initial check. The advice and community standard here feels exactly like Silicon Valley.",
        approved: true,
        displayOrder: 3
      }
    ];

    for (const tes of defaultTestimonials) {
      await db.insert(testimonials).values(tes).onConflictDoNothing();
    }

    // 11. Seed Announcement
    const defaultAnn = {
      id: "ann-1",
      title: "YuvaHack 2026 Registration Open!",
      message: "Secure your physical developer passes for YuvaHack 2026. Limited seats remain!",
      enabled: true,
      type: "urgent" as const,
      createdAt: new Date()
    };

    await db.insert(announcements).values(defaultAnn).onConflictDoNothing();

    // 12. Seed Analytics snapshots for beautiful charts
    const snapshotDays = ["2026-07-03", "2026-07-04", "2026-07-05", "2026-07-06", "2026-07-07", "2026-07-08", "2026-07-09"];
    const baseStats = [
      { vis: 450, reg: 85, mem: 410, evs: 18, cert: 130, sps: 4 },
      { vis: 480, reg: 90, mem: 425, evs: 18, cert: 132, sps: 4 },
      { vis: 510, reg: 94, mem: 440, evs: 19, cert: 135, sps: 4 },
      { vis: 550, reg: 102, mem: 460, evs: 19, cert: 140, sps: 4 },
      { vis: 620, reg: 110, mem: 480, evs: 20, cert: 145, sps: 4 },
      { vis: 690, reg: 118, mem: 495, evs: 20, cert: 148, sps: 4 },
      { vis: 740, reg: 124, mem: 512, evs: 21, cert: 154, sps: 4 }
    ];

    for (let i = 0; i < snapshotDays.length; i++) {
      await db.insert(analyticsSnapshots).values({
        id: `snap-${snapshotDays[i]}`,
        date: snapshotDays[i],
        visitorsCount: baseStats[i].vis,
        registrationsCount: baseStats[i].reg,
        activeMembersCount: baseStats[i].mem,
        eventsCount: baseStats[i].evs,
        certificatesCount: baseStats[i].cert,
        sponsorsCount: baseStats[i].sps,
        createdAt: new Date(snapshotDays[i] + "T00:00:00.000Z")
      }).onConflictDoNothing();
    }

    console.log("[CMS-SEED] All CMS database tables seeded successfully!");
  } catch (err) {
    console.error("[CMS-SEED] Seeding error:", err);
  }
}
