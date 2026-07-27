export type FlightStatus =
  | "planned"
  | "booked"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "delayed";

export type CabinClass =
  | "economy"
  | "premium_economy"
  | "business"
  | "first";

export type FlightFormData = {
  id: string;

  airline: string;
  flight_number: string;
  booking_reference: string | null;

  departure_airport: string;
  departure_city: string | null;
  departure_terminal: string | null;
  departure_gate: string | null;
  departure_time: string;

  arrival_airport: string;
  arrival_city: string | null;
  arrival_terminal: string | null;
  arrival_gate: string | null;
  arrival_time: string;

  seat: string | null;
  cabin_class: CabinClass;
  ticket_type: string | null;
  aircraft: string | null;

  price: number | null;
  currency: string;

  miles_program: string | null;
  miles_earned: number;

  status: FlightStatus;
  arrival_place_id: string | null;

  notes: string | null;
};
