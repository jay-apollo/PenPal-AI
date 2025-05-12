import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, Mail, MessageSquare, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: "campaigns" | "letters" | "responses" | "pending";
  trend?: {
    value: string;
    label: string;
  };
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  // Icon and color mappings
  const iconMap = {
    campaigns: {
      icon: BarChart2,
      bgColor: "bg-primary-100",
      textColor: "text-primary-600",
    },
    letters: {
      icon: Mail,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    responses: {
      icon: MessageSquare,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    pending: {
      icon: Clock,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
  };

  const { icon: IconComponent, bgColor, textColor } = iconMap[icon];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", bgColor)}>
            <IconComponent className={cn("h-6 w-6", textColor)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900">{value}</div>
                {trend && (
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0 mr-0.5" />
                    <span>
                      {trend.value} {trend.label}
                    </span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
