import { LookupForm } from "@/components/public/LookupForm";
import { Seal } from "@/components/ui/Seal";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Main Content Area */}
      <main className="w-full max-w-md mx-auto px-4 py-16 flex flex-col items-center my-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Seal size={68} animate />
          </div>


          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance leading-tight">
            Thanks for Participating!
          </h1>
          <p className="mt-3 text-sm text-slate-600 text-balance leading-relaxed">
            Sign in with your Unique ID and email to redeem your certificate.
          </p>
        </div>

        {/* Clean White Card */}
        <div className="w-full bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <LookupForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        Issued by the Training &amp; Certification Office &bull; All Rights Reserved
      </footer>
    </div>
  );
}

