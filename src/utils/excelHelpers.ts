import * as XLSX from 'xlsx';
import { HotelGuest, TravelGuest } from '../types';

// Helper to normalize string keys
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function parseHotelExcel(file: File): Promise<HotelGuest[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
  });

  const parsedGuests: HotelGuest[] = [];

  for (let i = 0; i < jsonRows.length; i++) {
    const row = jsonRows[i];
    // Match flexible column names
    let guestName = '';
    let roomNumber = '';
    let travelDate = '';
    let hasArrived = false;
    let notes = '';

    for (const rawKey of Object.keys(row)) {
      const key = normalizeKey(rawKey);
      const val = String(row[rawKey]).trim();

      if (key.includes('guest') || key.includes('name') || key === 'fullname') {
        guestName = guestName || val;
      } else if (key.includes('room') || key.includes('allot') || key.includes('roomno')) {
        roomNumber = roomNumber || val;
      } else if (key.includes('travel') || key.includes('arrival') || key.includes('checkin') || key.includes('date')) {
        travelDate = travelDate || val;
      } else if (key.includes('arrived') || key.includes('arrivalstatus') || key.includes('status') || key.includes('check')) {
        const lowerVal = val.toLowerCase();
        if (lowerVal === 'yes' || lowerVal === 'y' || lowerVal === 'true' || lowerVal === '1' || lowerVal === 'arrived') {
          hasArrived = true;
        }
      } else if (key.includes('note') || key.includes('remark') || key.includes('comment')) {
        notes = notes || val;
      }
    }

    if (guestName || roomNumber) {
      parsedGuests.push({
        id: `hg-imported-${Date.now()}-${i}`,
        guestName: guestName || `Guest #${i + 1}`,
        roomNumber: roomNumber || 'Pending Allotment',
        travelDate: travelDate || 'TBD',
        hasArrived,
        notes,
      });
    }
  }

  return parsedGuests;
}

export async function parseTravelExcel(file: File): Promise<TravelGuest[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
  });

  const parsedTravels: TravelGuest[] = [];

  for (let i = 0; i < jsonRows.length; i++) {
    const row = jsonRows[i];
    let guestName = '';
    let transportMode = 'Flight';
    let travelDateToAndFro = '';
    let pickedUpBy = 'Unassigned';
    let isAddressed = false;
    let flightOrTrainDetails = '';

    for (const rawKey of Object.keys(row)) {
      const key = normalizeKey(rawKey);
      const val = String(row[rawKey]).trim();

      if (key.includes('guest') || key.includes('name')) {
        guestName = guestName || val;
      } else if (key.includes('mode') || key.includes('transport') || key.includes('vehicle')) {
        transportMode = val || transportMode;
      } else if (key.includes('tofro') || key.includes('traveldate') || key.includes('date') || key.includes('schedule')) {
        travelDateToAndFro = travelDateToAndFro || val;
      } else if (key.includes('pickup') || key.includes('driver') || key.includes('assigned') || key.includes('coordinator')) {
        pickedUpBy = val || pickedUpBy;
      } else if (key.includes('addressed') || key.includes('handled') || key.includes('done') || key.includes('status')) {
        const lowerVal = val.toLowerCase();
        if (lowerVal === 'yes' || lowerVal === 'y' || lowerVal === 'true' || lowerVal === '1' || lowerVal === 'addressed' || lowerVal === 'done') {
          isAddressed = true;
        }
      } else if (key.includes('detail') || key.includes('flight') || key.includes('train') || key.includes('pnr')) {
        flightOrTrainDetails = flightOrTrainDetails || val;
      }
    }

    if (guestName) {
      parsedTravels.push({
        id: `tg-imported-${Date.now()}-${i}`,
        guestName,
        transportMode: transportMode || 'Flight',
        travelDateToAndFro: travelDateToAndFro || 'Arrival: TBD | Departure: TBD',
        pickedUpBy: pickedUpBy || 'Unassigned',
        isAddressed,
        flightOrTrainDetails,
      });
    }
  }

  return parsedTravels;
}

export function downloadHotelTemplate() {
  const templateData = [
    {
      'Guest Name': 'Rajendra Sharma & Family (4 Pax)',
      'Room Number Allotted': 'Suite 104',
      'Travel Date (Arrival)': '2026-11-26',
      'Has Arrived (Yes/No)': 'No',
      'Special Notes': 'Extra crib requested for infant',
    },
    {
      'Guest Name': 'Meenakshi & Alok Chordia',
      'Room Number Allotted': 'Room 208',
      'Travel Date (Arrival)': '2026-11-26',
      'Has Arrived (Yes/No)': 'Yes',
      'Special Notes': 'Close to elevator please',
    },
    {
      'Guest Name': 'Aditya Kapoor (Groomsman)',
      'Room Number Allotted': 'Room 312',
      'Travel Date (Arrival)': '2026-11-27',
      'Has Arrived (Yes/No)': 'No',
      'Special Notes': 'Twin sharing with Rohan',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Hotel & Room Allotment');
  XLSX.writeFile(wb, 'Wedding_Hotel_Guests_Template.xlsx');
}

export function downloadTravelTemplate() {
  const templateData = [
    {
      'Guest Name': 'Rajendra Sharma & Family',
      'Mode of Transportation': 'Flight',
      'Travel Date To & Fro': 'Arrival: 26 Nov 11:30 AM | Dep: 29 Nov 04:00 PM',
      'Flight or Train Details': 'IndiGo 6E-205 from Delhi',
      'Who Will Pick Them Up': 'Rahul (Cousin)',
      'Addressed / Handled (Yes/No)': 'No',
    },
    {
      'Guest Name': 'Meenakshi & Alok Chordia',
      'Mode of Transportation': 'Train',
      'Travel Date To & Fro': 'Arrival: 26 Nov 06:15 AM | Dep: 29 Nov 08:30 PM',
      'Flight or Train Details': 'Chetak Express 20473',
      'Who Will Pick Them Up': 'Karan Chordia',
      'Addressed / Handled (Yes/No)': 'Yes',
    },
    {
      'Guest Name': 'Aditya Kapoor',
      'Mode of Transportation': 'Car',
      'Travel Date To & Fro': 'Arrival: 27 Nov 02:00 PM | Dep: 30 Nov 11:00 AM',
      'Flight or Train Details': 'Self drive from Jaipur',
      'Who Will Pick Them Up': 'Suresh Uncle',
      'Addressed / Handled (Yes/No)': 'No',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Travel & Pickup Logistics');
  XLSX.writeFile(wb, 'Wedding_Travel_Logistics_Template.xlsx');
}

export function exportHotelToExcel(guests: HotelGuest[]) {
  const exportData = guests.map((g) => ({
    'Guest Name': g.guestName,
    'Room Number Allotted': g.roomNumber,
    'Travel Date': g.travelDate,
    'Has Arrived': g.hasArrived ? 'Yes' : 'No',
    'Notes': g.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Hotel Guests');
  XLSX.writeFile(wb, `Wedding_Hotel_Guests_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportTravelToExcel(travels: TravelGuest[]) {
  const exportData = travels.map((t) => ({
    'Guest Name': t.guestName,
    'Mode of Transportation': t.transportMode,
    'Travel Date To & Fro': t.travelDateToAndFro,
    'Flight/Train Details': t.flightOrTrainDetails || '',
    'Who Would Pick Them Up': t.pickedUpBy,
    'Addressed': t.isAddressed ? 'Yes' : 'No',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Travel & Pickup');
  XLSX.writeFile(wb, `Wedding_Travel_Pickup_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
