import { UserPlus, Search, Briefcase, CheckCircle, Play } from 'lucide-react';

const steps = [
  {
    title: 'Create Account',
    description: 'Sign up as a candidate or recruiter. It takes less than 2 minutes.',
    icon: UserPlus,
    step: '01',
  },
  {
    title: 'Build Profile',
    description: 'Add your skills, experience, and upload your resume.',
    icon: Search,
    step: '02',
  },
  {
    title: 'Apply to Jobs',
    description: 'Search and apply to jobs that match your profile.',
    icon: Briefcase,
    step: '03',
  },
  {
    title: 'Get Hired',
    description: 'Track applications and land your dream job.',
    icon: CheckCircle,
    step: '04',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            How{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CareerConnect
            </span>{' '}
            Works
          </h2>
          <p className="text-base leading-7 text-gray-600 sm:text-lg">
            Four simple steps to your next career opportunity
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 right-0 left-0 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 lg:block" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  <div className="rounded-lg bg-white p-6 text-center shadow-sm transition-all duration-300 hover:shadow-lg">
                    <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-bold text-white">
                      {step.step}
                    </div>

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="mb-4 inline-flex items-center space-x-2 text-gray-600">
            <Play className="h-4 w-4 text-blue-600" />
            <span>Watch the 2-minute demo</span>
          </div>
          <div className="mx-auto flex aspect-video max-w-2xl cursor-pointer items-center justify-center rounded-lg bg-gray-200 transition hover:bg-gray-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Play className="ml-1 h-8 w-8 fill-white text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
