import { useState, useRef, useEffect, useMemo } from "react";
import {
  Camera, Search, X, Plus, Check, Sparkles, Instagram, Linkedin,
  Handshake, Lightbulb, Briefcase, Heart, MessageCircle, Rocket, GraduationCap,
  Home, CalendarDays, Trash2, Eye, Pencil,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PageShell from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { SKILLS_DATA, INTERESTS_DATA, LOOKING_FOR_OPTIONS } from "@/lib/onboarding-data";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfileDetails } from "@/hooks/use-profiles";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const MEMBER_TYPES = [
  { id: "co_living", label: "Co-living", icon: Home },
  { id: "co_working", label: "Co-working", icon: Briefcase },
  { id: "event_attendee", label: "Event Attendee", icon: CalendarDays },
  { id: "follower", label: "Follower", icon: Instagram },
];

const LOOKING_FOR_ICONS: Record<string, React.ElementType> = {
  Handshake, Lightbulb, Briefcase, Heart, MessageCircle, Rocket, GraduationCap,
};

const PRIVACY_OPTIONS = [
  { id: "public", label: "Public" },
  { id: "members", label: "Hub Members Only" },
  { id: "private", label: "Private" },
];

/* ─── Tag Picker (inline, collapsible) ─── */
interface TagPickerEditProps {
  label: string;
  categories: Record<string, string[]>;
  selected: string[];
  onToggle: (item: string) => void;
  max: number;
  min: number;
}

const TagPickerEdit = ({ label, categories, selected, onToggle, max, min }: TagPickerEditProps) => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const allItems = Object.values(categories).flat();
  const filtered = search ? allItems.filter((s) => s.toLowerCase().includes(search.toLowerCase())) : [];

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && trimmed.length <= 30 && !selected.includes(trimmed) && selected.length < max) {
      onToggle(trimmed);
      setCustomInput("");
      setShowCustom(false);
    }
  };

  return (
    <div className="border-2 border-foreground bg-card p-5 shadow-brutal space-y-4">
      <div className="flex items-center justify-between">
        <Label className="font-mono text-xs font-bold uppercase tracking-wider">
          {label} (Select {min}-{max})
        </Label>
        <span className="font-mono text-[11px] text-muted-foreground">{selected.length}/{max}</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${label.toLowerCase()}...`}
          className="border-2 border-foreground bg-background font-mono text-xs h-12 md:h-10 pl-9" />
      </div>

      {selected.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Selected ({selected.length}):</p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono bg-foreground text-primary-foreground border-2 border-foreground">
                {item}
                <button type="button" onClick={() => onToggle(item)} className="hover:text-destructive ml-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {search && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((item) => {
            const isSelected = selected.includes(item);
            const atLimit = selected.length >= max && !isSelected;
            return (
              <button key={item} type="button" onClick={() => !atLimit && onToggle(item)} disabled={atLimit}
                className={`px-2 py-1 text-[11px] font-mono border-2 transition-all ${
                  isSelected ? "border-foreground bg-foreground text-primary-foreground"
                    : atLimit ? "border-muted text-muted-foreground opacity-50 cursor-not-allowed"
                    : "border-foreground bg-background hover:bg-accent"
                }`}>
                {isSelected && "✓ "}{item}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="font-mono text-xs text-muted-foreground">No results</p>}
        </div>
      )}

      {!search && (
        <>
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="font-mono text-xs text-muted-foreground underline decoration-accent decoration-2 underline-offset-2 hover:text-foreground transition-colors">
            {expanded ? "Hide all" : `+ See all ${label.toLowerCase()}`}
          </button>
          {expanded && (
            <div className="space-y-3 pt-2">
              {Object.entries(categories).map(([cat, items]) => (
                <div key={cat}>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{cat}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => {
                      const isSelected = selected.includes(item);
                      const atLimit = selected.length >= max && !isSelected;
                      return (
                        <button key={item} type="button" onClick={() => !atLimit && onToggle(item)} disabled={atLimit}
                          className={`px-3 py-2 md:px-2 md:py-1 text-xs md:text-[11px] font-mono border-2 transition-all min-h-[44px] md:min-h-0 ${
                            isSelected ? "border-foreground bg-foreground text-primary-foreground"
                              : atLimit ? "border-muted text-muted-foreground opacity-50 cursor-not-allowed"
                              : "border-foreground bg-background hover:bg-accent"
                          }`}>
                          {isSelected && "✓ "}{item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showCustom ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <Input value={customInput} onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type custom..." maxLength={30}
            className="border-2 border-foreground bg-background font-mono text-xs h-12 sm:h-9"
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()} />
          <div className="flex gap-2">
            <Button type="button" onClick={handleAddCustom} disabled={!customInput.trim()} size="sm"
              className="h-12 sm:h-9 border-2 border-foreground font-mono text-[10px] uppercase flex-1">Add</Button>
            <Button type="button" variant="ghost" size="sm"
              onClick={() => { setShowCustom(false); setCustomInput(""); }} className="h-12 sm:h-9 px-4">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setShowCustom(true)}
          className="inline-flex items-center justify-center gap-1.5 font-mono text-[12px] text-muted-foreground border-2 border-dashed border-muted-foreground p-3 w-full sm:w-auto sm:border-none sm:p-0 sm:justify-start hover:text-foreground">
          <Plus className="h-4 w-4" /> Add custom tag
        </button>
      )}
    </div>
  );
};

/* ─── Main Component ─── */
interface ProfileFormData {
  fullName: string;
  bio: string;
  instagram: string;
  linkedin: string;
  photoPreview: string;
  memberTypes: string[];
  skills: string[];
  interests: string[];
  lookingFor: string[];
  privacy: string;
}

const MyProfile = () => {
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const { data: dbProfile, isLoading } = useMyProfileDetails(user?.id);

  const toFormData = (p: typeof dbProfile): ProfileFormData => ({
    fullName: p?.full_name ?? "",
    bio: p?.bio ?? "",
    instagram: p?.instagram ?? "",
    linkedin: p?.linkedin ?? "",
    photoPreview: p?.avatar_url ?? "",
    memberTypes: p?.member_types ?? [],
    skills: p?.skills ?? [],
    interests: p?.interests ?? [],
    lookingFor: p?.looking_for ?? [],
    privacy: p?.privacy ?? "public",
  });

  const [profile, setProfile] = useState<ProfileFormData>(toFormData(null));
  const [savedProfile, setSavedProfile] = useState<ProfileFormData>(toFormData(null));

  useEffect(() => {
    if (dbProfile) {
      const fd = toFormData(dbProfile);
      setProfile(fd);
      setSavedProfile(fd);
    }
  }, [dbProfile]);

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(savedProfile) || photoFile !== null;

  const update = (partial: Partial<ProfileFormData>) => setProfile((p) => ({ ...p, ...partial }));

  const toggleItem = (key: "skills" | "interests" | "lookingFor" | "memberTypes", item: string) => {
    const current = profile[key];
    if (current.includes(item)) {
      update({ [key]: current.filter((i: string) => i !== item) });
    } else {
      update({ [key]: [...current, item] });
    }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    try {
      const { resizeImage } = await import("@/lib/utils");
      const resized = await resizeImage(file, 500);
      setPhotoFile(resized);
      update({ photoPreview: URL.createObjectURL(resized) });
    } catch {
      setPhotoFile(file);
      update({ photoPreview: URL.createObjectURL(file) });
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      let avatarUrl = profile.photoPreview;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, photoFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: profile.fullName,
          bio: profile.bio,
          instagram: profile.instagram,
          linkedin: profile.linkedin,
          avatar_url: avatarUrl,
          privacy: profile.privacy,
        })
        .eq("id", user.id);
      if (profileErr) throw profileErr;

      const deleteAndInsert = async (table: string, column: string, values: string[]) => {
        await (supabase as any).from(table).delete().eq("profile_id", user.id);
        if (values.length > 0) {
          const rows = values.map((v: string) => ({ profile_id: user.id, [column]: v }));
          const { error } = await (supabase as any).from(table).insert(rows);
          if (error) throw error;
        }
      };

      await Promise.all([
        deleteAndInsert("profile_member_types", "member_type", profile.memberTypes),
        deleteAndInsert("profile_skills", "skill", profile.skills),
        deleteAndInsert("profile_interests", "interest", profile.interests),
        deleteAndInsert("profile_looking_for", "looking_for", profile.lookingFor),
      ]);

      setPhotoFile(null);
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["my-profile-details"] });
      const updated = { ...profile, photoPreview: avatarUrl };
      setProfile(updated);
      setSavedProfile(updated);
      toast({ title: "🎉 Profile updated!", description: "Your changes have been saved.", duration: 3000 });
    } catch (err: any) {
      toast({ title: "Error saving", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setPhotoFile(null);
  };

  const bioLength = profile.bio.length;
  const bioColor = bioLength > 150 ? "text-destructive" : bioLength > 140 ? "text-accent" : "text-muted-foreground";

  const { completeness, missing } = useMemo(() => {
    const checks = [
      { done: !!profile.fullName.trim(), label: "Full name" },
      { done: !!profile.bio.trim(), label: "Bio" },
      { done: !!profile.photoPreview, label: "Profile photo" },
      { done: profile.memberTypes.length > 0, label: "Member type" },
      { done: profile.skills.length >= 3, label: "At least 3 skills" },
      { done: profile.interests.length >= 3, label: "At least 3 interests" },
      { done: profile.lookingFor.length > 0, label: "Looking for" },
      { done: !!(profile.instagram || profile.linkedin), label: "Social link" },
    ];
    const done = checks.filter((c) => c.done).length;
    return { completeness: Math.round((done / checks.length) * 100), missing: checks.filter((c) => !c.done).map((c) => c.label) };
  }, [profile]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="container max-w-3xl py-6 sm:py-8 px-4 sm:px-6 lg:px-0 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 border-2 border-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="container max-w-3xl py-6 sm:py-8 px-4 sm:px-6 lg:px-0">
        <h1 className="font-heading text-3xl md:text-4xl uppercase mb-4">
          {mode === "preview" ? "My Profile" : "Edit Profile"}
        </h1>

        {/* Profile completeness */}
        {completeness < 100 && (
          <div className="border-2 border-foreground bg-card p-4 shadow-brutal mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs font-bold uppercase tracking-wider">Profile Completeness</p>
              <span className="font-mono text-sm font-bold">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2 border border-foreground" />
            {missing.length > 0 && (
              <p className="font-mono text-[10px] text-muted-foreground">
                Missing: {missing.join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Privacy toggle */}
        <div className="flex border-2 border-foreground mb-4 bg-card">
          {PRIVACY_OPTIONS.map((opt) => (
            <button key={opt.id} onClick={() => update({ privacy: opt.id })}
              className={`flex-1 min-h-[44px] py-2 sm:py-2.5 font-mono text-[9px] sm:text-[11px] uppercase tracking-wider transition-all border-r-2 border-foreground last:border-r-0 leading-tight ${
                profile.privacy === opt.id ? "bg-foreground text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent/20"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Preview / Edit toggle */}
        <div className="flex border-2 border-foreground mb-8 bg-card">
          <button onClick={() => setMode("preview")}
            className={`flex-1 py-2 sm:py-2.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all border-r-2 border-foreground ${
              mode === "preview" ? "bg-foreground text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent/20"
            }`}>
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
          <button onClick={() => setMode("edit")}
            className={`flex-1 py-2 sm:py-2.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              mode === "edit" ? "bg-foreground text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent/20"
            }`}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        </div>

        {/* ─── PREVIEW MODE ─── */}
        {mode === "preview" && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="h-28 w-28 mx-auto border-2 border-foreground bg-accent flex items-center justify-center shadow-brutal overflow-hidden">
                {profile.photoPreview ? (
                  <img src={profile.photoPreview} alt={profile.fullName} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-heading text-3xl">{profile.fullName.split(" ").map((n) => n[0]).join("")}</span>
                )}
              </div>
              <h2 className="font-heading text-2xl uppercase">{profile.fullName}</h2>
              {profile.instagram && <p className="font-mono text-xs text-muted-foreground">{profile.instagram}</p>}
            </div>

            {profile.bio && (
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <p className="font-mono text-sm leading-relaxed text-center">{profile.bio}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center">
              {profile.memberTypes.map((id) => {
                const mt = MEMBER_TYPES.find((m) => m.id === id);
                if (!mt) return null;
                const Icon = mt.icon;
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-2 border-2 border-foreground bg-background">
                    <Icon className="h-4 w-4" /> {mt.label}
                  </span>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.skills.length > 0 && (
                <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                  <h3 className="font-heading text-sm uppercase mb-3">Skills ({profile.skills.length})</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s) => (
                      <span key={s} className="inline-block font-mono text-[11px] px-2 py-1 border-2 border-foreground bg-foreground text-primary-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.interests.length > 0 && (
                <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                  <h3 className="font-heading text-sm uppercase mb-3">Interests ({profile.interests.length})</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((i) => (
                      <span key={i} className="inline-block font-mono text-[11px] px-2 py-1 border-2 border-accent bg-accent text-accent-foreground">{i}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {profile.lookingFor.length > 0 && (
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-sm uppercase mb-3">Looking For</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.lookingFor.map((id) => {
                    const opt = LOOKING_FOR_OPTIONS.find((o) => o.id === id);
                    if (!opt) return null;
                    const Icon = LOOKING_FOR_ICONS[opt.icon] || Handshake;
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 font-mono text-xs px-3 py-2 border-2 border-foreground bg-background">
                        <Icon className="h-4 w-4" /> {opt.title}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {(profile.instagram || profile.linkedin) && (
              <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
                <h3 className="font-heading text-sm uppercase mb-3">Social Links</h3>
                <div className="flex gap-3">
                  {profile.instagram && (
                    <a href={`https://instagram.com/${profile.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                      className="h-11 w-11 border-2 border-foreground flex items-center justify-center bg-background hover:bg-accent hover:shadow-brutal-sm transition-all">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                      className="h-11 w-11 border-2 border-foreground flex items-center justify-center bg-background hover:bg-accent hover:shadow-brutal-sm transition-all">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <Button onClick={() => setMode("edit")}
              className="w-full h-14 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-sm gap-2">
              <Pencil className="h-4 w-4" /> Switch to Edit Mode
            </Button>
          </div>
        )}

        {/* ─── EDIT MODE ─── */}
        {mode === "edit" && (
          <div className="space-y-6">
            {/* Photo */}
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider mb-3 block">Profile Photo</Label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 flex-shrink-0 border-2 border-foreground bg-accent flex items-center justify-center overflow-hidden">
                  {profile.photoPreview ? (
                    <img src={profile.photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}
                    className="border-2 border-foreground font-mono text-[10px] uppercase tracking-wider h-10 sm:h-8 w-full sm:w-auto">Change Photo</Button>
                  {profile.photoPreview && (
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => { update({ photoPreview: "" }); setPhotoFile(null); }}
                      className="font-mono text-[10px] uppercase tracking-wider text-destructive hover:text-destructive h-10 sm:h-8 w-full sm:w-auto">Remove Photo</Button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={handlePhoto} className="hidden" />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">Full Name <span className="text-accent">*</span></Label>
              <Input value={profile.fullName} onChange={(e) => update({ fullName: e.target.value })}
                className="border-2 border-foreground bg-background font-mono h-12" />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">Bio (150 characters) <span className="text-accent">*</span></Label>
              <Textarea value={profile.bio} onChange={(e) => update({ bio: e.target.value })}
                className="border-2 border-foreground bg-background font-mono resize-y min-h-[96px]" maxLength={160} />
              <p className={`font-mono text-[11px] ${bioColor}`}>{bioLength}/150 characters</p>
            </div>

            {/* Member type */}
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider mb-3 block">Member Type</Label>
              <div className="flex flex-wrap gap-3">
                {MEMBER_TYPES.map(({ id, label, icon: Icon }) => {
                  const selected = profile.memberTypes.includes(id);
                  return (
                    <button key={id} type="button" onClick={() => toggleItem("memberTypes", id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 font-mono text-xs border-2 transition-all ${
                        selected ? "border-foreground bg-foreground text-primary-foreground" : "border-foreground bg-background hover:bg-accent"
                      }`}>
                      {selected && <Check className="h-3 w-3" />}
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <TagPickerEdit label="Skills" categories={SKILLS_DATA} selected={profile.skills}
              onToggle={(s) => toggleItem("skills", s)} max={5} min={3} />

            <TagPickerEdit label="Interests" categories={INTERESTS_DATA} selected={profile.interests}
              onToggle={(i) => toggleItem("interests", i)} max={5} min={3} />

            {/* Looking for */}
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal space-y-3">
              <Label className="font-mono text-xs font-bold uppercase tracking-wider">Looking For</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LOOKING_FOR_OPTIONS.map(({ id, title, description, icon }) => {
                  const selected = profile.lookingFor.includes(id);
                  const Icon = LOOKING_FOR_ICONS[icon] || Handshake;
                  return (
                    <button key={id} type="button" onClick={() => toggleItem("lookingFor", id)}
                      className={`flex items-center gap-3 px-3 py-3 border-2 text-left transition-all ${
                        selected ? "border-foreground bg-accent shadow-brutal-sm -translate-x-px -translate-y-px" : "border-foreground bg-background hover:bg-accent/10"
                      }`}>
                      {selected ? (
                        <div className="h-5 w-5 flex-shrink-0 border-2 border-foreground bg-foreground flex items-center justify-center">
                          <Check className="h-3 w-3 text-background" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 flex-shrink-0 border-2 border-foreground bg-background" />
                      )}
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="font-mono text-xs font-bold">{title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social links */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs font-bold uppercase tracking-wider">
                  Instagram Handle <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input value={profile.instagram} onChange={(e) => update({ instagram: e.target.value })}
                  placeholder="@riyacreates" className="border-2 border-foreground bg-background font-mono h-12" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs font-bold uppercase tracking-wider">
                  LinkedIn URL <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input value={profile.linkedin} onChange={(e) => update({ linkedin: e.target.value })}
                  placeholder="linkedin.com/in/riyasharma" className="border-2 border-foreground bg-background font-mono h-12" />
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
              <button type="button" onClick={handleCancel}
                className="font-mono text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors text-center sm:text-left">
                Cancel Changes
              </button>
              <Button onClick={handleSave} disabled={!hasChanges || saving}
                className="w-full sm:w-auto h-12 sm:h-14 px-5 sm:px-8 border-2 border-foreground shadow-brutal hover:shadow-brutal-hover transition-all font-mono font-bold uppercase tracking-wider text-xs sm:text-sm">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {/* Danger zone */}
            <div className="border-2 border-destructive bg-card p-5 mt-12">
              <h3 className="font-heading text-sm uppercase text-destructive mb-2">Danger Zone</h3>
              <p className="font-mono text-xs text-muted-foreground mb-4">
                Once you delete your account, there is no going back. All your data will be permanently deleted.
              </p>
              <Button variant="outline" onClick={() => setShowDeleteModal(true)}
                className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-mono text-xs uppercase tracking-wider h-12 md:h-10 w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
              </Button>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/50 p-4">
            <div className="bg-background border-2 border-foreground shadow-brutal-lg p-6 max-w-md w-full space-y-4">
              <h2 className="font-heading text-xl uppercase">Are you absolutely sure?</h2>
              <p className="font-mono text-xs text-muted-foreground">
                This action cannot be undone. Type <strong>DELETE</strong> to confirm.
              </p>
                <Input value={deleteText} onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="Type DELETE" className="border-2 border-foreground bg-background font-mono h-12 md:h-10 text-base" />
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-2">
                  <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteText(""); }}
                    className="flex-1 min-h-[48px] border-2 border-foreground font-mono text-xs uppercase">Cancel</Button>
                  <Button disabled={deleteText !== "DELETE" || deleting} onClick={async () => {
                    setDeleting(true);
                    try {
                      const { error } = await supabase.rpc("delete_own_account");
                      if (error) throw error;
                      await supabase.auth.signOut();
                      navigate("/");
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message || "Failed to delete account", variant: "destructive" });
                      setDeleting(false);
                    }
                  }}
                  className="flex-1 h-10 border-2 border-destructive bg-destructive text-destructive-foreground font-mono text-xs uppercase hover:bg-destructive/90">
                  {deleting ? "Deleting..." : "Delete My Account"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default MyProfile;
