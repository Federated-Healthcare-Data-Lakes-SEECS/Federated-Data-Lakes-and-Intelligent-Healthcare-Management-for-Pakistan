"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Hospital, 
  Users, 
  Calendar, 
  FileText, 
  Shield, 
  Activity,
  ArrowRight,
  Stethoscope,
  Pill,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: Users,
    title: "Staff Management",
    description: "Manage doctors, receptionists, and medical staff with comprehensive profiles and credentials tracking."
  },
  {
    icon: Calendar,
    title: "Department Control",
    description: "Organize hospital departments, assign specialists, and monitor departmental performance."
  },
  {
    icon: Pill,
    title: "Drug Registry",
    description: "Maintain a complete pharmaceutical database with dosage forms, strengths, and supplier information."
  },
  {
    icon: FlaskConical,
    title: "Lab Test Templates",
    description: "Create and manage dynamic lab test forms with custom fields, sections, and reference ranges."
  },
  {
    icon: Stethoscope,
    title: "Patient Records",
    description: "Access comprehensive patient histories, medical records, and appointment tracking."
  },
  {
    icon: Shield,
    title: "Secure Access",
    description: "Role-based authentication ensuring data privacy and regulatory compliance."
  }
];

const stats = [
  { label: "Departments", value: "12+" },
  { label: "Staff Members", value: "150+" },
  { label: "Active Patients", value: "2,500+" },
  { label: "Daily Operations", value: "24/7" }
];

const Home = () => {
  const { isAuthenticated, loading: isAuthLoading } = useAuth();
  const router = useRouter();

  const isLoggedIn = isAuthenticated && !isAuthLoading;
  
  const handleButtonClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg blue-glow-sm">
              <Hospital className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">HMS Admin</h1>
              <p className="text-xs text-muted-foreground">Hospital Management System</p>
            </div>
          </div>
          <Button 
            onClick={handleButtonClick}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg blue-glow-sm"
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Sign In'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Administrative Control Center</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Hospital Management
            <span className="block text-primary">Made Simple</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Streamline your hospital operations with our comprehensive administrative panel. 
            Manage staff, departments, and medical resources all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg"
              onClick={handleButtonClick}
              className="bg-primary hover:bg-primary/90 text-white shadow-xl blue-glow text-lg px-8 py-6"
            >
              {isLoggedIn ? 'Open Dashboard' : 'Access Admin Panel'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card rounded-xl p-4">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Complete Hospital Administration
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your hospital efficiently, from staff management to lab test templates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass-card rounded-2xl p-6 card-hover group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 glass-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hospital className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Hospital Management System © {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Secure • Reliable • Efficient
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;