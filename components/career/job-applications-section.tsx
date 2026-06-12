"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { addJobApplication, updateJobStatus, deleteJobApplication } from "@/actions/career";

type JobApplication = {
  id: string;
  company: string;
  role: string;
  status: string;
  createdAt: Date;
};

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-yellow-100 text-yellow-800",
  offer: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const STATUSES = ["applied", "interviewing", "offer", "rejected"] as const;

export function JobApplicationsSection({
  initialApplications,
}: {
  initialApplications: JobApplication[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [roleError, setRoleError] = useState("");

  function handleAdd() {
    let valid = true;
    if (!company.trim()) { setCompanyError("Company is required"); valid = false; }
    else setCompanyError("");
    if (!role.trim()) { setRoleError("Role is required"); valid = false; }
    else setRoleError("");
    if (!valid) return;

    startTransition(async () => {
      await addJobApplication({ company: company.trim(), role: role.trim() });
      setCompany("");
      setRole("");
      setShowForm(false);
      router.refresh();
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateJobStatus(id, status);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteJobApplication(id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Briefcase className="h-4 w-4 text-indigo-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Job Applications</h2>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-5 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <label htmlFor="app-company" className="mb-1 block text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              id="app-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
                "focus:border-transparent focus:ring-2 focus:ring-indigo-500",
                companyError ? "border-red-400" : "border-gray-300"
              )}
            />
            {companyError && <p className="mt-1 text-xs text-red-500">{companyError}</p>}
          </div>
          <div>
            <label htmlFor="app-role" className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <input
              id="app-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm outline-none transition",
                "focus:border-transparent focus:ring-2 focus:ring-indigo-500",
                roleError ? "border-red-400" : "border-gray-300"
              )}
            />
            {roleError && <p className="mt-1 text-xs text-red-500">{roleError}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setCompanyError(""); setRoleError(""); setCompany(""); setRole(""); }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table or empty state */}
      {initialApplications.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Briefcase className="h-8 w-8 text-gray-200" />
          <p className="text-sm text-gray-400">No applications yet</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Track your first application
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {initialApplications.map((app) => (
                <tr key={app.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{app.company}</td>
                  <td className="px-4 py-3 text-gray-600">{app.role}</td>
                  <td className="px-4 py-3">
                    <select
                      aria-label="Status"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={cn(
                        "cursor-pointer rounded-full border-0 px-2 py-1 text-xs font-semibold outline-none",
                        STATUS_STYLES[app.status] ?? "bg-gray-100 text-gray-600"
                      )}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-white text-gray-800">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      aria-label="Delete application"
                      onClick={() => handleDelete(app.id)}
                      className="text-gray-400 transition hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
