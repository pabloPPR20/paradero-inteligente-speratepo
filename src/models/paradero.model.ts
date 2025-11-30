export interface SupabaseMedicion {
  id: number;
  person_count: number;
  status: string;
  sensor1_distance: number;
  sensor2_distance: number;
  location: { lat: number; lng: number } | string | null;
  timestamp: string;
  recommendation: string | null;
}

export interface TransformedMedicion {
  id: number;
  timestamp: string;
  personCount: number;
  status: string;
  distances: {
    sensor1: number;
    sensor2: number;
  };
  location: { lat: number; lng: number } | null;
  recommendation: string | null;
  estimatedTime: string;
}
