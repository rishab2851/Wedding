export type WeddingEvent =
  | 'Mehendi / Ghee Pilayi'
  | 'Carnival'
  | 'Haldi'
  | 'Sangeet'
  | 'Mayra'
  | 'Dora Padla'
  | 'Wedding Ceremony'
  | 'Reception';

export const WEDDING_EVENTS: WeddingEvent[] = [
  'Mehendi / Ghee Pilayi',
  'Carnival',
  'Haldi',
  'Sangeet',
  'Mayra',
  'Dora Padla',
  'Wedding Ceremony',
  'Reception',
];

export interface FamilyMember {
  id: string;
  name: string;
  relationRole: string; // e.g., "Groom's Father", "Bride's Sister", "Coordinator"
  whatsappNumber: string; // e.g., "+919829012345"
  canEdit: boolean;
}

export interface Expense {
  id: string;
  event: WeddingEvent;
  name: string;
  amount: number;
  paidBy: string; // FamilyMember name or id
  comment?: string;
  date: string; // YYYY-MM-DD
}

export type TaskStatus = 'Pending' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  name: string;
  event: WeddingEvent | 'General / Pre-Wedding';
  assignedTo: string; // FamilyMember name
  deadline: string; // YYYY-MM-DD
  notes?: string;
  status: TaskStatus;
  createdAt: string;
}

export interface HotelGuest {
  id: string;
  guestName: string;
  roomNumber: string;
  travelDate: string; // Arrival / check-in date (YYYY-MM-DD or readable string)
  hasArrived: boolean;
  notes?: string;
}

export interface TravelGuest {
  id: string;
  guestName: string;
  transportMode: 'Flight' | 'Train' | 'Car' | 'Bus' | string;
  travelDateToAndFro: string; // e.g. "Dec 17 (10:30 AM) - Dec 20 (6:00 PM)"
  pickedUpBy: string; // Assigned family member / driver
  isAddressed: boolean; // Checkbox whether picked up / attended
  flightOrTrainDetails?: string; // e.g. "6E-204 from Delhi" or "Vande Bharat"
}

export interface WeddingSettings {
  coupleNames: string; // e.g., "Aarav & Ananya"
  weddingDate: string; // YYYY-MM-DD
  weddingTime?: string;
  venueCity: string;
  venueName: string;
  heroImageUrl?: string;
}
