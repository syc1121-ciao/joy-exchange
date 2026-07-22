import type {
  Flight,
  FlightFormData,
} from "./types";

export const initialFlights: Flight[] = [
  {
    id: "demo-taipei-munich",

    airline: "Lufthansa",
    flightNumber: "LH731",

    departureAirport: "TPE",
    departureCity: "Taipei",
    departureTime: "2027-02-15T23:30",

    arrivalAirport: "MUC",
    arrivalCity: "Munich",
    arrivalTime: "2027-02-16T07:10",

    destinationSlug: "munich",

    terminal: "2",
    gate: "",
    seat: "32A",
    bookingReference: "",
    notes: "Exchange journey begins.",

    status: "scheduled",
  },
];

export const emptyFlightForm: FlightFormData = {
  airline: "",
  flightNumber: "",

  departureAirport: "",
  departureCity: "",
  departureTime: "",

  arrivalAirport: "",
  arrivalCity: "",
  arrivalTime: "",

  destinationSlug: "",

  terminal: "",
  gate: "",
  seat: "",
  bookingReference: "",
  notes: "",

  calendarEventId: undefined,
  source: "manual",

  status: "scheduled",
};