export type FlightStatus =
  | "scheduled"
  | "on-time"
  | "delayed"
  | "cancelled"
  | "completed";

export type Flight = {
  id: string;

  airline: string;
  flightNumber: string;

  departureAirport: string;
  departureCity: string;
  departureTime: string;

  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;

  destinationSlug: string;

  terminal?: string;
  gate?: string;
  seat?: string;
  bookingReference?: string;
  notes?: string;
  calendarEventId?: string;

  source?:
  | "manual"
  | "google-calendar";
  status: FlightStatus;
};

export type FlightFormData = Omit<Flight, "id">;
export type FlightImportCandidate = {
  calendarEventId: string;

  title: string;
  description?: string;
  location?: string;

  departureTime: string;
  arrivalTime: string;

  airline: string;
  flightNumber: string;

  departureAirport: string;
  departureCity: string;

  arrivalAirport: string;
  arrivalCity: string;

  destinationSlug: string;

  confidence: "high" | "medium" | "low";
};