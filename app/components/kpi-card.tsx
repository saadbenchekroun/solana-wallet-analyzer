import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface KPICardProps {
  title: string
  value: string | number
  className?: string
}

export function KPICard({ title, value, className }: KPICardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

