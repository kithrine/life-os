import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSignIn } from "@clerk/nextjs";
import { LoginForm } from "@/components/auth/login-form";

vi.mock("@clerk/nextjs", () => ({
  useSignIn: vi.fn(),
}));

const mockPassword = vi.fn();
const mockCreate = vi.fn();
const mockFinalize = vi.fn();

function setupSignInMock({ status = "idle" as string } = {}) {
  (useSignIn as ReturnType<typeof vi.fn>).mockReturnValue({
    fetchStatus: "idle",
    errors: { emailAddress: null },
    isLoaded: true,
    signIn: {
      password: mockPassword,
      create: mockCreate,
      finalize: mockFinalize,
      status,
    },
  });
}

// Make window.location.href writable so we can assert on redirects
Object.defineProperty(window, "location", {
  writable: true,
  configurable: true,
  value: { href: "" },
});

beforeEach(() => {
  vi.clearAllMocks();
  (window.location as { href: string }).href = "";
  setupSignInMock();
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("LoginForm rendering", () => {
  it("renders email and password inputs", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders the log in button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("renders remember me checkbox", () => {
    render(<LoginForm />);
    expect(screen.getByRole("checkbox", { name: /remember me/i })).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: /forgot password/i })).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  it("renders Google, Apple, and Microsoft OAuth buttons", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apple/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /microsoft/i })).toBeInTheDocument();
  });

  it("password input is type password by default", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("toggles password visibility when eye icon is clicked", () => {
    render(<LoginForm />);
    const toggle = screen.getByRole("button", { name: /show password/i });
    fireEvent.click(toggle);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    fireEvent.click(toggle);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });
});

// ─── Client-side validation ───────────────────────────────────────────────────

describe("LoginForm validation", () => {
  it("shows email required error when email is empty", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it("shows password required error when password is empty", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it("shows invalid email error for malformed email", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "notanemail" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "somepassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  it("shows only password error when email is valid but password is empty", async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
  });

  it("does not call signIn.password when validation fails", async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await screen.findByText(/email is required/i);
    expect(mockPassword).not.toHaveBeenCalled();
  });
});

// ─── Auth behavior ────────────────────────────────────────────────────────────

describe("LoginForm auth behavior", () => {
  it("calls signIn.password with emailAddress and password on valid submit", async () => {
    setupSignInMock({ status: "complete" });
    mockPassword.mockResolvedValueOnce({ error: null });
    mockFinalize.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(mockPassword).toHaveBeenCalledWith({
        emailAddress: "user@example.com",
        password: "password123",
      });
    });
  });

  it("shows loading state while signing in", async () => {
    mockPassword.mockReturnValueOnce(new Promise(() => {})); // never resolves
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();
    });
  });

  it("calls signIn.finalize and redirects to /dashboard on success", async () => {
    setupSignInMock({ status: "complete" });
    mockPassword.mockResolvedValueOnce({ error: null });
    mockFinalize.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(mockFinalize).toHaveBeenCalled();
      expect(window.location.href).toBe("/dashboard");
    });
  });

  it("shows 'Incorrect email or password' on form_password_incorrect", async () => {
    mockPassword.mockResolvedValueOnce({
      error: { code: "form_password_incorrect" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument();
  });

  it("shows 'No account found' on form_identifier_not_found", async () => {
    mockPassword.mockResolvedValueOnce({
      error: { code: "form_identifier_not_found" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "nobody@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/no account found with that email/i)).toBeInTheDocument();
  });

  it("shows rate limit message on too_many_requests", async () => {
    mockPassword.mockResolvedValueOnce({
      error: { code: "too_many_requests" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument();
  });

  it("shows generic error for unknown error codes", async () => {
    mockPassword.mockResolvedValueOnce({
      error: { code: "unknown_error_code" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("re-enables submit button after an error", async () => {
    mockPassword.mockResolvedValueOnce({
      error: { code: "form_password_incorrect" },
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await screen.findByText(/incorrect email or password/i);
    expect(screen.getByRole("button", { name: /log in/i })).not.toBeDisabled();
  });
});

// ─── OAuth / Social login ─────────────────────────────────────────────────────

describe("LoginForm OAuth", () => {
  it("calls signIn.create with oauth_google strategy on Google click", async () => {
    mockCreate.mockResolvedValueOnce({ error: null });
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /google/i }));
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ strategy: "oauth_google" })
      );
    });
  });

  it("calls signIn.create with oauth_microsoft strategy on Microsoft click", async () => {
    mockCreate.mockResolvedValueOnce({ error: null });
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /microsoft/i }));
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ strategy: "oauth_microsoft" })
      );
    });
  });

  it("calls signIn.create with oauth_apple strategy on Apple click", async () => {
    mockCreate.mockResolvedValueOnce({ error: null });
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /apple/i }));
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ strategy: "oauth_apple" })
      );
    });
  });
});
