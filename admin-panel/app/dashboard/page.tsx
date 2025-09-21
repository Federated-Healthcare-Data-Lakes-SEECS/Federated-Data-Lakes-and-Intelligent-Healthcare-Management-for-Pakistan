import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard-content"

export default function Page() {
  return (
    <>
      <Header title="Dashboard" link="/dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardContent />
      </div>
    </>
  )
}
