import { Header } from "@/components/header"
import { LoginForm } from "@/components/forms/login-form"

export default function LoginPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-12 flex items-center justify-center">
        <LoginForm />
      </section>
    </main>
  )
}
