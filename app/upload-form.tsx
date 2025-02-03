"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { ExternalLink, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { analyzeWalletInteractions, saveWalletAnalysis } from "./actions"
import { KPICard } from "./components/kpi-card"
import type { WalletAnalysis } from "./types"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Upload className="h-4 w-4 animate-spin" />
          Analyzing...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Analyze Wallet
        </span>
      )}
    </Button>
  )
}

export function UploadForm() {
  const [analysis, setAnalysis] = useState<WalletAnalysis | null>(null)
  const [error, setError] = useState<string>("")

  async function handleSubmit(formData: FormData) {
    try {
      setError("")
      const data = await analyzeWalletInteractions(formData)
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze file")
    }
  }

  async function handleSave() {
    if (!analysis) return
    try {
      await saveWalletAnalysis(analysis.walletOfInterest, analysis.interactions)
      toast.success("Analysis saved successfully")
    } catch (err) {
      toast.error("Failed to save analysis")
    }
  }

  return (
    <div className="space-y-8">
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv">Upload CSV File</Label>
          <Input id="csv" name="csv" type="file" accept=".csv" required className="cursor-pointer" />
        </div>
        <SubmitButton />
      </form>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}

      {analysis && (
        <>
          <a
            href={`https://solscan.io/account/${analysis.walletOfInterest}#transfers`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <div className="grid gap-4 md:grid-cols-4">
            <KPICard title="Wallet of Interest" value={analysis.walletOfInterest} className="md:col-span-4" />
            <KPICard title="Total Transactions" value={analysis.totalTransactions.toLocaleString()} />
            <KPICard title="Unique Wallets" value={analysis.uniqueWallets.toLocaleString()} />
            <KPICard title="Total Value" value={analysis.totalValue.toLocaleString()} />
            <KPICard title="Average Transaction" value={analysis.averageTransactionValue.toLocaleString()} />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save Analysis
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead className="text-right">Transaction Count</TableHead>
                  <TableHead className="text-right">Value Received</TableHead>
                  <TableHead className="text-right">Value Sent</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.interactions.map((result) => (
                  <TableRow key={result.InteractingWallet}>
                    <TableCell className="font-mono">{result.InteractingWallet}</TableCell>
                    <TableCell className="text-right">{result.TransactionCount}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {result.TotalValueReceived.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">{result.TotalValueSent.toLocaleString()}</TableCell>
                    <TableCell>
                      <a
                        href={`https://solscan.io/account/${result.InteractingWallet}#transfers`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View on Solscan</span>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}

