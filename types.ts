export enum UserMode {
  LOGIN = 'LOGIN',
  DJ = 'DJ',
  CLIENT = 'CLIENT',
  PROMOTER = 'PROMOTER',
  CONTRACT = 'CONTRACT',
  INBOX = 'INBOX'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  NEGOTIATING = 'NEGOTIATING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  SIGNED = 'SIGNED'
}

export type AssetType = 'ARTIST' | 'EQUIPMENT' | 'STAFF' | 'VENUE' | 'OTHER';

export interface EventAsset {
  id: string;
  name: string;
  type: AssetType;
  cost: number;
  bookingId?: string; // If type is ARTIST, links to the booking negotiation
  quantity: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  totalBudget: number;
  assets: EventAsset[];
  location: string;
}

export interface TechItem {
  id: string;
  name: string;
  essential: boolean;
}

export type GigType = 'PAST' | 'FUTURE' | 'AVAILABLE';

export interface GigItem {
  id: string;
  date: string; // YYYY-MM-DD
  eventName: string;
  link?: string; // Soundcloud/Mix link for PAST gigs
  type: GigType;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  reference: string;
}

export interface TechRequirement {
  enabled: boolean;
  comment: string;
}

export interface AdvancedTechRequirements {
  serato: TechRequirement;
  rekordbox: TechRequirement;
  laptopInput: TechRequirement;
  fourChannels: TechRequirement;
}

export interface GenreItem {
  id: string;
  name: string;
  links: string[];
}

export interface ExtraItem {
  id: string;
  name: string;
  price: number;
  type: 'EQUIPMENT' | 'SERVICE';
}

export interface DJProfile {
  name: string;
  bio: string;
  email: string;
  soundcloudUrl: string;
  hourlyRate: number;
  techRider: TechItem[];
  currency: string;
  schedule: GigItem[];
  bankDetails: BankDetails;
  techRequirements: AdvancedTechRequirements;
  genres: GenreItem[];
  extras: ExtraItem[];
  signatureUrl?: string; // Base64 string
}

export interface OfferDetails {
  promoterName: string;
  promoterEmail: string;
  eventDate: string;
  startTime: string;
  durationHours: number;
  location: string;
  
  // Negotiation
  useStandardRate: boolean;
  counterOfferAmount: number; // Flat fee or new hourly depending on logic
  counterOfferType: 'FLAT' | 'HOURLY';
  
  // Extras
  providesTransport: boolean;
  providesAccommodation: boolean;
  providesFood: boolean;
  providesDrinks: boolean;
  additionalNotes: string;
  
  // Selected Add-ons
  selectedExtras: string[];
}

export interface BookingRequest extends OfferDetails {
  id: string;
  createdAt: string;
  status: BookingStatus;
  clientSignatureUrl?: string; // Base64 string
  artistSigned: boolean;
  clientSigned: boolean;
  eventId?: string; // Linked to a promoter event
}

export interface GeneratedContract {
  id: string;
  content: string; // The AI generated text
  totalValue: number;
  createdAt: string;
}