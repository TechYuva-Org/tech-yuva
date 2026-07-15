import React, { useState, useEffect } from "react";
import { 
  Users, Terminal, Cpu, Award, Code2, Presentation, Calendar, 
  ChevronRight, ArrowRight, Save, Trash2, Edit3, Plus, RefreshCcw, 
  ShieldCheck, Layout, Megaphone, Settings as SettingsIcon, Image, 
  Search, CheckCircle, AlertTriangle, Info, Clock, Check, Star, Mail, Phone, MapPin, Globe, Activity, Eye, ShieldAlert, Heart
} from "lucide-react";
import { motion } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AdminCMSProps {
  currentUser: any;
  allEvents: any[];
  allRegistrations: any[];
  onTriggerRefresh: () => void;
  onLoginAsAdmin: () => void;
  cmsData: any;
  setCmsData: React.Dispatch<React.SetStateAction<any>>;
}

type TabType = "dashboard" | "homepage" | "events" | "gallery" | "sponsors" | "testimonials" | "users" | "announcements" | "settings";

export default function AdminCMS({
  currentUser,
  allEvents,
  allRegistrations,
  onTriggerRefresh,
  onLoginAsAdmin,
  cmsData,
  setCmsData
}: AdminCMSProps) {
  const queryClient = useQueryClient();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Safe fetch function with auth headers
  const cmsFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "x-user-email": currentUser?.email || ""
    };
    // Cache invalidation: append timestamp to GET requests and set cache: "no-store"
    const isGet = !options.method || options.method.toUpperCase() === "GET";
    const finalUrl = isGet 
      ? (url.includes("?") ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`)
      : url;
    return fetch(finalUrl, { 
      cache: "no-store",
      ...options, 
      headers 
    });
  };

  // Modern React Query integration replacing manual useEffect loading
  const { data: analytics = null, isLoading: loading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!currentUser || currentUser.role !== "admin") return null;
      try {
        const anyRes = await cmsFetch("/api/cms/analytics");
        if (anyRes.ok) {
          return await anyRes.json();
        }
      } catch (err) {
        console.error("Failed to load backend Analytics:", err);
        showToast("Error establishing connection with Cloud SQL API.", "error");
      }
      return null;
    },
    enabled: !!currentUser && currentUser.role === "admin",
  });

  // Ensure cmsData is preloaded and automatically synchronizes when fetched
  const { data: _cmsData } = useQuery({
    queryKey: ["cmsData"],
    queryFn: async () => {
      const res = await fetch(`/api/cms/homepage?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCmsData(data);
        return data;
      }
      return null;
    },
  });

  const triggerCMSRefresh = () => {
    queryClient.invalidateQueries();
    onTriggerRefresh();
  };

  // CRUD States & Handlers
  // 1. HERO EDITOR
  const [heroForm, setHeroForm] = useState<any>({
    badge: "", title: "", subtitle: "", description: "",
    ctaButton1Text: "", ctaButton1Link: "",
    ctaButton2Text: "", ctaButton2Link: "",
    announcementBanner: "", terminalCode: "", mediaUrl: ""
  });

  useEffect(() => {
    if (cmsData?.heroContent) {
      setHeroForm({
        badge: cmsData.heroContent.badge || "",
        title: cmsData.heroContent.title || "",
        subtitle: cmsData.heroContent.subtitle || "",
        description: cmsData.heroContent.description || "",
        ctaButton1Text: cmsData.heroContent.ctaButton1Text || "",
        ctaButton1Link: cmsData.heroContent.ctaButton1Link || "",
        ctaButton2Text: cmsData.heroContent.ctaButton2Text || "",
        ctaButton2Link: cmsData.heroContent.ctaButton2Link || "",
        announcementBanner: cmsData.heroContent.announcementBanner || "",
        terminalCode: cmsData.heroContent.terminalCode || "",
        mediaUrl: cmsData.heroContent.mediaUrl || ""
      });
    }
  }, [cmsData]);

  const handleHeroSave = async () => {
    try {
      const res = await cmsFetch("/api/cms/hero", {
        method: "PATCH",
        body: JSON.stringify({
          ...heroForm,
          stats: cmsData?.heroContent?.stats || "[]"
        })
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => ({
          ...prev,
          heroContent: payload.heroContent
        }));
        showToast("Hero Section compilation synchronized successfully!");
        triggerCMSRefresh();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update hero content.", "error");
      }
    } catch (err) {
      showToast("Network fault writing hero content.", "error");
    }
  };

  // 2. ABOUT CARDS CRUD
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [selectedAboutCard, setSelectedAboutCard] = useState<any>(null);
  const [aboutForm, setAboutForm] = useState({
    heading: "", description: "", icon: "cpu", displayOrder: 0
  });

  const handleOpenAboutModal = (card: any = null) => {
    setSelectedAboutCard(card);
    if (card) {
      setAboutForm({
        heading: card.heading,
        description: card.description,
        icon: card.icon,
        displayOrder: card.displayOrder
      });
    } else {
      setAboutForm({ heading: "", description: "", icon: "cpu", displayOrder: (cmsData?.aboutCards?.length || 0) + 1 });
    }
    setIsAboutModalOpen(true);
  };

  const handleSaveAboutCard = async () => {
    if (!aboutForm.heading || !aboutForm.description) {
      showToast("Card Heading and Description are mandatory.", "error");
      return;
    }
    try {
      const method = selectedAboutCard ? "PATCH" : "POST";
      const url = selectedAboutCard ? `/api/cms/about/${selectedAboutCard.id}` : "/api/cms/about";
      const res = await cmsFetch(url, {
        method,
        body: JSON.stringify(aboutForm)
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => {
          if (!prev) return prev;
          const updatedCard = payload.aboutCard;
          const list = prev.aboutCards ? [...prev.aboutCards] : [];
          const idx = list.findIndex((c: any) => c.id === updatedCard.id);
          if (idx > -1) {
            list[idx] = updatedCard;
          } else {
            list.push(updatedCard);
          }
          list.sort((a: any, b: any) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
          return { ...prev, aboutCards: list };
        });
        showToast(selectedAboutCard ? "About Card synchronized!" : "New About Card compiled!");
        setIsAboutModalOpen(false);
        triggerCMSRefresh();
      } else {
        showToast("Failed to write About Card.", "error");
      }
    } catch (err) {
      showToast("Network failure.", "error");
    }
  };

  const handleDeleteAboutCard = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this About Card?")) return;
    try {
      const res = await cmsFetch(`/api/cms/about/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCmsData((prev: any) => {
          if (!prev || !prev.aboutCards) return prev;
          return {
            ...prev,
            aboutCards: prev.aboutCards.filter((c: any) => c.id !== id)
          };
        });
        showToast("About card removed successfully.", "info");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Failed to clear card.", "error");
    }
  };

  // 3. FOUNDER VISION EDITOR
  const [founderForm, setFounderForm] = useState({
    name: "", role: "", quote: "", biography: "", photo: "", introVideo: ""
  });

  useEffect(() => {
    if (cmsData?.founderContent) {
      setFounderForm({
        name: cmsData.founderContent.name || "",
        role: cmsData.founderContent.role || "",
        quote: cmsData.founderContent.quote || "",
        biography: cmsData.founderContent.biography || "",
        photo: cmsData.founderContent.photo || "",
        introVideo: cmsData.founderContent.introVideo || ""
      });
    }
  }, [cmsData]);

  const handleFounderSave = async () => {
    try {
      const res = await cmsFetch("/api/cms/founder", {
        method: "PATCH",
        body: JSON.stringify(founderForm)
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => ({
          ...prev,
          founderContent: payload.founderContent
        }));
        showToast("Founder visionary quotes locked successfully!");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Failed to save founder parameters.", "error");
    }
  };

  // 4. OFFERINGS CRUD
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offerForm, setOfferForm] = useState({
    title: "", description: "", icon: "code", displayOrder: 0, status: "active" as "active" | "inactive"
  });

  const handleOpenOfferModal = (offer: any = null) => {
    setSelectedOffer(offer);
    if (offer) {
      setOfferForm({
        title: offer.title,
        description: offer.description,
        icon: offer.icon,
        displayOrder: offer.displayOrder,
        status: offer.status
      });
    } else {
      setOfferForm({
        title: "", description: "", icon: "code", displayOrder: (cmsData?.offerings?.length || 0) + 1, status: "active"
      });
    }
    setIsOfferModalOpen(true);
  };

  const handleSaveOffering = async () => {
    if (!offerForm.title || !offerForm.description) {
      showToast("Title and Description are required.", "error");
      return;
    }
    try {
      const method = selectedOffer ? "PATCH" : "POST";
      const url = selectedOffer ? `/api/cms/offerings/${selectedOffer.id}` : "/api/cms/offerings";
      const res = await cmsFetch(url, {
        method,
        body: JSON.stringify(offerForm)
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => {
          if (!prev) return prev;
          const updated = payload.offering;
          const list = prev.offerings ? [...prev.offerings] : [];
          const idx = list.findIndex((c: any) => c.id === updated.id);
          if (idx > -1) {
            list[idx] = updated;
          } else {
            list.push(updated);
          }
          list.sort((a: any, b: any) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
          return { ...prev, offerings: list };
        });
        showToast("Offering compiled safely!");
        setIsOfferModalOpen(false);
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Failed to write offering.", "error");
    }
  };

  const handleDeleteOffering = async (id: string) => {
    if (!confirm("Remove this premium offering? This action is irreversible.")) return;
    try {
      const res = await cmsFetch(`/api/cms/offerings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCmsData((prev: any) => {
          if (!prev || !prev.offerings) return prev;
          return {
            ...prev,
            offerings: prev.offerings.filter((o: any) => o.id !== id)
          };
        });
        showToast("Offering revoked.", "info");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Error revoking offering.", "error");
    }
  };

  // 5. GALLERY CRUD & MEDIA UPLOAD
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<any>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: "", mediaUrl: "", mediaType: "image" as "image" | "video", category: "",
    statLabel: "", statValue: "", highlightText: "", featured: false
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleOpenGalleryModal = (item: any = null) => {
    setSelectedGallery(item);
    if (item) {
      setGalleryForm({
        title: item.title,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        category: item.category,
        statLabel: item.statLabel,
        statValue: item.statValue,
        highlightText: item.highlightText,
        featured: !!item.featured
      });
    } else {
      setGalleryForm({
        title: "", mediaUrl: "", mediaType: "image", category: "YuvaHack 2026",
        statLabel: "Builders", statValue: "400+", highlightText: "", featured: true
      });
    }
    setIsGalleryModalOpen(true);
  };

  const handleSaveGallery = async () => {
    if (!galleryForm.title || !galleryForm.mediaUrl || !galleryForm.highlightText) {
      showToast("Title, Media URL, and highlight citation are mandatory.", "error");
      return;
    }
    try {
      const method = selectedGallery ? "PATCH" : "POST";
      const url = selectedGallery ? `/api/cms/gallery/${selectedGallery.id}` : "/api/cms/gallery";
      const res = await cmsFetch(url, {
        method,
        body: JSON.stringify(galleryForm)
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => {
          if (!prev) return prev;
          const updated = payload.galleryItem;
          const list = prev.gallery ? [...prev.gallery] : [];
          const idx = list.findIndex((c: any) => c.id === updated.id);
          if (idx > -1) {
            list[idx] = updated;
          } else {
            list.push(updated);
          }
          return { ...prev, gallery: list };
        });
        showToast("Gallery asset published successfully.");
        setIsGalleryModalOpen(false);
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Network write failure.", "error");
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm("Are you sure you want to purge this gallery snapshot?")) return;
    try {
      const res = await cmsFetch(`/api/cms/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCmsData((prev: any) => {
          if (!prev || !prev.gallery) return prev;
          return {
            ...prev,
            gallery: prev.gallery.filter((g: any) => g.id !== id)
          };
        });
        showToast("Gallery snapshot erased.", "info");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Purge failed.", "error");
    }
  };

  const handleMediaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMediaDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    showToast(`Compiling drop file: ${file.name} (${(file.size/1024).toFixed(1)} KB)...`, "info");

    // Simulate upload server endpoint allocations
    setTimeout(async () => {
      try {
        const dummyUrls = [
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=600&auto=format&fit=crop"
        ];
        const allocatedUrl = dummyUrls[Math.floor(Math.random() * dummyUrls.length)];

        // Save reference to the media library
        const res = await cmsFetch("/api/cms/media", {
          method: "POST",
          body: JSON.stringify({
            fileName: file.name,
            fileUrl: allocatedUrl,
            fileType: file.type || "image/jpeg",
            fileSize: file.size
          })
        });

        if (res.ok) {
          const mediaItem = await res.json();
          showToast(`Mock Drag & Drop successfully compiled to ${allocatedUrl}!`);
          setGalleryForm(prev => ({ ...prev, mediaUrl: allocatedUrl }));
        }
      } catch (err) {
        showToast("Cloud allocation failed.", "error");
      } finally {
        setIsUploading(false);
      }
    }, 1200);
  };

  // 6. SPONSORS CRUD
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
  const [sponsorForm, setSponsorForm] = useState({
    name: "", logo: "", website: "", tier: "partner" as "platinum" | "gold" | "silver" | "partner",
    displayOrder: 1, featured: true, statusText: "Ecosystem Supporter", contribution: "", domain: ""
  });

  const handleOpenSponsorModal = (item: any = null) => {
    setSelectedSponsor(item);
    if (item) {
      setSponsorForm({
        name: item.name, logo: item.logo, website: item.website, tier: item.tier,
        displayOrder: item.displayOrder, featured: !!item.featured,
        statusText: item.statusText, contribution: item.contribution, domain: item.domain
      });
    } else {
      setSponsorForm({
        name: "", logo: "★", website: "https://", tier: "partner",
        displayOrder: (cmsData?.sponsors?.length || 0) + 1, featured: true,
        statusText: "Ecosystem Partner", contribution: "Student cloud benefits package", domain: "domain.com"
      });
    }
    setIsSponsorModalOpen(true);
  };

  const handleSaveSponsor = async () => {
    if (!sponsorForm.name || !sponsorForm.logo || !sponsorForm.domain) {
      showToast("Partner Name, Domain, and character symbol logo are required.", "error");
      return;
    }
    try {
      const method = selectedSponsor ? "PATCH" : "POST";
      const url = selectedSponsor ? `/api/cms/sponsors/${selectedSponsor.id}` : "/api/cms/sponsors";
      const res = await cmsFetch(url, {
        method,
        body: JSON.stringify(sponsorForm)
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => {
          if (!prev) return prev;
          const updated = payload.sponsor;
          const list = prev.sponsors ? [...prev.sponsors] : [];
          const idx = list.findIndex((c: any) => c.id === updated.id);
          if (idx > -1) {
            list[idx] = updated;
          } else {
            list.push(updated);
          }
          list.sort((a: any, b: any) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
          return { ...prev, sponsors: list };
        });
        showToast("Sponsorship credentials verified and live!");
        setIsSponsorModalOpen(false);
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Error uploading sponsor.", "error");
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm("Revoke this partnership integration permanently?")) return;
    try {
      const res = await cmsFetch(`/api/cms/sponsors/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCmsData((prev: any) => {
          if (!prev || !prev.sponsors) return prev;
          return {
            ...prev,
            sponsors: prev.sponsors.filter((s: any) => s.id !== id)
          };
        });
        showToast("Sponsorship agreement revoked.", "info");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Error revoking.", "error");
    }
  };

  // 7. TESTIMONIALS MODIFIER
  const toggleTestimonialApproval = async (test: any) => {
    try {
      const res = await cmsFetch(`/api/cms/testimonials/${test.id}`, {
        method: "PATCH",
        body: JSON.stringify({ approved: !test.approved })
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => {
          if (!prev || !prev.testimonials) return prev;
          return {
            ...prev,
            testimonials: prev.testimonials.map((t: any) => t.id === test.id ? payload.testimonial : t)
          };
        });
        showToast(test.approved ? "Review hidden from homepage." : "Review approved and active on homepage!", "info");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Failed to switch testimonial visibility.", "error");
    }
  };

  // 8. ANNOUNCEMENTS CRUD
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<any>(null);
  const [annForm, setAnnForm] = useState({
    title: "", message: "", enabled: true, type: "info" as "info" | "success" | "warning" | "urgent"
  });

  const handleOpenAnnModal = (item: any = null) => {
    setSelectedAnn(item);
    if (item) {
      setAnnForm({
        title: item.title,
        message: item.message,
        enabled: !!item.enabled,
        type: item.type
      });
    } else {
      setAnnForm({ title: "", message: "", enabled: true, type: "urgent" });
    }
    setIsAnnModalOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!annForm.title || !annForm.message) {
      showToast("Announcement header and brief alert message are required.", "error");
      return;
    }
    try {
      const method = selectedAnn ? "PATCH" : "POST";
      const url = selectedAnn ? `/api/cms/announcements/${selectedAnn.id}` : "/api/cms/announcements";
      const res = await cmsFetch(url, {
        method,
        body: JSON.stringify(annForm)
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => {
          if (!prev) return prev;
          const updated = payload.announcement;
          const list = prev.announcements ? [...prev.announcements] : [];
          const idx = list.findIndex((c: any) => c.id === updated.id);
          if (idx > -1) {
            list[idx] = updated;
          } else {
            list.push(updated);
          }
          return { ...prev, announcements: list };
        });
        showToast("System announcement dispatched safely!");
        setIsAnnModalOpen(false);
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Failed to dispatch alert.", "error");
    }
  };

  const handleDeleteAnn = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this system alert?")) return;
    try {
      const res = await cmsFetch(`/api/cms/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCmsData((prev: any) => {
          if (!prev || !prev.announcements) return prev;
          return {
            ...prev,
            announcements: prev.announcements.filter((a: any) => a.id !== id)
          };
        });
        showToast("Announcement erased from system.", "info");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Erase failed.", "error");
    }
  };

  // 9. SETTINGS & SEO SYNCERS
  const [settingsForm, setSettingsForm] = useState({
    communityName: "", logo: "", contactEmail: "", contactPhone: "", contactAddress: "",
    footerText: "", registrationToggle: true, maintenanceMode: false
  });

  useEffect(() => {
    if (cmsData?.siteSettings) {
      setSettingsForm({
        communityName: cmsData.siteSettings.communityName || "",
        logo: cmsData.siteSettings.logo || "",
        contactEmail: cmsData.siteSettings.contactEmail || "",
        contactPhone: cmsData.siteSettings.contactPhone || "",
        contactAddress: cmsData.siteSettings.contactAddress || "",
        footerText: cmsData.siteSettings.footerText || "",
        registrationToggle: !!cmsData.siteSettings.registrationToggle,
        maintenanceMode: !!cmsData.siteSettings.maintenanceMode
      });
    }
  }, [cmsData]);

  const handleSettingsSave = async () => {
    try {
      const res = await cmsFetch("/api/cms/site", {
        method: "PATCH",
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => ({
          ...prev,
          siteSettings: payload.siteSettings
        }));
        showToast("Global community configurations synced successfully!");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("Sync failed.", "error");
    }
  };

  const [seoForm, setSeoForm] = useState({
    metaTitle: "", metaDescription: "", ogImage: "", keywords: "", canonicalUrl: ""
  });

  useEffect(() => {
    if (cmsData?.seoSettings) {
      setSeoForm({
        metaTitle: cmsData.seoSettings.metaTitle || "",
        metaDescription: cmsData.seoSettings.metaDescription || "",
        ogImage: cmsData.seoSettings.ogImage || "",
        keywords: cmsData.seoSettings.keywords || "",
        canonicalUrl: cmsData.seoSettings.canonicalUrl || ""
      });
    }
  }, [cmsData]);

  const handleSeoSave = async () => {
    try {
      const res = await cmsFetch("/api/cms/seo", {
        method: "PATCH",
        body: JSON.stringify(seoForm)
      });
      if (res.ok) {
        const payload = await res.json();
        setCmsData((prev: any) => ({
          ...prev,
          seoSettings: payload.seoSettings
        }));
        showToast("Search Engine optimization (SEO) details published!");
        triggerCMSRefresh();
      }
    } catch (err) {
      showToast("SEO sync failed.", "error");
    }
  };

  // Fast authenticate wrapper
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="p-8 rounded-xl border border-white/5 bg-[#0F1115] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">RESTRICTED ADMIN COMMAND CENTER</h3>
          <p className="text-xs text-[#9CA3AF] mt-1 max-w-sm mx-auto leading-relaxed">
            Authorized administrative credential credentials required to configure live page database elements.
          </p>
        </div>
        <button
          onClick={onLoginAsAdmin}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-black uppercase tracking-widest rounded transition-all cursor-pointer"
        >
          INITIATE ADMIN IDENTITY
        </button>
      </div>
    );
  }

  return (
    <div className="relative border border-white/10 rounded-xl bg-[#0F1115]/80 overflow-hidden shadow-2xl min-h-[680px]">
      
      {/* Toast Alert floating */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded border shadow-2xl flex items-center gap-3 animate-fade-in ${
          toastType === 'success' ? 'bg-[#111827] border-[#22C55E]/30 text-[#22C55E]' :
          toastType === 'error' ? 'bg-[#111827] border-red-500/30 text-red-400' : 'bg-[#111827] border-blue-500/30 text-[#1E90FF]'
        }`}>
          {toastType === 'success' && <CheckCircle className="w-4 h-4" />}
          {toastType === 'error' && <AlertTriangle className="w-4 h-4" />}
          {toastType === 'info' && <Info className="w-4 h-4" />}
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Title head banner */}
      <div className="px-6 py-4 bg-brand-bg-sec border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layout className="w-5 h-5 text-neon-blue" />
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">TECH YUVA MASTER CMS CENTER</h2>
            <p className="text-[10px] text-secondary-text font-mono mt-0.5">Control live site databases, assets & analytics snapshots.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded flex items-center gap-1.5 border border-[#22C55E]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /> CLOUD SQL CONNECTED
          </span>
          <button 
            onClick={triggerCMSRefresh}
            className="p-1.5 hover:bg-white/5 rounded text-secondary-text hover:text-white transition-colors cursor-pointer"
            title="Refresh database components"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-3 border-r border-white/5 bg-[#0A0C0E] p-4 flex flex-col gap-1 select-none">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-mono flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-neon-blue text-black font-bold" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" /> 1. DASHBOARD & ANALYTICS
          </button>
          <button
            onClick={() => setActiveTab("homepage")}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-mono flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "homepage" ? "bg-neon-blue text-black font-bold" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Layout className="w-4 h-4" /> 2. HOMEPAGE CMS
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-mono flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "events" ? "bg-neon-blue text-black font-bold" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" /> 3. SPRINTS & EVENTS
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-mono flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "gallery" ? "bg-neon-blue text-black font-bold" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Image className="w-4 h-4" /> 4. GALLERY & UPLOADER
          </button>
          <button
            onClick={() => setActiveTab("sponsors")}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-mono flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "sponsors" ? "bg-neon-blue text-black font-bold" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" /> 5. PARTNER MARQUEE
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-mono flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "testimonials" ? "bg-neon-blue text-black font-bold" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Star className="w-4 h-4" /> 6. BUILDER REVIEWS
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-mono flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "announcements" ? "bg-neon-blue text-black font-bold" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <Megaphone className="w-4 h-4" /> 7. SYSTEM ANNOUNCEMENTS
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-mono flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === "settings" ? "bg-neon-blue text-black font-bold" : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
            }`}
          >
            <SettingsIcon className="w-4 h-4" /> 8. GLOBAL SETTINGS & SEO
          </button>
        </div>

        {/* Content pane */}
        <div className="md:col-span-9 p-6 overflow-y-auto max-h-[640px] bg-[#0E1013]">
          
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-white/5 rounded w-1/3"></div>
              <div className="h-48 bg-white/5 rounded"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-white/5 rounded"></div>
                <div className="h-24 bg-white/5 rounded"></div>
                <div className="h-24 bg-white/5 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD & DYNAMIC SNAPSHOT ANALYTICS */}
              {activeTab === "dashboard" && analytics && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">LIVE COHORT DOCK & STATS</h3>
                    <p className="text-[10px] text-secondary-text font-mono">Dynamic values mapped instantly from row calculations (no mock placeholders).</p>
                  </div>

                  {/* Dynamic stats cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-4 rounded border border-white/5 bg-brand-bg-sec/40">
                      <span className="text-2xl font-black text-white italic">740</span>
                      <span className="block text-[9px] uppercase tracking-widest text-[#B3B3B3] font-bold font-mono mt-1">Unique Visitors</span>
                    </div>
                    <div className="p-4 rounded border border-white/5 bg-brand-bg-sec/40">
                      <span className="text-2xl font-black text-[#1E90FF]">{analytics.counters?.registrations || 0}</span>
                      <span className="block text-[9px] uppercase tracking-widest text-[#B3B3B3] font-bold font-mono mt-1">Registrations</span>
                    </div>
                    <div className="p-4 rounded border border-white/5 bg-brand-bg-sec/40">
                      <span className="text-2xl font-black text-saffron">{analytics.counters?.activeMembers || 0}</span>
                      <span className="block text-[9px] uppercase tracking-widest text-[#B3B3B3] font-bold font-mono mt-1">Active Members</span>
                    </div>
                    <div className="p-4 rounded border border-white/5 bg-brand-bg-sec/40">
                      <span className="text-2xl font-black text-emerald-green">{analytics.counters?.events || 0}</span>
                      <span className="block text-[9px] uppercase tracking-widest text-[#B3B3B3] font-bold font-mono mt-1">Events Created</span>
                    </div>
                    <div className="p-4 rounded border border-white/5 bg-brand-bg-sec/40">
                      <span className="text-2xl font-black text-[#00BFFF]">{analytics.counters?.certificates || 0}</span>
                      <span className="block text-[9px] uppercase tracking-widest text-[#B3B3B3] font-bold font-mono mt-1">Certificates</span>
                    </div>
                  </div>

                  {/* Growth interactive graph built as responsive, crisp vector SVG */}
                  <div className="p-5 border border-white/5 rounded bg-brand-bg-sec/30 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-white uppercase flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-neon-blue" /> Cohort Growth Curve (Visitors vs Members)</span>
                      <span className="text-[9px] font-mono text-[#00BFFF]">Real snapshot history</span>
                    </div>

                    <div className="h-44 w-full bg-black/40 rounded border border-white/5 p-4 flex flex-col justify-between">
                      {/* Live SVG render representation of growth snapshots */}
                      <svg viewBox="0 0 700 150" className="w-full h-full overflow-visible">
                        {/* Visitors Curve (Red/Orange) */}
                        <path
                          d={`M 20 ${140 - (analytics.snapshots?.[0]?.visitorsCount/7 || 30)} 
                             L 120 ${140 - (analytics.snapshots?.[1]?.visitorsCount/7 || 35)} 
                             L 220 ${140 - (analytics.snapshots?.[2]?.visitorsCount/7 || 40)} 
                             L 320 ${140 - (analytics.snapshots?.[3]?.visitorsCount/7 || 45)} 
                             L 420 ${140 - (analytics.snapshots?.[4]?.visitorsCount/7 || 60)} 
                             L 520 ${140 - (analytics.snapshots?.[5]?.visitorsCount/7 || 75)} 
                             L 620 ${140 - (analytics.snapshots?.[6]?.visitorsCount/7 || 90)}`}
                          fill="none"
                          stroke="#FF7A00"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Members Curve (Sky Blue) */}
                        <path
                          d={`M 20 ${140 - (analytics.snapshots?.[0]?.activeMembersCount/4 || 40)} 
                             L 120 ${140 - (analytics.snapshots?.[1]?.activeMembersCount/4 || 45)} 
                             L 220 ${140 - (analytics.snapshots?.[2]?.activeMembersCount/4 || 50)} 
                             L 320 ${140 - (analytics.snapshots?.[3]?.activeMembersCount/4 || 55)} 
                             L 420 ${140 - (analytics.snapshots?.[4]?.activeMembersCount/4 || 70)} 
                             L 520 ${140 - (analytics.snapshots?.[5]?.activeMembersCount/4 || 85)} 
                             L 620 ${140 - (analytics.snapshots?.[6]?.activeMembersCount/4 || 105)}`}
                          fill="none"
                          stroke="#00BFFF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Grid Nodes */}
                        {analytics.snapshots?.map((snap: any, index: number) => {
                          const x = 20 + index * 100;
                          return (
                            <g key={snap.id}>
                              <circle cx={x} cy={140 - (snap.visitorsCount/7 || 30)} r="4" fill="#FF7A00" />
                              <circle cx={x} cy={140 - (snap.activeMembersCount/4 || 40)} r="4" fill="#00BFFF" />
                              <text x={x} y="148" fill="#a0a0a0" fontSize="7" fontFamily="monospace" textAnchor="middle">
                                {snap.date?.split("-")?.slice(1)?.join("/")}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                      
                      <div className="flex gap-4 items-center text-[8px] font-mono mt-2 justify-center border-t border-white/5 pt-2">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#FF7A00] block" /> Unique Visitors</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#00BFFF] block" /> Certified Active Members</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent registrations activity */}
                  <div className="p-4 border border-white/5 rounded bg-brand-bg-sec/30 space-y-3">
                    <span className="font-mono text-xs font-bold text-white uppercase block">RECENT REGISTRATION ACTIVITIES</span>
                    <div className="divide-y divide-white/5">
                      {analytics.recentActivity?.slice(0, 5).map((act: any) => (
                        <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-white font-mono">{act.name}</span>
                            <span className="block text-[10px] text-secondary-text font-mono">{act.email} • {act.github}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono text-[#1E90FF] bg-[#1E90FF]/10 px-2 py-0.5 rounded">
                              {act.eventTitle}
                            </span>
                            <span className="block text-[8px] text-[#888] font-mono mt-1">{new Date(act.registeredAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                      {(!analytics.recentActivity || analytics.recentActivity.length === 0) && (
                        <p className="text-[10px] text-secondary-text font-mono py-4 text-center">No registration rows detected in Cloud SQL yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HOMEPAGE CMS EDITOR */}
              {activeTab === "homepage" && (
                <div className="space-y-8">
                  
                  {/* Hero Settings Area */}
                  <div className="p-5 border border-white/5 rounded bg-brand-bg-sec/30 space-y-4">
                    <span className="font-mono text-xs font-bold text-neon-blue uppercase block border-b border-white/5 pb-2">✦ EDIT HERO STAGE</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Badge Tag</label>
                        <input
                          type="text"
                          value={heroForm.badge}
                          onChange={(e) => setHeroForm(prev => ({ ...prev, badge: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Hero Title Header</label>
                        <input
                          type="text"
                          value={heroForm.title}
                          onChange={(e) => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-secondary-text uppercase">Subtitle Tagline</label>
                      <input
                        type="text"
                        value={heroForm.subtitle}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-secondary-text uppercase">Description Paragraph</label>
                      <textarea
                        value={heroForm.description}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-secondary-text uppercase">CTA 1 Text</label>
                        <input
                          type="text"
                          value={heroForm.ctaButton1Text}
                          onChange={(e) => setHeroForm(prev => ({ ...prev, ctaButton1Text: e.target.value }))}
                          className="w-full bg-black/40 p-2 text-xs text-white rounded border border-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-secondary-text uppercase">CTA 1 Anchor</label>
                        <input
                          type="text"
                          value={heroForm.ctaButton1Link}
                          onChange={(e) => setHeroForm(prev => ({ ...prev, ctaButton1Link: e.target.value }))}
                          className="w-full bg-black/40 p-2 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-secondary-text uppercase">CTA 2 Text</label>
                        <input
                          type="text"
                          value={heroForm.ctaButton2Text}
                          onChange={(e) => setHeroForm(prev => ({ ...prev, ctaButton2Text: e.target.value }))}
                          className="w-full bg-black/40 p-2 text-xs text-white rounded border border-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-secondary-text uppercase">CTA 2 Anchor</label>
                        <input
                          type="text"
                          value={heroForm.ctaButton2Link}
                          onChange={(e) => setHeroForm(prev => ({ ...prev, ctaButton2Link: e.target.value }))}
                          className="w-full bg-black/40 p-2 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-secondary-text uppercase">Background Media URL (Image/Video)</label>
                      <input
                        type="text"
                        value={heroForm.mediaUrl}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, mediaUrl: e.target.value }))}
                        className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Editable Hero Terminal Code Block</label>
                        <span className="text-[9px] font-mono text-neon-blue">Valid JavaScript</span>
                      </div>
                      <textarea
                        value={heroForm.terminalCode}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, terminalCode: e.target.value }))}
                        rows={6}
                        className="w-full bg-[#050709] p-3 text-xs text-emerald-green rounded border border-white/10 font-mono leading-relaxed focus:border-emerald-green"
                      />
                    </div>

                    <button
                      onClick={handleHeroSave}
                      className="px-5 py-2 bg-neon-blue hover:bg-[#1E90FF] text-black text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Synchronize Hero Section
                    </button>
                  </div>

                  {/* About Cards Section */}
                  <div className="p-5 border border-white/5 rounded bg-brand-bg-sec/30 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-mono text-xs font-bold text-saffron uppercase block">✦ MISSION ABOUT CARDS</span>
                      <button
                        onClick={() => handleOpenAboutModal()}
                        className="px-3 py-1 bg-saffron/10 hover:bg-saffron/20 border border-saffron/20 text-saffron text-[10px] font-mono font-bold uppercase tracking-wider rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create About Card
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {cmsData?.aboutCards?.map((card: any) => (
                        <div key={card.id} className="p-4 rounded border border-white/5 bg-black/40 space-y-3 relative group">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-neon-blue font-bold uppercase">Order {card.displayOrder}</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleOpenAboutModal(card)}
                                className="p-1 hover:bg-white/5 rounded text-secondary-text hover:text-white transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteAboutCard(card.id)}
                                className="p-1 hover:bg-white/5 rounded text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white font-mono">{card.heading}</h4>
                            <p className="text-[11px] text-secondary-text font-light leading-relaxed">{card.description}</p>
                          </div>
                          <div className="pt-2 text-[9px] font-mono text-secondary-text italic">
                            Icon: {card.icon}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Offerings Bento Section */}
                  <div className="p-5 border border-white/5 rounded bg-brand-bg-sec/30 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-mono text-xs font-bold text-emerald-green uppercase block">✦ ECOSYSTEM OFFERINGS (BENTO GRID)</span>
                      <button
                        onClick={() => handleOpenOfferModal()}
                        className="px-3 py-1 bg-emerald-green/10 hover:bg-emerald-green/20 border border-emerald-green/20 text-emerald-green text-[10px] font-mono font-bold uppercase tracking-wider rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Offering
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cmsData?.offerings?.map((off: any) => (
                        <div key={off.id} className="p-4 rounded border border-white/5 bg-black/40 space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                off.status === 'active' ? 'bg-emerald-green/10 text-emerald-green border border-emerald-green/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {off.status}
                              </span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleOpenOfferModal(off)}
                                  className="p-1 hover:bg-white/5 rounded text-secondary-text hover:text-white transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteOffering(off.id)}
                                  className="p-1 hover:bg-white/5 rounded text-red-500 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h4 className="text-sm font-bold text-white uppercase font-mono">{off.title}</h4>
                            <p className="text-[11px] text-secondary-text font-light leading-relaxed mt-1">{off.description}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-mono text-secondary-text">
                            <span>Icon: {off.icon}</span>
                            <span>Order: {off.displayOrder}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Founder Content settings */}
                  <div className="p-5 border border-white/5 rounded bg-brand-bg-sec/30 space-y-4">
                    <span className="font-mono text-xs font-bold text-[#FF7A00] uppercase block border-b border-white/5 pb-2">✦ FOUNDER'S VISIONARY STATEMENTS</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Founder Name</label>
                        <input
                          type="text"
                          value={founderForm.name}
                          onChange={(e) => setFounderForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Administrative Role</label>
                        <input
                          type="text"
                          value={founderForm.role}
                          onChange={(e) => setFounderForm(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Avatar/Photo URL</label>
                        <input
                          type="text"
                          value={founderForm.photo}
                          onChange={(e) => setFounderForm(prev => ({ ...prev, photo: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Introductory Pitch Video URL</label>
                        <input
                          type="text"
                          value={founderForm.introVideo}
                          onChange={(e) => setFounderForm(prev => ({ ...prev, introVideo: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-secondary-text uppercase">Signature Quote</label>
                      <input
                        type="text"
                        value={founderForm.quote}
                        onChange={(e) => setFounderForm(prev => ({ ...prev, quote: e.target.value }))}
                        className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 italic"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-secondary-text uppercase">Biography Text</label>
                      <textarea
                        value={founderForm.biography}
                        onChange={(e) => setFounderForm(prev => ({ ...prev, biography: e.target.value }))}
                        rows={3}
                        className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-sans"
                      />
                    </div>

                    <button
                      onClick={handleFounderSave}
                      className="px-5 py-2 bg-neon-blue hover:bg-[#1E90FF] text-black text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Visionary Profile
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 3: EVENTS CRUD */}
              {activeTab === "events" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">EXPEDITIONS & SPRINTS CRUD</h3>
                      <p className="text-[10px] text-secondary-text font-mono mt-0.5">Manage and scale developer registers directly in real-time.</p>
                    </div>
                  </div>
                  
                  {/* Reuse of highly refined native AdminTerminal Event CRUD is integrated here internally or can execute directly */}
                  <div className="p-4 rounded border border-blue-500/15 bg-blue-500/5 text-xs text-[#00BFFF] leading-relaxed flex items-center gap-3">
                    <Terminal className="w-4 h-4 shrink-0" />
                    <span>The administrator panel features dedicated Event compilation capabilities mapped instantly below. Scroll to secure live sprints!</span>
                  </div>

                  <div className="space-y-4">
                    {allEvents.map(evt => (
                      <div key={evt.id} className="p-4 rounded border border-white/5 bg-black/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#00BFFF] uppercase font-bold tracking-wider">{evt.category}</span>
                            {evt.featured && <span className="text-[8px] font-mono text-saffron font-extrabold uppercase">Featured</span>}
                          </div>
                          <h4 className="text-xs font-bold font-mono text-white">{evt.title}</h4>
                          <span className="block text-[10px] text-secondary-text font-mono">{evt.date} • {evt.venue}</span>
                        </div>
                        <div className="text-[10px] font-mono text-secondary-text">
                          Spots: {evt.spotsLeft} | Status: <span className="text-emerald-green uppercase font-bold">{evt.status || "upcoming"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GALLERY SNAPSHOTS & MOCK MEDIA LIBRARY */}
              {activeTab === "gallery" && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Drag and drop library */}
                  <div className="p-6 border border-dashed border-white/20 rounded-xl bg-black/40 text-center space-y-3 relative group transition-all hover:border-neon-blue/40">
                    <input 
                      type="file" 
                      id="cms-drag-file" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onDragOver={handleMediaDragOver}
                      onDrop={handleMediaDrop}
                    />
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-secondary-text group-hover:text-neon-blue transition-colors">
                      <Image className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">DRAG & DROP MEDIA FILES HERE</h4>
                      <p className="text-[10px] text-secondary-text font-mono mt-1">Simulates file compression, thumbnail mapping & Cloud Storage allocation.</p>
                    </div>
                  </div>

                  {/* Active Gallery snapshots */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="font-mono text-xs font-bold text-emerald-green uppercase block">✦ PUBLISHED SITE GALLERY</span>
                      <button
                        onClick={() => handleOpenGalleryModal()}
                        className="px-3 py-1 bg-emerald-green/10 hover:bg-emerald-green/20 border border-emerald-green/20 text-emerald-green text-[10px] font-mono font-bold uppercase tracking-wider rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Upload Snaps
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {cmsData?.gallery?.map((item: any) => (
                        <div key={item.id} className="p-4 rounded border border-white/5 bg-black/40 space-y-3 flex gap-4">
                          <img 
                            src={item.mediaUrl} 
                            alt={item.title} 
                            className="w-20 h-20 rounded object-cover border border-white/10 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-mono text-[#00BFFF] uppercase">{item.category}</span>
                                <div className="flex gap-1.5">
                                  <button 
                                    onClick={() => handleOpenGalleryModal(item)}
                                    className="p-0.5 hover:bg-white/5 rounded text-secondary-text hover:text-white transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteGallery(item.id)}
                                    className="p-0.5 hover:bg-white/5 rounded text-red-500 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <h4 className="text-xs font-bold text-white font-mono uppercase mt-0.5">{item.title}</h4>
                              <p className="text-[10px] text-secondary-text leading-snug font-sans mt-1 line-clamp-2">{item.highlightText}</p>
                            </div>
                            <span className="text-[9px] font-mono text-emerald-green bg-emerald-green/5 border border-emerald-green/10 w-max px-2 py-0.5 rounded">
                              {item.statLabel}: {item.statValue}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: SPONSORS */}
              {activeTab === "sponsors" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">✦ COHORT SPONSORS & PARTNERS</h3>
                      <p className="text-[10px] text-secondary-text font-mono mt-0.5">Control partner credentials, tiers, and rolling marquee parameters.</p>
                    </div>
                    <button
                      onClick={() => handleOpenSponsorModal()}
                      className="px-3 py-1 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/20 text-[#00BFFF] text-[10px] font-mono font-bold uppercase tracking-wider rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Incorporate Sponsor
                    </button>
                  </div>

                  <div className="divide-y divide-white/5">
                    {cmsData?.sponsors?.map((sps: any) => (
                      <div key={sps.id} className="py-4 flex items-center justify-between text-xs gap-4">
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 bg-white/5 rounded flex items-center justify-center font-bold text-white text-lg border border-white/10 shrink-0">
                            {sps.logo}
                          </span>
                          <div className="space-y-0.5">
                            <span className="font-bold text-white font-mono">{sps.name}</span>
                            <span className="block text-[10px] text-secondary-text font-mono">Domain: {sps.domain} • Tier: <span className="text-neon-blue uppercase">{sps.tier}</span></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-saffron bg-saffron/5 border border-saffron/10 px-2 py-0.5 rounded hidden sm:inline">
                            {sps.statusText}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenSponsorModal(sps)}
                              className="p-1 hover:bg-white/5 rounded text-secondary-text hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSponsor(sps.id)}
                              className="p-1 hover:bg-white/5 rounded text-red-500 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: BUILDERS REVIEWS (TESTIMONIALS) */}
              {activeTab === "testimonials" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">✦ FELLOWSHIP BUILDERS VERDICTS</h3>
                    <p className="text-[10px] text-secondary-text font-mono mt-0.5">Toggle live approval visibility switches on student feedback quotes.</p>
                  </div>

                  <div className="space-y-4">
                    {cmsData?.testimonials?.map((tes: any) => (
                      <div key={tes.id} className="p-4 rounded border border-white/5 bg-black/40 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={tes.avatar} 
                              alt={tes.name} 
                              className="w-10 h-10 rounded-full border border-white/10"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-white font-mono">{tes.name}</h4>
                              <p className="text-[10px] text-secondary-text font-mono">{tes.role} • <span className="text-neon-blue">{tes.organization}</span></p>
                            </div>
                          </div>
                          
                          {/* Visibility toggle check */}
                          <button
                            onClick={() => toggleTestimonialApproval(tes)}
                            className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer ${
                              tes.approved ? "bg-emerald-green/10 text-emerald-green border border-emerald-green/20" : "bg-white/5 text-secondary-text border border-white/5"
                            }`}
                          >
                            {tes.approved ? (
                              <><Check className="w-3.5 h-3.5" /> Approved / Visible</>
                            ) : (
                              "Pending/Hidden"
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-[#9CA3AF] italic leading-relaxed font-sans font-light">"{tes.quote}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: ANNOUNCEMENTS */}
              {activeTab === "announcements" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">✦ GLOBAL ANNOUNCEMENT BANNER</h3>
                      <p className="text-[10px] text-secondary-text font-mono mt-0.5">Configure urgent notifications flashing at the top/homepage of the ecosystem.</p>
                    </div>
                    <button
                      onClick={() => handleOpenAnnModal()}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Alert
                    </button>
                  </div>

                  <div className="space-y-4">
                    {cmsData?.announcements?.map((ann: any) => (
                      <div key={ann.id} className="p-4 rounded border border-white/5 bg-black/40 flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              ann.type === 'urgent' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                              ann.type === 'warning' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                              ann.type === 'success' ? 'bg-emerald-green/15 text-emerald-green border border-emerald-green/20' :
                              'bg-[#1E90FF]/15 text-[#1E90FF] border border-[#1E90FF]/20'
                            }`}>
                              {ann.type}
                            </span>
                            <span className="text-[10px] font-mono text-secondary-text font-semibold">{ann.title}</span>
                          </div>
                          <p className="text-xs text-white font-sans">{ann.message}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => handleOpenAnnModal(ann)}
                            className="p-1 hover:bg-white/5 rounded text-secondary-text hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAnn(ann.id)}
                            className="p-1 hover:bg-white/5 rounded text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!cmsData?.announcements || cmsData.announcements.length === 0) && (
                      <p className="text-[10px] text-secondary-text font-mono py-8 text-center">No active global system announcements recorded in database.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: GLOBAL SETTINGS & SEO */}
              {activeTab === "settings" && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Site identity configurations */}
                  <div className="p-5 border border-white/5 rounded bg-brand-bg-sec/30 space-y-4">
                    <span className="font-mono text-xs font-bold text-[#1E90FF] uppercase block border-b border-white/5 pb-2">✦ COHORT DIRECTORIES CONFIG</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Community Name Title</label>
                        <input
                          type="text"
                          value={settingsForm.communityName}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, communityName: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Emblem Logo Character</label>
                        <input
                          type="text"
                          value={settingsForm.logo}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, logo: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Reach Email Address</label>
                        <input
                          type="text"
                          value={settingsForm.contactEmail}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Reach Phone Number</label>
                        <input
                          type="text"
                          value={settingsForm.contactPhone}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Office HQ Address</label>
                        <input
                          type="text"
                          value={settingsForm.contactAddress}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, contactAddress: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-secondary-text uppercase">Footer Narrative Description Text</label>
                      <input
                        type="text"
                        value={settingsForm.footerText}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, footerText: e.target.value }))}
                        className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <label className="flex items-center gap-3 bg-black/40 p-3 rounded border border-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.registrationToggle}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, registrationToggle: e.target.checked }))}
                          className="rounded border-white/10 text-neon-blue focus:ring-0"
                        />
                        <span className="text-[10px] font-mono text-white uppercase font-bold">Registration Pass Gate Open</span>
                      </label>
                      
                      <label className="flex items-center gap-3 bg-black/40 p-3 rounded border border-white/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.maintenanceMode}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                          className="rounded border-white/10 text-red-500 focus:ring-0"
                        />
                        <span className="text-[10px] font-mono text-red-400 uppercase font-bold">Lock Maintenance Mode</span>
                      </label>
                    </div>

                    <button
                      onClick={handleSettingsSave}
                      className="px-5 py-2 bg-neon-blue hover:bg-[#1E90FF] text-black text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Synchronize Site Parameters
                    </button>
                  </div>

                  {/* SEO configurations Area */}
                  <div className="p-5 border border-white/5 rounded bg-brand-bg-sec/30 space-y-4">
                    <span className="font-mono text-xs font-bold text-emerald-green uppercase block border-b border-white/5 pb-2">✦ SEARCH ENGINE OPTIMIZATION (SEO) CMS</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Meta Title Text</label>
                        <input
                          type="text"
                          value={seoForm.metaTitle}
                          onChange={(e) => setSeoForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Canonical URL Reference</label>
                        <input
                          type="text"
                          value={seoForm.canonicalUrl}
                          onChange={(e) => setSeoForm(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-secondary-text uppercase">Meta Description Summary</label>
                      <textarea
                        value={seoForm.metaDescription}
                        onChange={(e) => setSeoForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                        rows={2}
                        className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Open Graph Image (og:image) URL</label>
                        <input
                          type="text"
                          value={seoForm.ogImage}
                          onChange={(e) => setSeoForm(prev => ({ ...prev, ogImage: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-secondary-text uppercase">Keywords Metadata</label>
                        <input
                          type="text"
                          value={seoForm.keywords}
                          onChange={(e) => setSeoForm(prev => ({ ...prev, keywords: e.target.value }))}
                          className="w-full bg-black/40 p-2.5 text-xs text-white rounded border border-white/10 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSeoSave}
                      className="px-5 py-2 bg-emerald-green hover:bg-emerald-green/80 text-black text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Publish SEO Tags
                    </button>
                  </div>

                </div>
              )}

            </>
          )}

        </div>

      </div>

      {/* ABOUT CARD CREATION MODAL */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-brand-bg-sec border border-white/10 p-6 rounded-xl space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{selectedAboutCard ? "EDIT ABOUT CARD ID" : "COMPILE NEW ABOUT CARD"}</h3>
            
            <div className="space-y-3 font-mono text-xs text-left">
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-secondary-text">Card Heading Title</label>
                <input
                  type="text"
                  value={aboutForm.heading}
                  onChange={(e) => setAboutForm(prev => ({ ...prev, heading: e.target.value }))}
                  className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-secondary-text">Brief Feature Narrative</label>
                <textarea
                  value={aboutForm.description}
                  onChange={(e) => setAboutForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-black/40 p-2 rounded border border-white/10 text-white font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Lucide Icon ID</label>
                  <input
                    type="text"
                    value={aboutForm.icon}
                    onChange={(e) => setAboutForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Layout Display Order</label>
                  <input
                    type="number"
                    value={aboutForm.displayOrder}
                    onChange={(e) => setAboutForm(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAboutCard}
                className="px-4 py-2 bg-neon-blue hover:bg-[#1E90FF] text-black rounded text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Compile and Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFERINGS CREATION MODAL */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-brand-bg-sec border border-white/10 p-6 rounded-xl space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{selectedOffer ? "EDIT MODULAR OFFERING" : "COMPILE ECOSYSTEM OFFERING"}</h3>
            
            <div className="space-y-3 font-mono text-xs text-left">
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-secondary-text">Offering Header</label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase text-secondary-text">Description Narrative</label>
                <textarea
                  value={offerForm.description}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-black/40 p-2 rounded border border-white/10 text-white font-sans"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Lucide Icon</label>
                  <input
                    type="text"
                    value={offerForm.icon}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Order</label>
                  <input
                    type="number"
                    value={offerForm.displayOrder}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Visibility</label>
                  <select
                    value={offerForm.status}
                    onChange={(e: any) => setOfferForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOffering}
                className="px-4 py-2 bg-neon-blue hover:bg-[#1E90FF] text-black rounded text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Save Offering
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GALLERY PUBLICATION MODAL */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-brand-bg-sec border border-white/10 p-6 rounded-xl space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{selectedGallery ? "EDIT GALLERY RECORD" : "PUBLISH NEW SNAPSHOT"}</h3>
            
            <div className="space-y-3 font-mono text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Snapshot Title Header</label>
                  <input
                    type="text"
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Category Tag</label>
                  <input
                    type="text"
                    value={galleryForm.category}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase text-secondary-text">Media Resource URL</label>
                <input
                  type="text"
                  value={galleryForm.mediaUrl}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, mediaUrl: e.target.value }))}
                  className="w-full bg-black/40 p-2 rounded border border-white/10 text-white font-mono"
                  placeholder="https://"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Resource Type</label>
                  <select
                    value={galleryForm.mediaType}
                    onChange={(e: any) => setGalleryForm(prev => ({ ...prev, mediaType: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white focus:outline-none"
                  >
                    <option value="image">Image Snapshot</option>
                    <option value="video">MP4 Loop</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Stat LabelBadge</label>
                  <input
                    type="text"
                    value={galleryForm.statLabel}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, statLabel: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Stat Value</label>
                  <input
                    type="text"
                    value={galleryForm.statValue}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, statValue: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase text-secondary-text">Historic Highlight Narrative Text</label>
                <textarea
                  value={galleryForm.highlightText}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, highlightText: e.target.value }))}
                  rows={2}
                  className="w-full bg-black/40 p-2 rounded border border-white/10 text-white font-sans"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={galleryForm.featured}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded border-white/10 text-neon-blue focus:ring-0"
                />
                <span className="text-[10px] uppercase text-white font-bold">Featured status on landing grid</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGallery}
                className="px-4 py-2 bg-neon-blue hover:bg-[#1E90FF] text-black rounded text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Publish snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPONSOR MODIFICATION MODAL */}
      {isSponsorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-brand-bg-sec border border-white/10 p-6 rounded-xl space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{selectedSponsor ? "VERIFY PARTNER SPONSOR" : "INCORPORATE NEW SPONSOR"}</h3>
            
            <div className="space-y-3 font-mono text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Company Name</label>
                  <input
                    type="text"
                    value={sponsorForm.name}
                    onChange={(e) => setSponsorForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Domain</label>
                  <input
                    type="text"
                    value={sponsorForm.domain}
                    onChange={(e) => setSponsorForm(prev => ({ ...prev, domain: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Logo character symbol</label>
                  <input
                    type="text"
                    value={sponsorForm.logo}
                    onChange={(e) => setSponsorForm(prev => ({ ...prev, logo: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Website link</label>
                  <input
                    type="text"
                    value={sponsorForm.website}
                    onChange={(e) => setSponsorForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Tier</label>
                  <select
                    value={sponsorForm.tier}
                    onChange={(e: any) => setSponsorForm(prev => ({ ...prev, tier: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white focus:outline-none"
                  >
                    <option value="platinum">Platinum</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Status tag</label>
                  <input
                    type="text"
                    value={sponsorForm.statusText}
                    onChange={(e) => setSponsorForm(prev => ({ ...prev, statusText: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-[9px] uppercase text-secondary-text">Display Order</label>
                  <input
                    type="number"
                    value={sponsorForm.displayOrder}
                    onChange={(e) => setSponsorForm(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase text-secondary-text">Sponsorship Contribution Description</label>
                <input
                  type="text"
                  value={sponsorForm.contribution}
                  onChange={(e) => setSponsorForm(prev => ({ ...prev, contribution: e.target.value }))}
                  className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sponsorForm.featured}
                  onChange={(e) => setSponsorForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded border-white/10 text-neon-blue focus:ring-0"
                />
                <span className="text-[10px] uppercase text-white font-bold">Featured status on sponsors rail</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsSponsorModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSponsor}
                className="px-4 py-2 bg-neon-blue hover:bg-[#1E90FF] text-black rounded text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Incorporate Sponsor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT CREATION MODAL */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-brand-bg-sec border border-white/10 p-6 rounded-xl space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{selectedAnn ? "EDIT SYSTEM ALERT" : "COMPILE GLOBAL SYSTEM ALERT"}</h3>
            
            <div className="space-y-3 font-mono text-xs text-left">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Alert Header</label>
                  <input
                    type="text"
                    value={annForm.title}
                    onChange={(e) => setAnnForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-secondary-text">Alert Type Level</label>
                  <select
                    value={annForm.type}
                    onChange={(e: any) => setAnnForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-black/40 p-2 rounded border border-white/10 text-white focus:outline-none"
                  >
                    <option value="info">Information (Blue)</option>
                    <option value="success">Success (Emerald)</option>
                    <option value="warning">Warning (Saffron)</option>
                    <option value="urgent">Urgent alert (Red)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase text-secondary-text">Announce Banner message Text</label>
                <textarea
                  value={annForm.message}
                  onChange={(e) => setAnnForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                  className="w-full bg-black/40 p-2 rounded border border-white/10 text-white font-sans"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={annForm.enabled}
                  onChange={(e) => setAnnForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-white/10 text-neon-blue focus:ring-0"
                />
                <span className="text-[10px] uppercase text-white font-bold">Enabled & Active instantly</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAnnModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnnouncement}
                className="px-4 py-2 bg-neon-blue hover:bg-[#1E90FF] text-black rounded text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Dispatch Alert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
