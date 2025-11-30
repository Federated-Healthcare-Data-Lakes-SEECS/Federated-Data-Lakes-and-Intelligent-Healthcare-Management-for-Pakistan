import { DashboardContent } from "@/components/dashboard-content"
import { PageWrapper } from "@/components/shared/page-wrapper"

export default function Page() {
  return (
    <PageWrapper title="Dashboard" link="/dashboard">
      <DashboardContent />
    </PageWrapper>
  )
}
