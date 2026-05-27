'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  MapPin,
  Play,
  Search,
} from 'lucide-react';

const highlights = [
  'No credit card required',
  'Free for job seekers',
  'Verified companies',
];

const recommendedJobs = [
  ['Senior Frontend Developer', 'Nova Labs', 'Remote'],
  ['Product Designer', 'BrightPath', 'Lagos'],
  ['Data Analyst', 'GrowthStack', 'Hybrid'],
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-violet-50 pt-24 pb-14 sm:pt-28 sm:pb-20 lg:pt-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            <span className="mr-2 flex h-2 w-2 rounded-full bg-blue-600" />
            Join 10,000+ job seekers
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Find Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dream Career
            </span>{' '}
            Faster
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-gray-600 sm:text-xl sm:leading-8">
            CareerConnect connects talented professionals with leading
            companies. Apply to thousands of jobs, track applications, and land
            your next role.
          </p>

          <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white/80 px-6 py-3 font-semibold text-gray-700 transition hover:bg-white"
            >
              <Play className="mr-2 h-5 w-5" />
              How It Works
            </Link>
          </div>

          <div className="flex flex-col justify-center gap-3 text-sm text-gray-500 sm:flex-row sm:flex-wrap sm:gap-6">
            {highlights.map((item) => (
              <div key={item} className="flex items-center justify-center">
                <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <div className="ml-2 hidden rounded-md bg-white px-3 py-1 text-xs text-gray-500 sm:block">
                careerconnect.app/dashboard
              </div>
            </div>

            <div className="grid lg:grid-cols-[260px_1fr]">
              <aside className="hidden border-r border-gray-100 bg-gray-900 p-5 text-white lg:block">
                <div className="mb-6 flex items-center gap-2 font-semibold">
                  <Briefcase className="h-5 w-5 text-blue-300" />
                  CareerConnect
                </div>
                {['Dashboard', 'Applications', 'Saved Jobs', 'Messages'].map(
                  (item, index) => (
                    <div
                      key={item}
                      className={`mb-2 rounded-md px-3 py-2 text-sm ${
                        index === 0 ? 'bg-white/15 text-white' : 'text-gray-300'
                      }`}
                    >
                      {item}
                    </div>
                  ),
                )}
              </aside>

              <div className="p-4 sm:p-6 lg:p-8">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Candidate dashboard
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                      Recommended roles
                    </h2>
                  </div>
                  <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                    <Search className="mr-2 h-4 w-4" />
                    Remote product roles
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ['92%', 'Profile match'],
                    ['18', 'New job alerts'],
                    ['7', 'Applications tracked'],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {value}
                      </div>
                      <div className="text-sm text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {recommendedJobs.map(([role, company, location]) => (
                    <div
                      key={role}
                      className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{role}</h3>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                          <span className="inline-flex items-center">
                            <Building2 className="mr-1 h-4 w-4" />
                            {company}
                          </span>
                          <span className="inline-flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            {location}
                          </span>
                        </div>
                      </div>
                      <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                        Apply now
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
