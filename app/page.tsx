import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white pt-5">
      <div className="max-w-4xl w-full text-center">
        {/* Headline with purple emphasis */}
        <h1 className="text-[30px] font-semibold mb-6 leading-tight">
          <span className="text-revaya-dark-gray">
            How Much{' '}
          </span>
          <span className="text-revaya-purple">Revenue Are You Losing</span>
          <span className="text-revaya-dark-gray"> to Missed Calls?</span>
        </h1>

        {/* Subhead */}
        <p className="text-base text-revaya-medium-gray mb-12 max-w-3xl mx-auto">
          Most service businesses lose $2,000-$10,000+ monthly from calls that go unanswered.
          Find out your number in 90 seconds.
        </p>

        {/* CTA Button */}
        <Link href="/quiz">
          <Button variant="primary" className="text-lg px-8 py-4">
            Calculate My Lost Revenue
          </Button>
        </Link>
      </div>
    </div>
  );
}
