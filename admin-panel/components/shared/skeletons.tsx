import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatCardSkeleton() {
  return (
    <Card className="glass-card border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24 skeleton-shimmer" />
        <Skeleton className="h-8 w-8 rounded-lg skeleton-shimmer" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1 skeleton-shimmer" />
        <Skeleton className="h-3 w-20 skeleton-shimmer" />
      </CardContent>
    </Card>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center space-x-4 py-4 px-2">
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1 skeleton-shimmer" />
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-4 py-3 px-2 border-b">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 skeleton-shimmer" />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 skeleton-shimmer" />
        <Skeleton className="h-4 w-72 skeleton-shimmer" />
      </div>
      <Skeleton className="h-10 w-32 skeleton-shimmer" />
    </div>
  )
}
