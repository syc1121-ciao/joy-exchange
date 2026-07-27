import Link from 'next/link';

export default function TravelPage() {
  return (
    <main className='space-y-8 p-8'>
      <section className='rounded-3xl bg-white p-8 shadow-sm'>
        <h1 className='text-4xl font-semibold'>Travel</h1>
        <p className='mt-4 text-neutral-600'>Browse your travel plans and destinations.</p>
        <Link href='/dashboard/flights' className='mt-6 inline-flex rounded-full bg-neutral-900 px-5 py-3 text-white'>Go to Flights</Link>
      </section>
    </main>
  );
}

