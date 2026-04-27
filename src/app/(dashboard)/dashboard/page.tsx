"use client";

import { useSession } from "next-auth/react";
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
import { Sparkles, BarChart3, Zap, ArrowUpRight, History } from "lucide-react";

interface UsageInfo {
  plan: string;
  dailyUsage: number;
  dailyLimit: number | null;
  monthlyUsage: number;
  monthlyLimit: number | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/ai/usage");
        if (res.ok) {
          const data = await res.json();
          setUsage(data);
        }
      } catch {
        // silently fail
      }
    }
    fetchUsage();
  }, []);

  const isPro = session?.user?.plan === "active";
  const planName = isPro ? "Pro" : "Free";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session?.user?.name || "User"}
        </h1>
        <p className="text-muted-foreground">
          Generate AI-powered content for your projects
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Current Plan</CardDescription>
            <CardTitle className="flex items-center gap-2">
              {planName}
              <Badge variant={isPro ? "default" : "secondary"}>
                {isPro ? "Active" : "Free Tier"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/billing">
              <Button variant="outline" size="sm">
                {isPro ? "Manage Plan" : "Upgrade Plan"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Daily Usage</CardDescription>
            <CardTitle>
              {usage?.dailyUsage ?? 0}
              {usage?.dailyLimit ? ` / ${usage.dailyLimit}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generations today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Monthly Usage</CardDescription>
            <CardTitle>
              {usage?.monthlyUsage ?? 0}
              {usage?.monthlyLimit ? ` / ${usage.monthlyLimit}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generations this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Content
            </CardTitle>
            <CardDescription>
              Create blog posts, social media content, SEO titles, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/generate">
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Start Creating
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Generation History
            </CardTitle>
            <CardDescription>
              View and manage your past generations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/history">
              <Button variant="outline">
                View History
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Analytics
            </CardTitle>
            <CardDescription>
              Track your generation usage and limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/usage">
              <Button variant="outline">
                View Usage
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}