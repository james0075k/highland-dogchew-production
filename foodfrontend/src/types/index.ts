// Core Entity Interfaces
export interface Destination {
  _id: any;
  title: string;
  description?: string;
  slug: string;
  subtitle?: string;
  imageUrls?: string[];
  image?: string;
}

export interface TourPackage {
  duration: any;
  _id: string;
  title: string;
  description: string;
  overview?: string;
  highlights?: string[];
  quickfacts?: string[];
  inclusions: string[];
  exclusions: string[];
  gallery: string[]; // image URLs

  location: {
    city: string;
    country?: string;
  };

  basePrice: number;
  currency?: string;
  googleMapUrl?: string;

  feature?: {
    groupSize?: { min: number; max?: number };
    tripDuration?: string;
    tripDifficulty?: string;
    meals?: string[];
    activities?: string[];
    accommodation?: string[];
    maxAltitude?: string | number;
    bestSeason?: string[];
    startEndPoint?: string;
  };

  itinerary: {
    day: number;
    title: string;
    description: string;
    image?: string;
  }[];
  cancellation?: string[];
  destination?: Destination;
  
}

export interface Activity {
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  imageUrls?: string[];
  image?: string;
  name?: string;
  _id?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
}

export interface ContactInfo {
  _id: string;
  address: string;    
  phone?: string;               // Primary phone
  phones?: string[];                 // Array of additional phones
  whatsappNumber: string;
  email: string;
  socialLinks?: SocialLinks;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
export interface Duration {
  label: string;
  slug: string;
  image: string;
  description: string;
  tag: string;
}
// ✅ Alias Array Types for Easier Usage
export type Destinations = Destination[];
export type TourPackages = TourPackage[];
export type Activities = Activity[];

// ✅ Generic API Response Type
export interface APIResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}
