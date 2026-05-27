
'use client';

import { useEffect, useState } from 'react';
import { Users, Building, Briefcase, Award } from 'lucide-react';

const stats = [
  { label: 'Job Seekers', value: 50000, suffix: '+', icon: Users, color: 'bg-blue-500' },
  { label: 'Companies', value: 500, suffix: '+', icon: Building, color: 'bg-green-500' },
  { label: 'Jobs Posted', value: 10000, suffix: '+', icon: Briefcase, color: 'bg-purple-500' },
  { label: 'Success Rate', value: 90, suffix: '%', icon: Award, color: 'bg-orange-500' },
];

export default function Stats() {
  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const animateNumbers = () => {
      stats.forEach((stat, index) => {
        let start = 0;
        const end = stat.value;
        const duration = 2000;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCounters(prev => {
              const newCounters = [...prev];
              newCounters[index] = end;
              return newCounters;
            });
            clearInterval(timer);
          } else {
            setCounters(prev => {
              const newCounters = [...prev];
              newCounters[index] = Math.floor(start);
              return newCounters;
            });
          }
        }, 16);
      });
    };
    
    animateNumbers();
  }, []);

  return (
    <section className="py-16 bg-white sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-14 h-14 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-4 sm:h-16 sm:w-16`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {counters[index].toLocaleString()}{stat.suffix}
                </div>
                <div className="mt-1 text-sm text-gray-600 sm:text-base">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
