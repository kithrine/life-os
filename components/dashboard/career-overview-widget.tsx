import Link from "next/link";
import { Briefcase } from "lucide-react";

type JobApp = {
  id: string;
  status: string;
};

type Skill = {
  id: string;
  name: string;
  level: string;
};

const SKILL_LEVELS: Record<string, number> = {
  beginner: 30,
  intermediate: 60,
  advanced: 85,
  expert: 100,
};

type Props = {
  jobApplications: JobApp[];
  skills: Skill[];
};

export function CareerOverviewWidget({ jobApplications, skills }: Props) {
  const active = jobApplications.filter((a) =>
    ["applied", "interviewing", "offer"].includes(a.status.toLowerCase())
  ).length;
  const interviews = jobApplications.filter(
    (a) => a.status.toLowerCase() === "interviewing"
  ).length;

  const topSkills = skills.slice(0, 3);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </span>
          <h2 className="text-base font-bold text-gray-900">Career</h2>
        </div>
        <Link href="/career" className="text-xs font-medium text-indigo-600 hover:underline">
          View details
        </Link>
      </div>

      {jobApplications.length === 0 && skills.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-400">No career data yet.</p>
          <Link
            href="/career"
            className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline"
          >
            Add your first application →
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-4">
            <div className="flex-1 rounded-xl bg-indigo-50 p-3 text-center">
              <p className="text-2xl font-extrabold text-indigo-700">{active}</p>
              <p className="text-xs text-gray-500">Active apps</p>
            </div>
            <div className="flex-1 rounded-xl bg-violet-50 p-3 text-center">
              <p className="text-2xl font-extrabold text-violet-700">{interviews}</p>
              <p className="text-xs text-gray-500">Interviews</p>
            </div>
          </div>

          {topSkills.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Top Skills
              </p>
              <div className="space-y-2.5">
                {topSkills.map((skill) => {
                  const pct = SKILL_LEVELS[skill.level.toLowerCase()] ?? 50;
                  return (
                    <div key={skill.id}>
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-700">{skill.name}</span>
                        <span className="text-gray-400 capitalize">{skill.level}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
