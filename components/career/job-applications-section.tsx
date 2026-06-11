"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
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
    if (!company.trim()) {
      setCompanyError("Company is required");
      valid = false;
    } else {
      setCompanyError("");
    }
    if (!role.trim()) {
      setRoleError("Role is required");
      valid = false;
    } else {
      setRoleError("");
    }
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
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Job Applications</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div>
            <label htmlFor="app-company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              id="app-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
              className={cn(
                "w-full px-3 py-2 rounded-lg border text-sm outline-none",
                "focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition",
                companyError ? "border-red-400" : "border-gray-300"
              )}
            />
            {companyError && <p className="text-xs text-red-500 mt-1">{companyError}</p>}
          </div>
          <div>
            <label htmlFor="app-role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              id="app-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className={cn(
                "w-full px-3 py-2 rounded-lg border text-sm outline-none",
                "focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition",
                roleError ? "border-red-400" : "border-gray-300"
              )}
            />
            {roleError && <p className="text-xs text-red-500 mt-1">{roleError}</p>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setCompanyError(""); setRoleError(""); setCompany(""); setRole(""); }}
              className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {initialApplications.length === 0 && !showForm ? (
        <p className="text-sm text-gray-400 italic">No applications yet</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
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
                <tr key={app.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{app.company}</td>
                  <td className="px-4 py-3 text-gray-600">{app.role}</td>
                  <td className="px-4 py-3">
                    <select
                      aria-label="Status"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer",
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
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      aria-label="Delete application"
                      onClick={() => handleDelete(app.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
