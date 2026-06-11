import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as careerActions from "@/actions/career";
import { SkillsSection } from "@/components/career/skills-section";
import { JobApplicationsSection } from "@/components/career/job-applications-section";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("@/actions/career", () => ({
  addSkill: vi.fn(),
  deleteSkill: vi.fn(),
  addJobApplication: vi.fn(),
  updateJobStatus: vi.fn(),
  deleteJobApplication: vi.fn(),
}));

const mockAddSkill = vi.mocked(careerActions.addSkill);
const mockDeleteSkill = vi.mocked(careerActions.deleteSkill);
const mockAddJobApplication = vi.mocked(careerActions.addJobApplication);
const mockUpdateJobStatus = vi.mocked(careerActions.updateJobStatus);
const mockDeleteJobApplication = vi.mocked(careerActions.deleteJobApplication);

const sampleSkills = [
  { id: "skill-1", name: "TypeScript", level: "advanced" },
  { id: "skill-2", name: "React", level: "intermediate" },
];

const sampleApplications = [
  {
    id: "app-1",
    company: "Acme Corp",
    role: "Frontend Engineer",
    status: "applied",
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "app-2",
    company: "Globex",
    role: "Full Stack Developer",
    status: "interviewing",
    createdAt: new Date("2026-01-05"),
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── SkillsSection ────────────────────────────────────────────────────────────

describe("SkillsSection rendering", () => {
  it("renders a list of skills with name and level", () => {
    render(<SkillsSection initialSkills={sampleSkills} />);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText(/advanced/i)).toBeInTheDocument();
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
  });

  it("renders empty state when no skills are passed", () => {
    render(<SkillsSection initialSkills={[]} />);
    expect(screen.getByText(/no skills added yet/i)).toBeInTheDocument();
  });

  it("shows add skill form when 'Add Skill' button is clicked", () => {
    render(<SkillsSection initialSkills={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add skill/i }));
    expect(screen.getByLabelText(/skill name/i)).toBeInTheDocument();
  });
});

describe("SkillsSection add skill form", () => {
  it("shows validation error when skill name is empty on submit", async () => {
    render(<SkillsSection initialSkills={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add skill/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save/i }));
    expect(await screen.findByText(/skill name is required/i)).toBeInTheDocument();
  });

  it("calls addSkill with correct name and level on valid submit", async () => {
    mockAddSkill.mockResolvedValueOnce(undefined);
    render(<SkillsSection initialSkills={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add skill/i }));
    fireEvent.change(screen.getByLabelText(/skill name/i), {
      target: { value: "Node.js" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: /level/i }), {
      target: { value: "intermediate" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save/i }));
    await waitFor(() => {
      expect(mockAddSkill).toHaveBeenCalledWith({ name: "Node.js", level: "intermediate" });
    });
  });

  it("calls router.refresh after successful skill add", async () => {
    mockAddSkill.mockResolvedValueOnce(undefined);
    render(<SkillsSection initialSkills={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add skill/i }));
    fireEvent.change(screen.getByLabelText(/skill name/i), {
      target: { value: "Python" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save/i }));
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});

describe("SkillsSection delete", () => {
  it("calls deleteSkill with the correct id when delete button is clicked", async () => {
    mockDeleteSkill.mockResolvedValueOnce(undefined);
    render(<SkillsSection initialSkills={sampleSkills} />);
    const deleteButtons = screen.getAllByRole("button", { name: /delete skill/i });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(mockDeleteSkill).toHaveBeenCalledWith("skill-1");
    });
  });
});

// ─── JobApplicationsSection ───────────────────────────────────────────────────

describe("JobApplicationsSection rendering", () => {
  it("renders a row for each application with company, role, and status", () => {
    render(<JobApplicationsSection initialApplications={sampleApplications} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
    expect(screen.getByText("Full Stack Developer")).toBeInTheDocument();
  });

  it("renders empty state when no applications are passed", () => {
    render(<JobApplicationsSection initialApplications={[]} />);
    expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
  });

  it("shows add application form when 'Add Application' button is clicked", () => {
    render(<JobApplicationsSection initialApplications={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
  });
});

describe("JobApplicationsSection add application form", () => {
  it("shows validation error when company is empty on submit", async () => {
    render(<JobApplicationsSection initialApplications={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save/i }));
    expect(await screen.findByText(/company is required/i)).toBeInTheDocument();
  });

  it("shows validation error when role is empty on submit", async () => {
    render(<JobApplicationsSection initialApplications={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: "Acme Corp" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save/i }));
    expect(await screen.findByText(/role is required/i)).toBeInTheDocument();
  });

  it("calls addJobApplication with correct args on valid submit", async () => {
    mockAddJobApplication.mockResolvedValueOnce(undefined);
    render(<JobApplicationsSection initialApplications={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: "Acme Corp" },
    });
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: "Engineer" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save/i }));
    await waitFor(() => {
      expect(mockAddJobApplication).toHaveBeenCalledWith({
        company: "Acme Corp",
        role: "Engineer",
      });
    });
  });

  it("calls router.refresh after successful application add", async () => {
    mockAddJobApplication.mockResolvedValueOnce(undefined);
    render(<JobApplicationsSection initialApplications={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    fireEvent.change(screen.getByLabelText(/company/i), {
      target: { value: "Globex" },
    });
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: "Developer" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save/i }));
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});

describe("JobApplicationsSection status update", () => {
  it("calls updateJobStatus with correct id and status when status changes", async () => {
    mockUpdateJobStatus.mockResolvedValueOnce(undefined);
    render(<JobApplicationsSection initialApplications={sampleApplications} />);
    const statusSelects = screen.getAllByRole("combobox", { name: /status/i });
    fireEvent.change(statusSelects[0], { target: { value: "interviewing" } });
    await waitFor(() => {
      expect(mockUpdateJobStatus).toHaveBeenCalledWith("app-1", "interviewing");
    });
  });
});

describe("JobApplicationsSection delete", () => {
  it("calls deleteJobApplication with the correct id when delete is clicked", async () => {
    mockDeleteJobApplication.mockResolvedValueOnce(undefined);
    render(<JobApplicationsSection initialApplications={sampleApplications} />);
    const deleteButtons = screen.getAllByRole("button", { name: /delete application/i });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(mockDeleteJobApplication).toHaveBeenCalledWith("app-1");
    });
  });
});
