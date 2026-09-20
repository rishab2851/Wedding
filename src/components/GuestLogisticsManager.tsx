import React, { useState, useRef, useMemo } from 'react';
import {
  HotelGuest,
  TravelGuest,
  FamilyMember,
} from '../types';
import {
  parseHotelExcel,
  parseTravelExcel,
  downloadHotelTemplate,
  downloadTravelTemplate,
  exportHotelToExcel,
  exportTravelToExcel,
} from '../utils/excelHelpers';
import {
  Building2,
  Car,
  FileSpreadsheet,
  Upload,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Plane,
  Train,
  Bus,
  RefreshCw,
  User,
} from 'lucide-react';

interface GuestLogisticsManagerProps {
  hotelGuests: HotelGuest[];
  travelGuests: TravelGuest[];
  familyMembers: FamilyMember[];
  onUpdateHotelGuests: (guests: HotelGuest[]) => void;
  onUpdateTravelGuests: (guests: TravelGuest[]) => void;
}

export const GuestLogisticsManager: React.FC<GuestLogisticsManagerProps> = ({
  hotelGuests,
  travelGuests,
  familyMembers,
  onUpdateHotelGuests,
  onUpdateTravelGuests,
}) => {
  // Sub-tabs: 'hotel' | 'travel'
  const [activeTab, setActiveTab] = useState<'hotel' | 'travel'>('hotel');

  // Excel upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [hotelFilter, setHotelFilter] = useState<'ALL' | 'ARRIVED' | 'PENDING'>('ALL');
  const [travelFilter, setTravelFilter] = useState<'ALL' | 'ADDRESSED' | 'PENDING'>('ALL');

  // Manual Add modals
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [showAddTravelModal, setShowAddTravelModal] = useState(false);

  // Form states for manual add
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelRoom, setNewHotelRoom] = useState('');
  const [newHotelDate, setNewHotelDate] = useState('');
  const [newHotelNotes, setNewHotelNotes] = useState('');

  const [newTravelName, setNewTravelName] = useState('');
  const [newTravelMode, setNewTravelMode] = useState<'Flight' | 'Train' | 'Car' | 'Bus'>('Flight');
  const [newTravelDateToFro, setNewTravelDateToFro] = useState('');
  const [newTravelPickedBy, setNewTravelPickedBy] = useState(
    familyMembers[0]?.name || 'Rahul (Cousin)'
  );
  const [newTravelDetails, setNewTravelDetails] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const hotelStats = useMemo(() => {
    const total = hotelGuests.length;
    const arrived = hotelGuests.filter((g) => g.hasArrived).length;
    const pending = total - arrived;
    return { total, arrived, pending };
  }, [hotelGuests]);

  const travelStats = useMemo(() => {
    const total = travelGuests.length;
    const addressed = travelGuests.filter((g) => g.isAddressed).length;
    const pending = total - addressed;
    return { total, addressed, pending };
  }, [travelGuests]);

  // Handle Excel Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFeedback(null);

    try {
      if (activeTab === 'hotel') {
        const imported = await parseHotelExcel(file);
        if (imported.length === 0) {
          throw new Error('No guest records found in sheet. Please verify column headers.');
        }
        onUpdateHotelGuests([...hotelGuests, ...imported]);
        setUploadFeedback({
          type: 'success',
          message: `Successfully imported ${imported.length} hotel guest allocations!`,
        });
      } else {
        const imported = await parseTravelExcel(file);
        if (imported.length === 0) {
          throw new Error('No travel records found in sheet. Please verify column headers.');
        }
        onUpdateTravelGuests([...travelGuests, ...imported]);
        setUploadFeedback({
          type: 'success',
          message: `Successfully imported ${imported.length} travel & pickup schedules!`,
        });
      }
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err.message || 'Failed to parse Excel file. Please use the provided template.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setUploadFeedback(null), 6000);
    }
  };

  // Toggle Arrival
  const toggleHotelArrival = (id: string) => {
    onUpdateHotelGuests(
      hotelGuests.map((g) => (g.id === id ? { ...g, hasArrived: !g.hasArrived } : g))
    );
  };

  // Toggle Travel Addressed
  const toggleTravelAddressed = (id: string) => {
    onUpdateTravelGuests(
      travelGuests.map((g) => (g.id === id ? { ...g, isAddressed: !g.isAddressed } : g))
    );
  };

  // Delete Guest
  const deleteHotelGuest = (id: string) => {
    onUpdateHotelGuests(hotelGuests.filter((g) => g.id !== id));
  };

  const deleteTravelGuest = (id: string) => {
    onUpdateTravelGuests(travelGuests.filter((g) => g.id !== id));
  };

  // Filtered Hotel Guests
  const filteredHotelGuests = useMemo(() => {
    return hotelGuests.filter((g) => {
      const matchesSearch =
        !searchQuery ||
        g.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.notes && g.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        hotelFilter === 'ALL' ||
        (hotelFilter === 'ARRIVED' && g.hasArrived) ||
        (hotelFilter === 'PENDING' && !g.hasArrived);

      return matchesSearch && matchesStatus;
    });
  }, [hotelGuests, searchQuery, hotelFilter]);

  // Filtered Travel Guests
  const filteredTravelGuests = useMemo(() => {
    return travelGuests.filter((g) => {
      const matchesSearch =
        !searchQuery ||
        g.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.pickedUpBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.transportMode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.flightOrTrainDetails &&
          g.flightOrTrainDetails.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        travelFilter === 'ALL' ||
        (travelFilter === 'ADDRESSED' && g.isAddressed) ||
        (travelFilter === 'PENDING' && !g.isAddressed);

      return matchesSearch && matchesStatus;
    });
  }, [travelGuests, searchQuery, travelFilter]);

  // Submit Manual Hotel Guest
  const handleAddHotelGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName.trim()) return;

    onUpdateHotelGuests([
      {
        id: `hg-manual-${Date.now()}`,
        guestName: newHotelName.trim(),
        roomNumber: newHotelRoom.trim() || 'Pending Allotment',
        travelDate: newHotelDate.trim() || 'TBD',
        hasArrived: false,
        notes: newHotelNotes.trim() || undefined,
      },
      ...hotelGuests,
    ]);

    setNewHotelName('');
    setNewHotelRoom('');
    setNewHotelDate('');
    setNewHotelNotes('');
    setShowAddHotelModal(false);
  };

  // Submit Manual Travel Guest
  const handleAddTravelGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTravelName.trim()) return;

    onUpdateTravelGuests([
      {
        id: `tg-manual-${Date.now()}`,
        guestName: newTravelName.trim(),
        transportMode: newTravelMode,
        travelDateToAndFro: newTravelDateToFro.trim() || 'Arrival: TBD | Departure: TBD',
        pickedUpBy: newTravelPickedBy,
        isAddressed: false,
        flightOrTrainDetails: newTravelDetails.trim() || undefined,
      },
      ...travelGuests,
    ]);

    setNewTravelName('');
    setNewTravelDateToFro('');
    setNewTravelDetails('');
    setShowAddTravelModal(false);
  };

  // Transport mode icon
  const getTransportIcon = (mode: string) => {
    const lower = mode.toLowerCase();
    if (lower.includes('flight') || lower.includes('air')) return <Plane className="w-4 h-4 text-sky-600" />;
    if (lower.includes('train') || lower.includes('rail')) return <Train className="w-4 h-4 text-emerald-600" />;
    if (lower.includes('bus')) return <Bus className="w-4 h-4 text-amber-600" />;
    return <Car className="w-4 h-4 text-[#B2503A]" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-Tab Switcher */}
      <div className="luxury-card rounded-3xl p-6 md:p-8 space-y-6 bg-gradient-to-br from-white to-[#FAF7F2]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D7C3] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B2503A] mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospitality & Transport Operations</span>
            </div>
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C2420]">
              Guest List & Logistics Manager
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6B60]">
              Seamlessly import Excel sheets for hotel room allotments and airport/train pickup schedules.
            </p>
          </div>

          {/* Sub-tab pills */}
          <div className="flex items-center p-1 rounded-2xl bg-[#EFE9DF] border border-[#DFD3C3] self-start sm:self-auto">
            <button
              id="tab-hotel-management-btn"
              onClick={() => {
                setActiveTab('hotel');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'hotel'
                  ? 'bg-white text-[#2C2420] shadow-sm'
                  : 'text-[#7A6B60] hover:text-[#2C2420]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#B2503A]" />
              <span>1. Hotel & Room Allotment ({hotelStats.total})</span>
            </button>
            <button
              id="tab-travel-logistics-btn"
              onClick={() => {
                setActiveTab('travel');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'travel'
                  ? 'bg-white text-[#2C2420] shadow-sm'
                  : 'text-[#7A6B60] hover:text-[#2C2420]'
              }`}
            >
              <Car className="w-4 h-4 text-[#8C6221]" />
              <span>2. Travel & Pickup Logistics ({travelStats.total})</span>
            </button>
          </div>
        </div>

        {/* Excel Import/Export Control Bar */}
        <div className="bg-[#FAF4EB] border border-[#E5D7C7] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#C5A059]/20 text-[#8C6221] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#2C2420]">
                {activeTab === 'hotel'
                  ? 'Excel Import: Room & Arrival Checklist'
                  : 'Excel Import: Travel Mode & Pickup Coordination'}
              </h4>
              <p className="text-xs text-[#7A6B60]">
                Upload your ready Excel file (.xlsx, .xls, .csv) or download our formatted sample template.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Template Download */}
            <button
              id="download-excel-template-btn"
              onClick={() =>
                activeTab === 'hotel' ? downloadHotelTemplate() : downloadTravelTemplate()
              }
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#F7EFE4] border border-[#D9C8B5] text-xs font-semibold text-[#66554A] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Download empty Excel template with proper columns"
            >
              <Download className="w-3.5 h-3.5 text-[#8C6221]" />
              <span>Template</span>
            </button>

            {/* Upload Excel Button */}
            <button
              id="import-excel-btn"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-[#8C6221] hover:bg-[#73501A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Importing...' : 'Upload Excel Sheet'}</span>
            </button>

            {/* Export Current Button */}
            <button
              id="export-current-excel-btn"
              onClick={() =>
                activeTab === 'hotel'
                  ? exportHotelToExcel(hotelGuests)
                  : exportTravelToExcel(travelGuests)
              }
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#F7EFE4] border border-[#D9C8B5] text-xs font-semibold text-[#66554A] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Export current table to Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export</span>
            </button>

            {/* Manual Add Button */}
            <button
              id="manual-add-guest-btn"
              onClick={() =>
                activeTab === 'hotel'
                  ? setShowAddHotelModal(true)
                  : setShowAddTravelModal(true)
              }
              className="px-3.5 py-2 rounded-xl bg-[#B2503A] hover:bg-[#9E2A2B] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* Upload feedback banner */}
        {uploadFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in duration-200 ${
              uploadFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadFeedback.message}</span>
          </div>
        )}

        {/* Summary Metric Strip */}
        {activeTab === 'hotel' ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD1] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B] block">
                Total Hotel Guests
              </span>
              <span className="font-serif-heading text-xl font-bold text-[#2C2420]">
                {hotelStats.total}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#EFF8F2] border border-[#CDE5D5] text-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 block">
                Arrived & Checked-In
              </span>
              <span className="font-serif-heading text-xl font-bold text-emerald-700">
                {hotelStats.arrived}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FDF2F0] border border-[#F3D7CA] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#B2503A] block">
                Pending Arrival
              </span>
              <span className="font-serif-heading text-xl font-bold text-[#B2503A]">
                {hotelStats.pending}
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD1] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#8C7A6B] block">
                Total Travel Logs
              </span>
              <span className="font-serif-heading text-xl font-bold text-[#2C2420]">
                {travelStats.total}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#EFF8F2] border border-[#CDE5D5] text-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-800 block">
                Pickup Addressed / Done
              </span>
              <span className="font-serif-heading text-xl font-bold text-emerald-700">
                {travelStats.addressed}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAF0E6] border border-[#E8DAC5] text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#8C6221] block">
                Pending / En Route
              </span>
              <span className="font-serif-heading text-xl font-bold text-[#8C6221]">
                {travelStats.pending}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A6B]" />
          <input
            id="logistics-search-input"
            type="text"
            placeholder={
              activeTab === 'hotel'
                ? 'Search guests by name, room number, or notes...'
                : 'Search by guest, transport mode, pickup coordinator...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#D9C8B5] rounded-xl text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40 shadow-xs"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {activeTab === 'hotel' ? (
            <>
              <button
                onClick={() => setHotelFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  hotelFilter === 'ALL'
                    ? 'bg-[#2C2420] text-white'
                    : 'bg-white text-[#7A6B60] border border-[#D9C8B5]'
                }`}
              >
                All ({hotelGuests.length})
              </button>
              <button
                onClick={() => setHotelFilter('ARRIVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  hotelFilter === 'ARRIVED'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-emerald-800 border border-[#CDE5D5]'
                }`}
              >
                Arrived ({hotelStats.arrived})
              </button>
              <button
                onClick={() => setHotelFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  hotelFilter === 'PENDING'
                    ? 'bg-[#B2503A] text-white'
                    : 'bg-white text-[#B2503A] border border-[#F3D7CA]'
                }`}
              >
                Pending ({hotelStats.pending})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setTravelFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  travelFilter === 'ALL'
                    ? 'bg-[#2C2420] text-white'
                    : 'bg-white text-[#7A6B60] border border-[#D9C8B5]'
                }`}
              >
                All ({travelGuests.length})
              </button>
              <button
                onClick={() => setTravelFilter('ADDRESSED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  travelFilter === 'ADDRESSED'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-emerald-800 border border-[#CDE5D5]'
                }`}
              >
                Addressed ({travelStats.addressed})
              </button>
              <button
                onClick={() => setTravelFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  travelFilter === 'PENDING'
                    ? 'bg-[#8C6221] text-white'
                    : 'bg-white text-[#8C6221] border border-[#E0CFBD]'
                }`}
              >
                Pending Pickup ({travelStats.pending})
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- TABLE 1: HOTEL MANAGEMENT (Excel 1: Guest Name, Room Allotted, Travel Date, Checkbox Arrived) --- */}
      {activeTab === 'hotel' && (
        <div className="luxury-card rounded-2xl overflow-hidden border border-[#E8DDD1]">
          <div className="overflow-x-auto">
            <table id="hotel-guests-table" className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF6F0] text-[#7A6B60] uppercase text-[11px] font-semibold border-b border-[#E8DDD1]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Arrived?</th>
                  <th className="py-3.5 px-4">Guest Name</th>
                  <th className="py-3.5 px-4">Room No. Allotted</th>
                  <th className="py-3.5 px-4">Travel / Check-in Date</th>
                  <th className="py-3.5 px-4">Special Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DF]">
                {filteredHotelGuests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#8C7A6B] italic">
                      No hotel guest records match your search or filter. Upload your Excel or click "Add Guest".
                    </td>
                  </tr>
                ) : (
                  filteredHotelGuests.map((guest) => (
                    <tr
                      key={guest.id}
                      className={`hover:bg-[#FAF7F2] transition-colors ${
                        guest.hasArrived ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Interactive Checkbox for Arrival */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleHotelArrival(guest.id)}
                          className="p-1 text-emerald-700 hover:scale-110 transition-transform cursor-pointer"
                          title={guest.hasArrived ? 'Mark as Not Arrived' : 'Mark as Arrived'}
                        >
                          {guest.hasArrived ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Square className="w-5 h-5 text-[#B0A093] hover:text-[#8C6221]" />
                          )}
                        </button>
                      </td>

                      {/* Guest Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#2C2420]">
                          {guest.guestName}
                        </div>
                        {guest.hasArrived ? (
                          <span className="inline-block text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                            ✓ Arrived
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-medium text-amber-700">
                            Awaiting Arrival
                          </span>
                        )}
                      </td>

                      {/* Room Number Allotted */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#8C6221] font-semibold text-xs border border-[#E0CFBD]">
                          <Building2 className="w-3 h-3 mr-1 text-[#B2503A]" />
                          {guest.roomNumber || 'Not Set'}
                        </span>
                      </td>

                      {/* Travel Date */}
                      <td className="py-3.5 px-4 text-[#55473F] font-medium">
                        {guest.travelDate || 'TBD'}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-xs text-[#7A6B60] max-w-xs truncate">
                        {guest.notes || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteHotelGuest(guest.id)}
                          className="p-1.5 text-[#A39284] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TABLE 2: TRAVEL & PICKUP LOGISTICS (Excel 2: Guest Name, Mode of Transport, Travel Date To & Fro, Picked Up By, Checkbox Addressed) --- */}
      {activeTab === 'travel' && (
        <div className="luxury-card rounded-2xl overflow-hidden border border-[#E8DDD1]">
          <div className="overflow-x-auto">
            <table id="travel-logistics-table" className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF6F0] text-[#7A6B60] uppercase text-[11px] font-semibold border-b border-[#E8DDD1]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Addressed?</th>
                  <th className="py-3.5 px-4">Guest Name</th>
                  <th className="py-3.5 px-4">Transport Mode</th>
                  <th className="py-3.5 px-4">Travel Date (To & Fro)</th>
                  <th className="py-3.5 px-4">Flight / Train Details</th>
                  <th className="py-3.5 px-4">Who Picks Them Up</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DF]">
                {filteredTravelGuests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#8C7A6B] italic">
                      No travel coordination records match your search or filter. Upload your Excel or click "Add Guest".
                    </td>
                  </tr>
                ) : (
                  filteredTravelGuests.map((travel) => (
                    <tr
                      key={travel.id}
                      className={`hover:bg-[#FAF7F2] transition-colors ${
                        travel.isAddressed ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Interactive Checkbox for Addressed / Picked Up */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleTravelAddressed(travel.id)}
                          className="p-1 text-emerald-700 hover:scale-110 transition-transform cursor-pointer"
                          title={travel.isAddressed ? 'Mark as Pending Pickup' : 'Mark as Addressed / Picked Up'}
                        >
                          {travel.isAddressed ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Square className="w-5 h-5 text-[#B0A093] hover:text-[#8C6221]" />
                          )}
                        </button>
                      </td>

                      {/* Guest Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#2C2420]">
                          {travel.guestName}
                        </div>
                        {travel.isAddressed ? (
                          <span className="inline-block text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                            ✓ Handled & Picked Up
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-medium text-amber-700">
                            Pending Pickup
                          </span>
                        )}
                      </td>

                      {/* Transport Mode */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#8C6221] font-semibold text-xs border border-[#E0CFBD]">
                          {getTransportIcon(travel.transportMode)}
                          <span>{travel.transportMode}</span>
                        </span>
                      </td>

                      {/* Travel Date To & Fro */}
                      <td className="py-3.5 px-4 text-[#4A3D35] font-medium max-w-xs">
                        {travel.travelDateToAndFro}
                      </td>

                      {/* Flight / Train details */}
                      <td className="py-3.5 px-4 text-xs text-[#7A6B60]">
                        {travel.flightOrTrainDetails || '—'}
                      </td>

                      {/* Who Would Pick Them Up */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2C2420] bg-white px-2.5 py-1 rounded-lg border border-[#D9C8B5]">
                          <User className="w-3 h-3 text-[#B2503A]" />
                          <span>{travel.pickedUpBy}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => deleteTravelGuest(travel.id)}
                          className="p-1.5 text-[#A39284] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD HOTEL GUEST MANUALLY --- */}
      {showAddHotelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E8D7C3] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6DA]">
              <h3 className="font-serif-heading text-xl font-bold text-[#2C2420]">
                Add Hotel Room Allotment
              </h3>
              <button
                onClick={() => setShowAddHotelModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF0E6] text-[#8C7A6B] hover:text-[#2C2420] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddHotelGuestSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Guest Name(s) / Family *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anand Singhania & Family (3 guests)"
                  value={newHotelName}
                  onChange={(e) => setNewHotelName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Room Number Allotted *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 304 / Villa 2"
                  value={newHotelRoom}
                  onChange={(e) => setNewHotelRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Travel / Arrival Date *
                </label>
                <input
                  type="date"
                  value={newHotelDate}
                  onChange={(e) => setNewHotelDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Notes / Special Requests (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ground floor preferred, extra crib"
                  value={newHotelNotes}
                  onChange={(e) => setNewHotelNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0E6DA]">
                <button
                  type="button"
                  onClick={() => setShowAddHotelModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D9C8B5] text-xs font-semibold text-[#7A6B60]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#B2503A] hover:bg-[#9E2A2B] text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  Add Room Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD TRAVEL GUEST MANUALLY --- */}
      {showAddTravelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E8D7C3] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E6DA]">
              <h3 className="font-serif-heading text-xl font-bold text-[#2C2420]">
                Add Travel & Pickup Logistics
              </h3>
              <button
                onClick={() => setShowAddTravelModal(false)}
                className="w-7 h-7 rounded-full bg-[#FAF0E6] text-[#8C7A6B] hover:text-[#2C2420] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddTravelGuestSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Guest Name(s) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Chordia & Family"
                  value={newTravelName}
                  onChange={(e) => setNewTravelName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                    Mode of Transport *
                  </label>
                  <select
                    value={newTravelMode}
                    onChange={(e) => setNewTravelMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-xs font-semibold text-[#2C2420]"
                  >
                    <option value="Flight">Flight ✈️</option>
                    <option value="Train">Train 🚆</option>
                    <option value="Car">Car 🚗</option>
                    <option value="Bus">Bus 🚌</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                    Who Would Pick Up *
                  </label>
                  <select
                    value={newTravelPickedBy}
                    onChange={(e) => setNewTravelPickedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-xs font-semibold text-[#2C2420]"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Travel Date To & Fro *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arrival: 26 Nov 11:20 AM | Dep: 29 Nov 04:00 PM"
                  value={newTravelDateToFro}
                  onChange={(e) => setNewTravelDateToFro(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6B60] mb-1">
                  Flight / Train / Vehicle Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. IndiGo 6E-205 from Delhi (T3)"
                  value={newTravelDetails}
                  onChange={(e) => setNewTravelDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D9C8B5] rounded-xl text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#B2503A]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0E6DA]">
                <button
                  type="button"
                  onClick={() => setShowAddTravelModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D9C8B5] text-xs font-semibold text-[#7A6B60]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#B2503A] hover:bg-[#9E2A2B] text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  Add Travel Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
