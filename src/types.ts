export interface EventSpeaker {
  name: string;
  designation: string[];
  photo?: string;
}

export interface EventMetadata {
  slug?: string;
  tagline?: string;
  speaker?: EventSpeaker;
  highlights?: string[];
  closingMessage?: string;
  registrationOpen?: boolean;
  registrationMessage?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: "hackathon" | "workshop" | "talk" | "bootcamp" | "startup" | "other";
  date: string;
  rawDate: string;
  time: string;
  venue: string;
  tags: string[];
  description: string;
  status: "upcoming" | "past" | "draft" | "completed" | "cancelled";
  spotsLeft?: number;
  featured?: boolean;
  externalLink?: string | null;
  image?: string | null;
  metadata?: EventMetadata | null;
}

export interface GalleryItem {
  id: string;
  title: string;
  event: string;
  statLabel: string;
  statValue: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  highlightText: string;
}

export interface Sponsor {
  name: string;
  logo: string;
  domain: string;
  contribution: string;
  statusText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization: string;
  avatar: string;
  rating: number;
  quote: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export interface SpecSection {
  title: string;
  content: string;
  codeBlock?: string;
}
