import NewPlaceForm from "@/components/dashboard/NewPlaceForm";

export default function NewPlacePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Places
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          New Place
        </h1>
      </div>

      <NewPlaceForm />
    </div>
  );
}