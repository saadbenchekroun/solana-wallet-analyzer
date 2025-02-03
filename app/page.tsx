import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadForm } from "./upload-form"
import { Toaster } from "sonner"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Toaster />
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>Wallet Interaction Analyzer</CardTitle>
          <CardDescription>
            Upload a CSV file to analyze the top 5 wallets interacting with the most active wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm />
        </CardContent>
      </Card>
    </div>
  )
}

