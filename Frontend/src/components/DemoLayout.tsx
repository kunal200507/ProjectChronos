import * as React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, AlertTriangle, BarChart3, Settings, Search, Bell, ChevronDown, HeartPulse, Stethoscope, UserRound, ArrowLeftRight } from "lucide-react";
import chronosIcon from "@/assets/chronos-logo-icon.png";
import { patients } from "@/data/patients";
import { scoreToRiskLabel } from "@/lib/risk";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "Doctor" | "Nurse";
const ROLE_KEY = "chronos.role.v1";

const navItems = [
  { title: "Dashboard", path: "/demo", icon: LayoutDashboard, roles: ["Doctor", "Nurse"] as Role[] },
  { title: "Patients", path: "/demo/patients", icon: Users, roles: ["Doctor", "Nurse"] as Role[] },
  { title: "Vitals", path: "/demo/vitals", icon: HeartPulse, roles: ["Doctor", "Nurse"] as Role[], nurseHighlight: true },
  { title: "Alerts", path: "/demo/alerts", icon: AlertTriangle, roles: ["Doctor", "Nurse"] as Role[] },
  { title: "Transfer", path: "/demo/transfer", icon: ArrowLeftRight, roles: ["Doctor", "Nurse"] as Role[] },
  { title: "Reports", path: "/demo/reports", icon: BarChart3, roles: ["Doctor"] as Role[] },
  { title: "Settings", path: "/demo/settings", icon: Settings, roles: ["Doctor", "Nurse"] as Role[] },
];

const DemoLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [role, setRole] = React.useState<Role>(() => {
    try {
      const stored = localStorage.getItem(ROLE_KEY);
      return (stored === "Doctor" || stored === "Nurse") ? stored : "Doctor";
    } catch {
      return "Doctor";
    }
  });

  const switchRole = React.useCallback((r: Role) => {
    setRole(r);
    try { localStorage.setItem(ROLE_KEY, r); } catch { /* ignore */ }
  }, []);

  const slugify = React.useCallback((value: string) => {
    return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }, []);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => p.name.toLowerCase().includes(q) || p.bed.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const goToPatient = React.useCallback(
    (name: string) => {
      navigate(`/demo/patients?patient=${encodeURIComponent(slugify(name))}`);
      setOpen(false);
      setQuery("");
    },
    [navigate, slugify],
  );

  const goToSearch = React.useCallback(() => {
    const q = query.trim();
    if (!q) return;
    navigate(`/demo/patients?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }, [navigate, query]);

  const notifications = React.useMemo(
    () => [
      { title: "High-risk alert", desc: "John Doe · Bed A1 · Risk 87%", href: "/demo/alerts" },
      { title: "High-risk alert", desc: "David Park · Bed B4 · Risk 78%", href: "/demo/alerts" },
      { title: "New report available", desc: "Monthly Performance Review · Mar 2026", href: "/demo/reports" },
    ],
    [],
  );

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  const userInitials = role === "Doctor" ? "DS" : "NR";
  const userName = role === "Doctor" ? "Dr. Smith" : "Nurse Rivera";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-48 bg-sidebar flex flex-col border-r border-sidebar-border shrink-0">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-sidebar-border">
          <img src={chronosIcon} alt="Chronos" className="w-7 h-7 rounded" />
          <span className="font-bold text-sidebar-foreground text-sm tracking-wide">CHRONOS</span>
        </div>

        {/* Role badge in sidebar */}
        <div className="px-3 pt-3 pb-1">
          <div className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
            role === "Doctor"
              ? "bg-primary/10 text-primary"
              : "bg-success/10 text-success"
          }`}>
            {role === "Doctor"
              ? <Stethoscope className="w-3 h-3" />
              : <HeartPulse className="w-3 h-3" />}
            {role === "Nurse" ? "Nurse Mode" : "Doctor Mode"}
          </div>
        </div>

        <nav className="flex-1 py-2 px-2 space-y-1">
          {visibleNavItems.map((item) => {
            const active = location.pathname === item.path;
            const nurseHL = role === "Nurse" && item.nurseHighlight;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : nurseHL && !active
                    ? "text-success font-semibold hover:bg-success/10"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
                {nurseHL && !active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-success" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b flex items-center justify-between px-6 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ChevronDown className="w-4 h-4 rotate-90" />
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patients…"
                className="pl-9 pr-4 py-1.5 rounded-md bg-secondary border-none text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => { window.setTimeout(() => setOpen(false), 150); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToSearch();
                  if (e.key === "Escape") setOpen(false);
                }}
              />
              {open && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-card shadow-lg overflow-hidden z-50">
                  <div className="max-h-72 overflow-auto">
                    {results.map((p) => (
                      <button
                        key={`${p.name}-${p.bed}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goToPatient(p.name)}
                        className="w-full text-left px-3 py-2 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground">Bed {p.bed}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{scoreToRiskLabel(p.score)} · Score {p.score}%</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="relative text-muted-foreground hover:text-foreground" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem key={n.title + n.desc} onSelect={() => navigate(n.href)}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.desc}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/demo/alerts")}>View all alerts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User / Role menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-2" aria-label="User menu">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{userInitials}</div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium leading-tight">{userName}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{role}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="flex items-center gap-1.5">
                  <UserRound className="w-3.5 h-3.5" /> Switch Role
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => switchRole("Doctor")}
                  className={role === "Doctor" ? "bg-primary/10 text-primary font-semibold" : ""}
                >
                  <Stethoscope className="w-3.5 h-3.5 mr-1.5" /> Doctor
                  {role === "Doctor" && <span className="ml-auto text-[10px]">Active</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => switchRole("Nurse")}
                  className={role === "Nurse" ? "bg-success/10 text-success font-semibold" : ""}
                >
                  <HeartPulse className="w-3.5 h-3.5 mr-1.5" /> Nurse
                  {role === "Nurse" && <span className="ml-auto text-[10px]">Active</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/demo/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate("/demo/reports")}>Reports</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/")}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DemoLayout;
