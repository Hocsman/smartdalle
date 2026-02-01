import OnboardingForm from "./onboarding-form";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />

            {/* Decorative Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,211,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,211,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="w-full max-w-4xl relative z-10">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold uppercase italic text-white mb-2">
                        Smart<span className="text-primary text-glow">Dalle</span> Setup
                    </h1>
                    <p className="text-muted-foreground">Dis-nous qui tu es, on remplit ton frigo.</p>
                </header>

                <OnboardingForm />
            </div>
        </div>
    );
}
