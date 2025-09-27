import { Header } from "@/components/header"
import { SignupForm } from "@/components/forms/signup-form"

export default function SignupPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12 flex items-center justify-center">
        <SignupForm />
      </section>
    </main>
  )
}
