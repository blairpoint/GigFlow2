import { DJProfile, TechItem, BankDetails, AdvancedTechRequirements, EventAsset } from './types';

export const DEFAULT_TECH_RIDER: TechItem[] = [
  { id: '1', name: '2x Pioneer CDJ-3000', essential: true },
  { id: '2', name: '1x Pioneer DJM-900NXS2 Mixer', essential: true },
  { id: '3', name: 'High-quality Booth Monitors', essential: true },
];

export const DEFAULT_BANK_DETAILS: BankDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  reference: ''
};

export const DEFAULT_TECH_REQUIREMENTS: AdvancedTechRequirements = {
  serato: { enabled: false, comment: '' },
  rekordbox: { enabled: false, comment: '' },
  laptopInput: { enabled: false, comment: '' },
  fourChannels: { enabled: false, comment: '' },
};

export const INITIAL_DJ_PROFILE: DJProfile = {
  name: 'DJ Nexus',
  bio: 'Electronic music producer and DJ specializing in deep house and techno. Over 10 years of experience playing at major clubs and festivals.',
  email: 'booking@djnexus.com',
  soundcloudUrl: 'https://soundcloud.com/example',
  hourlyRate: 250,
  currency: 'NZD',
  techRider: DEFAULT_TECH_RIDER,
  techRequirements: DEFAULT_TECH_REQUIREMENTS,
  genres: [
    { id: '1', name: 'Deep House', links: ['https://soundcloud.com/mix1'] },
    { id: '2', name: 'Techno', links: [] }
  ],
  schedule: [
    { id: '1', date: '2023-11-15', eventName: 'Warehouse Project, Manchester', type: 'PAST', link: 'https://soundcloud.com/mix1' },
    { id: '2', date: '2023-12-31', eventName: 'Printworks NYE', type: 'PAST' },
    { id: '3', date: '2025-06-15', eventName: 'Sonar Festival', type: 'FUTURE' },
    { id: '4', date: '2025-07-01', eventName: 'Available for Booking', type: 'AVAILABLE' },
    { id: '5', date: '2025-07-02', eventName: 'Available for Booking', type: 'AVAILABLE' },
  ],
  extras: [
    { id: '1', name: 'Additional PA System (Small)', price: 150, type: 'EQUIPMENT' },
    { id: '2', name: 'Lighting Package', price: 100, type: 'EQUIPMENT' },
    { id: '3', name: 'Sound Technician (Per Hour)', price: 50, type: 'SERVICE' }
  ],
  bankDetails: DEFAULT_BANK_DETAILS
};

export const MOCK_IMAGES = {
  PROFILE_BG: 'https://picsum.photos/1200/400',
  AVATAR: 'https://picsum.photos/200/200',
};

export const PROMOTER_CATALOG: Omit<EventAsset, 'id' | 'bookingId'>[] = [
  { name: 'Funktion-One Sound System', type: 'EQUIPMENT', cost: 1500, quantity: 1 },
  { name: 'Lighting Rig (Basic)', type: 'EQUIPMENT', cost: 600, quantity: 1 },
  { name: 'Lighting Rig (Pro)', type: 'EQUIPMENT', cost: 1200, quantity: 1 },
  { name: 'Smoke Machine', type: 'EQUIPMENT', cost: 50, quantity: 1 },
  { name: 'Security Guard (per head)', type: 'STAFF', cost: 200, quantity: 1 },
  { name: 'Bar Staff (per head)', type: 'STAFF', cost: 150, quantity: 1 },
  { name: 'Sound Engineer', type: 'STAFF', cost: 400, quantity: 1 },
  { name: 'Venue Hire (Small Club)', type: 'VENUE', cost: 2000, quantity: 1 },
  { name: 'Venue Hire (Warehouse)', type: 'VENUE', cost: 5000, quantity: 1 },
  { name: 'Marketing & Social Ads', type: 'OTHER', cost: 500, quantity: 1 },
];