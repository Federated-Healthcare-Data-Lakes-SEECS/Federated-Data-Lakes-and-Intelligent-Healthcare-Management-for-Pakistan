"use client";

import { Activity, Heart, Stethoscope } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-blue-50/80 via-white to-cyan-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        {/* Medical Icon Animation */}
        <div className="relative">
          {/* Outer pulse ring */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          
          {/* Inner rotating icons */}
          <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <div className="animate-pulse">
              <Activity className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Orbiting icons */}
          <div className="absolute inset-0 animate-spin-slow">
            <Heart className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 text-red-500" />
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse' }}>
            <Stethoscope className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground animate-pulse">
            Loading HealthCare
          </h2>
          <div className="flex items-center gap-1.5 justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-blue-500 to-cyan-500 animate-loading-bar rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller loading states
export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="w-full min-h-[40vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">{text}</p>
    </div>
  );
}
