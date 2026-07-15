import { relations } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, vector, jsonb, date } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(), // Stores u-* IDs
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").$type<"visitor" | "member" | "admin">().default("visitor").notNull(),
  github: text("github"),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
});

// Sessions table for Magic Link OTP flow and auth
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().notNull(), // sess_nanoid
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").unique().notNull(), // Hashed OTP or session token
  expiresAt: timestamp("expires_at").notNull(),
  type: text("type").notNull(), // 'otp' | 'session'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Members table for Join Community form
export const communityMembers = pgTable("community_members", {
  id: text("id").primaryKey().notNull(), // mem_nanoid
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  github: text("github"),
  message: text("message"),
  status: text("status").$type<"pending" | "approved" | "rejected">().default("pending").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }), // linked if they login
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  category: text("category").$type<"hackathon" | "workshop" | "talk" | "bootcamp" | "startup" | "other">().notNull(),
  date: date("date").notNull(),
  rawDate: text("raw_date").notNull(),
  time: text("time").notNull(),
  venue: text("venue").notNull(),
  tags: text("tags").array().notNull(),
  description: text("description").notNull(),
  status: text("status").$type<"upcoming" | "past" | "draft" | "completed" | "cancelled">().default("upcoming").notNull(),
  spotsTotal: integer("spots_total").default(50).notNull(),
  spotsLeft: integer("spots_left").default(50).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Registrations table
export const registrations = pgTable("registrations", {
  id: text("id").primaryKey().notNull(),
  eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  github: text("github").notNull(),
  teamSize: integer("team_size").default(1).notNull(),
  techFocus: text("tech_focus").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  attended: boolean("attended").default(false).notNull()
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: text("id").primaryKey().notNull(),
  registrationId: text("registration_id").references(() => registrations.id, { onDelete: "cascade" }).notNull(),
  eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  recipientName: text("recipient_name").notNull(),
  eventTitle: text("event_title").notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  verificationCode: text("verification_code").notNull().unique()
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  registrations: many(registrations),
  certificates: many(certificates)
}));

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(registrations),
  certificates: many(certificates)
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  user: one(users, {
    fields: [registrations.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [registrations.eventId],
    references: [events.id]
  })
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [certificates.eventId],
    references: [events.id]
  }),
  registration: one(registrations, {
    fields: [certificates.registrationId],
    references: [registrations.id]
  })
}));

// Knowledge base table for RAG embeddings
export const kbChunks = pgTable("kb_chunks", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'about' | 'events' | 'vision' | 'registration' | 'sponsors' | 'community'
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 })
});

// site_settings table
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().notNull(), // 'global'
  communityName: text("community_name").notNull(),
  logo: text("logo").notNull(),
  themeColors: jsonb("theme_colors").notNull(), // JSON representing primary, secondary, backgrounds etc.
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactAddress: text("contact_address").notNull(),
  socialLinks: jsonb("social_links").notNull(), // JSON for social URLs
  footerText: text("footer_text").notNull(),
  registrationToggle: boolean("registration_toggle").default(true).notNull(),
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
});

// seo_settings table
export const seoSettings = pgTable("seo_settings", {
  id: text("id").primaryKey().notNull(), // 'global'
  metaTitle: text("meta_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  ogImage: text("og_image").notNull(),
  keywords: text("keywords").notNull(),
  canonicalUrl: text("canonical_url").notNull(),
  jsonLd: text("json_ld"), // Optional custom JSON-LD schema
});

// hero_content table
export const heroContent = pgTable("hero_content", {
  id: text("id").primaryKey().notNull(), // 'global'
  badge: text("badge").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  ctaButton1Text: text("cta_button1_text").notNull(),
  ctaButton1Link: text("cta_button1_link").notNull(),
  ctaButton2Text: text("cta_button2_text").notNull(),
  ctaButton2Link: text("cta_button2_link").notNull(),
  announcementBanner: text("announcement_banner"),
  stats: jsonb("stats").notNull(), // JSON representing stats array [{ label, value }]
  mediaUrl: text("media_url"),
  terminalCode: text("terminal_code").notNull(),
});

// founder_content table
export const founderContent = pgTable("founder_content", {
  id: text("id").primaryKey().notNull(), // 'global'
  name: text("name").notNull(),
  role: text("role").notNull(),
  photo: text("photo").notNull(),
  introVideo: text("intro_video"),
  quote: text("quote").notNull(),
  biography: text("biography").notNull(),
});

// homepage_settings table
export const homepageSettings = pgTable("homepage_settings", {
  id: text("id").primaryKey().notNull(), // 'global'
  heroContentId: text("hero_content_id").references(() => heroContent.id, { onDelete: "set null" }),
  founderContentId: text("founder_content_id").references(() => founderContent.id, { onDelete: "set null" }),
  seoSettingsId: text("seo_settings_id").references(() => seoSettings.id, { onDelete: "set null" }),
  siteSettingsId: text("site_settings_id").references(() => siteSettings.id, { onDelete: "set null" }),
});

// about_cards table
export const aboutCards = pgTable("about_cards", {
  id: text("id").primaryKey().notNull(),
  heading: text("heading").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  displayOrder: integer("display_order").default(0).notNull(),
  image: text("image"),
});

// offerings table
export const offerings = pgTable("offerings", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  displayOrder: integer("display_order").default(0).notNull(),
  status: text("status").$type<"active" | "inactive">().default("active").notNull(),
});

// gallery table
export const gallery = pgTable("gallery", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").$type<"image" | "video">().default("image").notNull(),
  category: text("category").notNull(),
  statLabel: text("stat_label").notNull(),
  statValue: text("stat_value").notNull(),
  highlightText: text("highlight_text").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// sponsors table
export const sponsors = pgTable("sponsors", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  website: text("website").notNull(),
  tier: text("tier").$type<"platinum" | "gold" | "silver" | "partner">().default("partner").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  statusText: text("status_text").notNull(),
  contribution: text("contribution").notNull(),
  domain: text("domain").notNull(),
});

// testimonials table
export const testimonials = pgTable("testimonials", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  organization: text("organization").notNull(),
  rating: integer("rating").default(5).notNull(),
  quote: text("quote").notNull(),
  avatar: text("avatar").notNull(),
  approved: boolean("approved").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// announcements table
export const announcements = pgTable("announcements", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  type: text("type").$type<"info" | "success" | "warning" | "urgent">().default("info").notNull(),
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// media_library table
export const mediaLibrary = pgTable("media_library", {
  id: text("id").primaryKey().notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// analytics_snapshots table
export const analyticsSnapshots = pgTable("analytics_snapshots", {
  id: text("id").primaryKey().notNull(),
  date: text("date").notNull(), // e.g. "2026-07-09"
  visitorsCount: integer("visitors_count").default(0).notNull(),
  registrationsCount: integer("registrations_count").default(0).notNull(),
  activeMembersCount: integer("active_members_count").default(0).notNull(),
  eventsCount: integer("events_count").default(0).notNull(),
  certificatesCount: integer("certificates_count").default(0).notNull(),
  sponsorsCount: integer("sponsors_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
