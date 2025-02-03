"use server"

import { parse } from "csv-parse/sync"
import type { WalletAnalysis, WalletInteraction } from "./types"
import { cookies } from "next/headers"

export async function analyzeWalletInteractions(formData: FormData): Promise<WalletAnalysis> {
  try {
    const file = formData.get("csv") as File
    if (!file) {
      throw new Error("No file uploaded")
    }

    const text = await file.text()
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
    })

    // Find wallet of interest
    const allWallets = [...records.map((r: any) => r.From), ...records.map((r: any) => r.To)]
    const walletCounts = new Map<string, number>()
    allWallets.forEach((wallet) => {
      walletCounts.set(wallet, (walletCounts.get(wallet) || 0) + 1)
    })

    const walletOfInterest = Array.from(walletCounts.entries()).reduce((a, b) => (a[1] > b[1] ? a : b))[0]

    // Filter interactions
    const interactions = records.filter((row: any) => row.From === walletOfInterest || row.To === walletOfInterest)

    // Calculate metrics
    const totalTransactions = interactions.length
    const totalValue = interactions.reduce((sum: number, row: any) => sum + Math.abs(Number(row.Value)), 0)
    const uniqueWallets = new Set(interactions.map((row: any) => (row.From === walletOfInterest ? row.To : row.From)))
      .size

    // Analyze interactions
    const interactionMap = new Map<
      string,
      {
        count: number
        valueReceived: number
        valueSent: number
        flow: "in" | "out"
      }
    >()

    interactions.forEach((row: any) => {
      const interactingWallet = row.From === walletOfInterest ? row.To : row.From
      const isInflow = row.To === walletOfInterest
      const value = Number(row.Value)

      const current = interactionMap.get(interactingWallet) || {
        count: 0,
        valueReceived: 0,
        valueSent: 0,
        flow: isInflow ? "in" : "out",
      }

      interactionMap.set(interactingWallet, {
        count: current.count + 1,
        valueReceived: isInflow ? current.valueReceived + value : current.valueReceived,
        valueSent: !isInflow ? current.valueSent + value : current.valueSent,
        flow: current.flow,
      })
    })

    const topInteractions = Array.from(interactionMap.entries())
      .map(([wallet, stats]) => ({
        InteractingWallet: wallet,
        TransactionCount: stats.count,
        TotalValueReceived: stats.valueReceived,
        TotalValueSent: stats.valueSent,
        Flow: stats.flow,
      }))
      .sort((a, b) => b.TransactionCount - a.TransactionCount)
      .slice(0, 5)

    return {
      walletOfInterest,
      totalTransactions,
      totalValue,
      uniqueWallets,
      averageTransactionValue: totalValue / totalTransactions,
      interactions: topInteractions,
    }
  } catch (error) {
    console.error("Error processing file:", error)
    throw new Error("Failed to process file")
  }
}

export async function saveWalletAnalysis(walletOfInterest: string, interactions: WalletInteraction[]) {
  const savedWallets = cookies().get("saved-wallets")?.value
  const existing = savedWallets ? JSON.parse(savedWallets) : []

  const newSaved = {
    walletOfInterest,
    topInteractions: interactions,
    savedAt: new Date().toISOString(),
  }

  const updated = [newSaved, ...existing].slice(0, 10) // Keep last 10 saved analyses

  cookies().set("saved-wallets", JSON.stringify(updated))
  return { success: true }
}

