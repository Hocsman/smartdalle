import OnboardingForm from "./onboarding-form";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold uppercase italic text-white mb-2">
                        Smart<span className="text-primary">Dalle</span> Setup
                    </h1>
                    <p className="text-muted-foreground">Dis-nous qui tu es, on remplit ton frigo.</p>
                </header>

                <OnboardingForm />
            </div>
        </div>
    );
}
