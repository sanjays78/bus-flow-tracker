
export interface Bus {
  id: string;
  busNumber: string;
  name: string;
  type: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper';
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  rating: number;
}

export interface SearchParams {
  source: string;
  destination: string;
  date?: string;
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  FILLING_FAST = 'FILLING_FAST',
  FULL = 'FULL'
}
