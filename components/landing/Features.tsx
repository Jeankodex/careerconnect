
import { 
  Search, 
  Briefcase, 
  FileText, 
  Bell, 
  BarChart3, 
  Shield,
  Zap,
  Users
} from 'lucide-react';

const features = [
  {
    title: 'Smart Job Search',
    description: 'Find the perfect job with our AI-powered search that matches your skills and preferences.',
    icon: Search,
    color: 'bg-blue-500',
  },
  {
    title: 'Easy Applications',
    description: 'Apply to multiple jobs with just one click using your saved profile and resume.',
    icon: FileText,
    color: 'bg-green-500',
  },
  {
    title: 'Track Applications',
    description: 'Monitor your application status and receive real-time updates.',
    icon: Briefcase,
    color: 'bg-purple-500',
  },
  {
    title: 'Instant Notifications',
    description: 'Get notified about new jobs, application updates, and interview invitations.',
    icon: Bell,
    color: 'bg-yellow-500',
  },
  {
    title: 'Analytics Dashboard',
    description: 'View your profile strength and get insights to improve your chances.',
    icon: BarChart3,
    color: 'bg-orange-500',
  },
  {
    title: 'Secure & Verified',
    description: 'All companies and jobs are verified to ensure a safe job search experience.',
    icon: Shield,
    color: 'bg-red-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 bg-white sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-base leading-7 text-gray-600 sm:text-lg">
            Powerful features designed to help you find and land your dream job faster.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group rounded-lg bg-gray-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Highlight */}
        <div className="mt-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-center text-white sm:mt-16 sm:p-8">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
            <div>
              <div className="text-2xl font-bold sm:text-3xl">10,000+</div>
              <div className="text-sm opacity-90 mt-1">Active Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold sm:text-3xl">500+</div>
              <div className="text-sm opacity-90 mt-1">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold sm:text-3xl">50,000+</div>
              <div className="text-sm opacity-90 mt-1">Job Seekers</div>
            </div>
            <div>
              <div className="text-2xl font-bold sm:text-3xl">90%</div>
              <div className="text-sm opacity-90 mt-1">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
