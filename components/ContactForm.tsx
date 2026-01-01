'use client';

import { Input } from './ui/Input';

interface ContactFormProps {
  name: string;
  email: string;
  businessName: string;
  onUpdate: (field: 'name' | 'email' | 'businessName', value: string) => void;
  nameError?: string;
  emailError?: string;
}

export function ContactForm({
  name,
  email,
  businessName,
  onUpdate,
  nameError,
  emailError,
}: ContactFormProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-revaya-dark-gray mb-2">
        Almost there! Get your personalized results
      </h2>
      <p className="text-revaya-medium-gray mb-8">
        See exactly how much revenue you&apos;re losing and what you can do about it
      </p>

      <div className="space-y-4">
        <Input
          label="Name *"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => onUpdate('name', e.target.value)}
          error={nameError}
        />

        <Input
          label="Email *"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onUpdate('email', e.target.value)}
          error={emailError}
        />

        <Input
          label="Business Name (optional)"
          type="text"
          placeholder="Your Business Name"
          value={businessName}
          onChange={(e) => onUpdate('businessName', e.target.value)}
        />
      </div>

      {/* Privacy disclaimer */}
      <div className="mt-6 flex items-center justify-center text-sm text-revaya-medium-gray">
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        Your information stays with Revaya AI.
      </div>
    </div>
  );
}
