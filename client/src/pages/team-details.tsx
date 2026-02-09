import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: number;
  fullName: string;
  phone: string;
  country: string;
  createdAt: string;
  totalInvested: number;
}

interface TeamDetails {
  level1: TeamMember[];
  level2: TeamMember[];
  level3: TeamMember[];
  totalLevel1Invested: number;
  totalLevel2Invested: number;
  totalLevel3Invested: number;
}

function maskPhone(phone: string): string {
  if (phone.length <= 5) return phone;
  const first2 = phone.slice(0, 2);
  const last3 = phone.slice(-3);
  const masked = "*".repeat(Math.max(phone.length - 5, 3));
  return `${first2}${masked}${last3}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const h = date.getHours();
  const hours12 = h % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${month}/${day}/${year} ${hours12}:${minutes}:${seconds} ${ampm}`;
}

export default function TeamDetailsPage() {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);

  const { data: team, isLoading } = useQuery<TeamDetails>({
    queryKey: ["/api/team/details"],
  });

  const getLevelMembers = (): TeamMember[] => {
    if (!team) return [];
    switch (activeLevel) {
      case 1: return team.level1;
      case 2: return team.level2;
      case 3: return team.level3;
    }
  };

  const levels = [
    { num: 1 as const, total: team?.totalLevel1Invested || 0, count: team?.level1?.length || 0 },
    { num: 2 as const, total: team?.totalLevel2Invested || 0, count: team?.level2?.length || 0 },
    { num: 3 as const, total: team?.totalLevel3Invested || 0, count: team?.level3?.length || 0 },
  ];

  const members = getLevelMembers();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center px-4 py-3 border-b border-gray-100">
        <Link href="/team">
          <Button variant="ghost" size="icon" data-testid="button-back-team">
            <ArrowLeft className="w-5 h-5 text-orange-500" />
          </Button>
        </Link>
        <h1 className="text-base font-bold text-blue-600 flex-1 text-center pr-10" data-testid="text-page-title">
          Mon equipe
        </h1>
      </header>

      <div className="grid grid-cols-3">
        {levels.map((level) => (
          <button
            key={level.num}
            onClick={() => setActiveLevel(level.num)}
            className={`py-3 text-center transition-colors border-b-2 ${
              activeLevel === level.num
                ? "border-orange-500 bg-orange-50/50"
                : "border-transparent"
            }`}
            data-testid={`tab-level-${level.num}`}
          >
            <p className={`text-sm font-bold ${
              activeLevel === level.num ? "text-orange-500" : "text-gray-500"
            }`}>
              {level.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-[11px] mt-0.5 ${
              activeLevel === level.num ? "text-orange-500" : "text-gray-400"
            }`}>
              Niveau {level.num}({level.count})
            </p>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Aucun membre au niveau {activeLevel}</p>
          </div>
        ) : (
          <div>
            {members.map((member, idx) => (
              <div
                key={member.id}
                className={`flex items-center px-4 py-3 gap-3 ${
                  idx < members.length - 1 ? "border-b border-gray-50" : ""
                }`}
                data-testid={`team-member-${member.id}`}
              >
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800" data-testid={`text-member-phone-${member.id}`}>
                    {maskPhone(member.phone)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatDate(member.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800 shrink-0" data-testid={`text-member-invested-${member.id}`}>
                  {member.totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
