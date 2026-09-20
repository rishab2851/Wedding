import React, { useState } from 'react';
import {
  WeddingSettings,
  FamilyMember,
} from '../types';
import {
  Settings,
  Calendar,
  Heart,
  MapPin,
  Users,
  MessageCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Save,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface SettingsManagerProps {
  settings: WeddingSettings;
  familyMembers: FamilyMember[];
  activeMemberId: string;
  onUpdateSettings: (settings: WeddingSettings) => void;
  onUpdateFamilyMembers: (members: FamilyMember[]) => void;
  onSelectActiveMember: (id: string) => void;
  onResetData: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  familyMembers,
  activeMemberId,
  onUpdateSettings,
  onUpdateFamilyMembers,
  onSelectActiveMember,
  onResetData,
}) => {
  // Wedding details state
  const [coupleNames, setCoupleNames] = useState(settings.coupleNames);
  const [weddingDate, setWeddingDate] = useState(settings.weddingDate);
  const [weddingTime, setWeddingTime] = useState(settings.weddingTime || '18:00');
  const [venueCity, setVenueCity] = useState(settings.venueCity);
  const [venueName, setVenueName] = useState(settings.venueName);
  const [heroImageUrl, setHeroImageUrl] = useState(settings.heroImageUrl || '');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Add family member state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberWhatsapp, setNewMemberWhatsapp] = useState('+91');

  // Editing existing member state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      coupleNames: coupleNames.trim() || 'The Couple',
      weddingDate,
      weddingTime,
      venueCity: venueCity.trim(),
      venueName: venueName.trim(),
      heroImageUrl: heroImageUrl.trim() || undefined,
    });
    setSaveSuccessMessage('Wedding settings & countdown updated successfully!');
    setTimeout(() => setSaveSuccessMessage(''), 3500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: newMemberName.trim(),
      relationRole: newMemberRole.trim() || 'Family Member',
      whatsappNumber: newMemberWhatsapp.trim() || '+91',
      canEdit: true,
    };

    onUpdateFamilyMembers([...familyMembers, newMember]);
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberWhatsapp('+91');
    setShowAddMemberModal(false);
  };

  const startEditMember = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    setEditName(member.name);
    setEditRole(member.relationRole);
    setEditWhatsapp(member.whatsappNumber);
  };

  const saveEditMember = (id: string) => {
    onUpdateFamilyMembers(
      familyMembers.map((m) =>
        m.id === id
          ? {
              ...m,
              name: editName.trim() || m.name,
              relationRole: editRole.trim() || m.relationRole,
              whatsappNumber: editWhatsapp.trim() || m.whatsappNumber,
            }
          : m
      )
    );
    setEditingMemberId(null);
  };

  const handleDeleteMember = (id: string) => {
    if (familyMembers.length <= 1) {
      alert('At least one family member is required to manage the wedding.');
      return;
    }
    onUpdateFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  // WhatsApp click to chat URL
  const getWhatsappUrl = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${name}! Sharing an update regarding our wedding preparations via the Wedding Planner app.`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="luxury-card rounded-3xl p-6 md:p-8 space-y-2 bg-gradient-to-br from-white to-[#FAF6F0]">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B2503A]">
          <Settings className="w-3.5 h-3.5" />
          <span>Application Preferences</span>
        </div>
        <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C2420]">
          Wedding Settings & Family Access
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6B60]">
          Configure countdown date, couple names, venue details, and authorized family member contacts with WhatsApp integration.
        </p>
      </div>

      {/* 1. Wedding Date & Celebration Details (Powers Countdown) */}
      <section className="luxury-card rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4 border-b border-[#F0E6DA] pb-3">
          <Calendar className="w-5 h-5 text-[#B2503A]" />
          <h2 className="font-serif-heading text-xl font-bold text-[#2C2420]">
            Wedding Date & Couple Information (Powers Countdown)
          </h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Couple's names */}
            <div>
              <label
                htmlFor="settings-couple-names"
                className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
              >
                Couple's Names *
              </label>
              <div className="relative">
                <Heart className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B2503A]" />
                <input
                  id="settings-couple-names"
                  type="text"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  placeholder="e.g. Aarav & Ananya"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm font-semibold text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div>
              <label
                htmlFor="settings-wedding-date"
                className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
              >
                Wedding Date * (Powers Days-to-go)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C6221]" />
                <input
                  id="settings-wedding-date"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm font-semibold text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>
            </div>

            {/* Venue City */}
            <div>
              <label
                htmlFor="settings-venue-city"
                className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
              >
                Destination / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C5A059]" />
                <input
                  id="settings-venue-city"
                  type="text"
                  value={venueCity}
                  onChange={(e) => setVenueCity(e.target.value)}
                  placeholder="e.g. Udaipur, Rajasthan"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                />
              </div>
            </div>

            {/* Venue Name */}
            <div>
              <label
                htmlFor="settings-venue-name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
              >
                Venue Name / Resort
              </label>
              <input
                id="settings-venue-name"
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. The Oberoi Udaivilas Palace"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
              />
            </div>
          </div>

          {/* Hero background image URL */}
          <div>
            <label
              htmlFor="settings-hero-image"
              className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1.5"
            >
              Hero Card Background Image URL (Optional)
            </label>
            <input
              id="settings-hero-image"
              type="url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-xs text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccessMessage ? (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                {saveSuccessMessage}
              </span>
            ) : (
              <span className="text-xs text-[#8C7A6B]">
                Changes instantly update the countdown hero banner on all tabs
              </span>
            )}

            <button
              id="save-settings-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#8C6221] hover:bg-[#73501A] text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </section>

      {/* 2. People & Contacts — list of family members with Name (pre-filled), WhatsApp number */}
      <section id="people-contacts-section" className="luxury-card rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6DA] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#B2503A]" />
              <h2 className="font-serif-heading text-xl md:text-2xl font-bold text-[#2C2420]">
                People & Family Contacts
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A6B60] mt-1">
              Family members who have access to the application to add, edit, and update budgets and tasks.
            </p>
          </div>

          <button
            id="open-add-member-modal-btn"
            onClick={() => setShowAddMemberModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B2503A] to-[#8F3B27] text-white text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Member</span>
          </button>
        </div>

        {/* Current Active Person Switcher */}
        <div className="bg-[#FAF0E6]/70 border border-[#E8D7C3] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C6221] block">
              Active Member Profile
            </span>
            <p className="text-xs text-[#7A6B60]">
              Switch which family member you are currently coordinating as:
            </p>
          </div>

          <select
            id="active-member-selector"
            value={activeMemberId}
            onChange={(e) => onSelectActiveMember(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#D9C8B5] rounded-xl text-xs sm:text-sm font-semibold text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40 min-w-[220px]"
          >
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.relationRole})
              </option>
            ))}
          </select>
        </div>

        {/* Family Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map((member) => {
            const isEditing = editingMemberId === member.id;
            const isCurrentActive = member.id === activeMemberId;

            return (
              <div
                key={member.id}
                id={`family-member-card-${member.id}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrentActive
                    ? 'border-[#B2503A] bg-[#FFF9F7] ring-1 ring-[#B2503A]/30'
                    : 'border-[#E8DDD1] bg-[#FAF8F5] hover:border-[#C5A059]'
                }`}
              >
                {isEditing ? (
                  /* Inline Edit Form */
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[#8C7A6B] block">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#D9C8B5] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[#8C7A6B] block">
                        Role / Relationship
                      </label>
                      <input
                        type="text"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#D9C8B5] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-[#8C7A6B] block">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-[#D9C8B5] rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => saveEditMember(member.id)}
                        className="px-3 py-1 bg-[#8C6221] text-white text-xs font-semibold rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMemberId(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal Card View */
                  <>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#FAF0E6] border border-[#E0CFBD] flex items-center justify-center font-serif-heading font-bold text-sm text-[#8C6221]">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-[#2C2420] flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isCurrentActive && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#B2503A] text-white font-bold uppercase">
                                  You
                                </span>
                              )}
                            </h4>
                            <span className="text-xs text-[#7A6B60] block">
                              {member.relationRole}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Editor</span>
                        </span>
                      </div>

                      {/* WhatsApp contact pill with direct link */}
                      <div className="pt-2 border-t border-[#F0E6DA]">
                        <a
                          href={getWhatsappUrl(member.whatsappNumber, member.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition-colors group"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                          <span>WhatsApp: {member.whatsappNumber}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </a>
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="mt-4 pt-2.5 border-t border-[#F0E6DA] flex items-center justify-between text-xs">
                      <button
                        onClick={() => startEditMember(member)}
                        className="text-[#8C6221] hover:text-[#73501A] font-medium flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {familyMembers.length > 1 && (
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-[#A39284] hover:text-rose-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. System Reset & Data Management */}
      <section className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#E8DDD1] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-sm text-[#2C2420]">
            Reset to Standard Wedding Template Data
          </h4>
          <p className="text-xs text-[#7A6B60]">
            Restores initial sample data for Udaipur celebration (Aarav & Ananya).
          </p>
        </div>

        <button
          id="reset-wedding-data-btn"
          onClick={() => {
            if (confirm('Are you sure you want to reset all wedding records to initial demo state?')) {
              onResetData();
            }
          }}
          className="px-4 py-2 rounded-xl bg-white hover:bg-[#F5ECE2] border border-[#D9C8B5] text-xs font-semibold text-[#8C6221] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </section>

      {/* --- MODAL: ADD FAMILY MEMBER --- */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E8D7C3] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6DA]">
              <h3 className="font-serif-heading text-xl font-bold text-[#2C2420]">
                Add Family Member
              </h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF0E6] text-[#8C7A6B] hover:text-[#2C2420] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Uncle / Priya Chordia"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Relationship / Wedding Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Groom's Sister / Decor Coordinator"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  WhatsApp Number (with Country Code) *
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
                  <input
                    type="text"
                    placeholder="+91 98290 12345"
                    value={newMemberWhatsapp}
                    onChange={(e) => setNewMemberWhatsapp(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm font-medium text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0E6DA]">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D9C8B5] text-xs font-semibold text-[#7A6B60]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#B2503A] hover:bg-[#9E2A2B] text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
