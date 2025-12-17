'use client'

import { Header } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { 
  Activity, 
  Calendar, 
  Shield, 
  Users, 
  Clock, 
  Heart,
  FileText,
  Stethoscope,
  Pill,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react"

function HeroCTAs() {
  const { isAuthenticated, isPatient, isDoctor } = useAuth()
  const dashboardHref = isPatient ? "/patient/dashboard" : isDoctor ? "/doctor/dashboard" : "/login"

  return (
    <div className="flex flex-wrap gap-5 animate-slide-up justify-center w-full" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
      {!isAuthenticated ? (
        <>
          <Link href="/signup">
            <Button size="lg" className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all text-white text-lg font-bold px-10 h-16 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:scale-105 rounded-2xl animate-pulse-soft">
              Get Started Free
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="glass-card border-2 border-blue-300/60 hover:border-blue-400 text-lg font-bold px-10 h-16 hover:bg-blue-50/50 transition-all rounded-2xl gradient-shadow hover-lift">
              Sign In
            </Button>
          </Link>
        </>
      ) : (
        <Link href={dashboardHref}>
          <Button size="lg" className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 rounded-2xl">
            Go to Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  const features = [
    {
      icon: Calendar,
      title: "Online Appointments",
      description: "Book appointments by selecting your preferred department, doctor, and available time slot.",
      color: "from-blue-600 to-blue-500"
    },
    {
      icon: FileText,
      title: "Checkup Records",
      description: "View your complete checkup history including symptoms, diagnoses, prescriptions, and lab tests.",
      color: "from-blue-500 to-sky-500"
    },
    {
      icon: Users,
      title: "Patient Dashboard",
      description: "Manage your profile, view upcoming appointments, and access your medical history in one place.",
      color: "from-sky-500 to-blue-400"
    },
    {
      icon: Stethoscope,
      title: "Doctor Workflow",
      description: "Doctors can manage appointments, record checkups with voice input, and prescribe medications.",
      color: "from-blue-600 to-sky-500"
    },
    {
      icon: Shield,
      title: "Walk-in Registration",
      description: "Receptionists can quickly register walk-in patients and book appointments on their behalf.",
      color: "from-blue-500 to-blue-400"
    },
    {
      icon: Pill,
      title: "Prescription Management",
      description: "Digital prescriptions with drug information, dosage, and frequency recorded in checkups.",
      color: "from-sky-500 to-blue-500"
    }
  ]

  const benefits = [
    "Book appointments online 24/7",
    "Access checkup history anytime",
    "Digital prescription records",
    "Department and doctor selection",
    "Walk-in patient registration",
    "Voice-enabled checkup recording"
  ]

  return (
    <main className="min-h-screen bg-mesh relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-linear-to-br from-blue-400/20 to-blue-300/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 -right-32 w-125 h-125 bg-linear-to-br from-blue-300/15 to-sky-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute -bottom-32 left-1/3 w-100 h-100 bg-linear-to-br from-sky-300/15 to-blue-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }}></div>
      </div>
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-100/40 via-white/20 to-sky-50/40 blur-3xl"></div>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <Badge className="bg-linear-to-r from-blue-600 to-blue-500 text-white border-0 px-4 py-2 shadow-lg shadow-blue-600/30 animate-glow animate-slide-up" style={{ animationFillMode: 'backwards' }}>
                <Sparkles className="w-4 h-4 mr-2" />
                Digital Healthcare Platform
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                <span className="gradient-text">Hospital</span> Management
                <br />
                System
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                Streamline hospital operations with online appointment booking, patient records management, and digital checkup system.
              </p>
              <HeroCTAs />
            </div>
            <div className="relative lg:h-150 animate-float">
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-sky-300 opacity-15 rounded-3xl blur-3xl animate-pulse-soft"></div>
              <Card className="glass-card border-2 border-blue-200/50 relative overflow-hidden gradient-shadow-lg premium-glow">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-linear-to-r from-blue-50/80 to-sky-50/80 rounded-2xl border border-blue-200/50 gradient-shadow hover-lift">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-linear-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse-soft">
                          <Heart className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">Next Appointment</div>
                          <div className="text-sm text-muted-foreground">Dr. Sarah Johnson</div>
                        </div>
                      </div>
                      <Badge className="bg-linear-to-r from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/20 px-3 py-1">Today</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: Calendar, label: "Appointments", value: "Book", gradient: "from-blue-600 to-blue-500" },
                        { icon: FileText, label: "Records", value: "View", gradient: "from-blue-500 to-sky-500" },
                        { icon: Stethoscope, label: "Checkups", value: "Digital", gradient: "from-sky-500 to-blue-400" },
                        { icon: Users, label: "Portal", value: "Access", gradient: "from-blue-500 to-blue-400" }
                      ].map((item, i) => (
                        <div key={i} className="p-5 glass rounded-2xl hover-lift hover-glow transition-all gradient-shadow group">
                          <div className={`w-10 h-10 bg-linear-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-sm text-muted-foreground">{item.label}</div>
                          <div className="text-lg font-bold gradient-text">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-6 bg-linear-to-br from-blue-50/80 to-sky-50/80 rounded-2xl border border-blue-200/50 gradient-shadow hover-lift">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-bounce-soft">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-bold text-lg gradient-text">Health Dashboard</div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { stat: "Heart Rate: 72 bpm", gradient: "from-blue-600 to-blue-500" },
                          { stat: "Blood Pressure: 120/80", gradient: "from-blue-500 to-sky-500" },
                          { stat: "Weight: 70 kg", gradient: "from-sky-500 to-blue-400" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors group">
                            <span className="text-muted-foreground font-medium">{item.stat.split(':')[0]}</span>
                            <span className={`font-bold bg-linear-to-r ${item.gradient} bg-clip-text text-transparent`}>{item.stat.split(':')[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-linear-to-b from-blue-50/30 via-white/20 to-transparent"></div>
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="text-center mb-16">
            <Badge className="bg-linear-to-r from-blue-600 to-blue-500 text-white border-0 mb-4 shadow-lg shadow-blue-500/20 animate-bounce-soft">Features</Badge>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Core Features of
              <span className="gradient-text"> Our System</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Essential tools for patients, doctors, and receptionists to manage healthcare operations effectively.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="glass-card border-2 border-blue-200/50 hover:border-blue-300/60 gradient-shadow-lg transition-all duration-500 hover:-translate-y-4 group premium-glow hover-glow" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardHeader className="p-8">
                  <div className={`w-16 h-16 bg-linear-to-br ${feature.color} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-blue-500/20`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-3">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-linear-to-br from-blue-50/50 via-white/30 to-sky-50/50 relative">
        <div className="absolute inset-0 bg-linear-to-br from-blue-300/5 to-sky-300/5"></div>
        <div className="mx-auto max-w-7xl px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-linear-to-r from-blue-600 to-blue-500 text-white border-0 shadow-lg shadow-blue-500/20">What You Get</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Key
                <span className="gradient-text"> Capabilities</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Access the essential features that make managing your healthcare straightforward and efficient.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 glass-card rounded-2xl transition-all hover:-translate-x-2 border border-blue-200/50 gradient-shadow group hover-glow" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                    </div>
                    <span className="text-lg font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-sky-300 opacity-15 rounded-3xl blur-3xl animate-pulse-soft"></div>
              <Card className="glass-card border-2 border-blue-200/50 relative p-8 gradient-shadow-lg premium-glow">
                <CardContent className="p-0 space-y-8">
                  <div className="text-center pb-6 border-b border-blue-200/50">
                    <div className="text-6xl font-black gradient-text mb-3 animate-pulse-soft">Get Started</div>
                    <p className="text-muted-foreground text-lg">Create your account to begin</p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { item: "Patient portal access", gradient: "from-blue-600 to-blue-500" },
                      { item: "Online appointment booking", gradient: "from-blue-500 to-sky-500" },
                      { item: "Checkup history viewing", gradient: "from-sky-500 to-blue-400" },
                      { item: "Digital prescriptions", gradient: "from-blue-500 to-blue-400" },
                      { item: "Department selection", gradient: "from-blue-600 to-sky-500" },
                      { item: "Profile management", gradient: "from-sky-500 to-blue-500" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 hover:bg-blue-50/50 rounded-xl transition-all hover:translate-x-2 group" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className={`w-6 h-6 bg-linear-to-br ${item.gradient} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{item.item}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/signup" className="block">
                    <Button size="lg" className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all text-lg h-16 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105">
                      Get Started Now
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <Card className="glass-card border-2 border-blue-200/50 relative overflow-hidden gradient-shadow-lg premium-glow">
            <div className="absolute inset-0 opacity-8 animate-pulse-soft"></div>
            <CardContent className="p-12 md:p-20 text-center relative">
              <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
                Ready to Get
                <span className="gradient-text"> Started?</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Sign up today to book appointments online and access your medical records digitally.
              </p>
              <HeroCTAs />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-200/30 py-16 bg-linear-to-b from-blue-50/20 via-white/20 to-transparent">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 group">
              <div className="bg-linear-to-br from-blue-600 to-blue-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <span className="font-black text-2xl gradient-text">MediCare</span>
            </div>
            <p className="text-muted-foreground text-center font-medium">
              © 2025 MediCare. Hospital Management System.
            </p>
            <div className="flex gap-8 text-sm font-medium">
              <Link href="#" className="text-muted-foreground hover:text-blue-500 transition-colors hover:scale-110 inline-block">Privacy</Link>
              <Link href="#" className="text-muted-foreground hover:text-blue-500 transition-colors hover:scale-110 inline-block">Terms</Link>
              <Link href="#" className="text-muted-foreground hover:text-blue-500 transition-colors hover:scale-110 inline-block">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
