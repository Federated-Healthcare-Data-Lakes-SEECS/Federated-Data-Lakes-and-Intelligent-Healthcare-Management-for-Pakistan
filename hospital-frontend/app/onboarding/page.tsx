import { Header } from "@/components/header"
import { RoleGuard } from "@/components/role-guard"
import { OnboardingForm } from "@/components/forms/onboarding-form"

export default function OnboardingPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12 flex items-center justify-center">
        <RoleGuard allowed={["PATIENT"]}>
          <OnboardingForm />
        </RoleGuard>
      </section>
    </main>
  )
}
