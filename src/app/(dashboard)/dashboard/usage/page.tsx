"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Zap, ArrowUpRight } from "lucide-react";

interface UsageInfo {
  plan: string;
  dailyUsage: number;
  dailyLimit: number | null;
  monthlyUsage: number;
  monthlyLimit: number | null;
  projectLimit: number | null;
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/ai/usage");
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading usage data...</div>
      </div>
    );
  }

  const dailyPercent = usage?.dailyLimit
    ? Math.min((usage.dailyUsage / usage.dailyLimit) * 100, 100)
    : 0;
  const monthlyPercent = usage?.monthlyLimit
    ? Math.min((usage.monthlyUsage / usage.monthlyLimit) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usage Dashboard</h1>
          <p className="text-muted-foreground">
            Track your AI content generation usage
          </p>
        </div>
        <Link href="/dashboard/generate">
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Generate Content
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Daily Usage</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {usage?.dailyUsage ?? 0}
              {usage?.dailyLimit ? (
                <span className="text-lg font-normal text-muted-foreground">
                  / {usage.dailyLimit}
                </span>
              ) : (
                <Badge variant="secondary">Unlimited</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {usage?.dailyLimit
                ? `${usage.dailyLimit - (usage.dailyUsage || 0)} generations remaining today`
                : "Unlimited generations available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Monthly Usage</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {usage?.monthlyUsage ?? 0}
              {usage?.monthlyLimit ? (
                <span className="text-lg font-normal text-muted-foreground">
                  / {usage.monthlyLimit}
                </span>
              ) : (
                <Badge variant="secondary">Unlimited</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${monthlyPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {usage?.monthlyLimit
                ? `${usage.monthlyLimit - (usage.monthlyUsage || 0)} generations remaining this month`
                : "Unlimited generations available"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Plan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Plan</span>
            <Badge variant={usage?.plan === "Free" ? "secondary" : "default"}>
              {usage?.plan || "Free"}
            </Badge>
          </div>
          {usage?.dailyLimit && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Daily Limit</span>
              <span className="text-sm font-medium">{usage.dailyLimit} generations</span>
            </div>
          )}
          {usage?.monthlyLimit && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Limit</span>
              <span className="text-sm font-medium">{usage.monthlyLimit} generations</span>
            </div>
          )}
          {usage?.projectLimit && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Project Limit</span>
              <span className="text-sm font-medium">{usage.projectLimit} projects</span>
            </div>
          )}
          {usage?.plan === "Free" && (
            <div className="pt-4">
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full">
                  Upgrade Plan
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}