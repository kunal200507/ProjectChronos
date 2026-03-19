import * as React from "react";
import { Bell, Shield, User, Monitor, Database, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

type Settings = {
  account: { name: string; email: string; role: string };
  notifications: {
    highRisk: boolean;
    mediumRisk: boolean;
    lowRisk: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  display: {
    autoRefreshSeconds: number;
    defaultView: "Grid" | "List";
    chartType: "Area" | "Line";
    compactMode: boolean;
  };
  ehr: {
    connected: boolean;
    protocol: "FHIR R4" | "HL7 v2.5";
    baseUrl: string;
    facilityId: string;
    apiKey: string;
  };
  security: {
    twoFactor: boolean;
    sessionTimeoutMinutes: 15 | 30 | 60 | 120;
    lockOnIdle: boolean;
  };
};

const STORAGE_KEY = "chronos.settings.v1";

const DEFAULT_SETTINGS: Settings = {
  account: { name: "Dr. Smith", email: "dr.smith@hospital.org", role: "ICU Attending" },
  notifications: { highRisk: true, mediumRisk: true, lowRisk: false, email: true, sms: false, inApp: true },
  display: { autoRefreshSeconds: 30, defaultView: "Grid", chartType: "Area", compactMode: false },
  ehr: { connected: true, protocol: "HL7 v2.5", baseUrl: "https://ehr.example.org", facilityId: "HOSP-001", apiKey: "" },
  security: { twoFactor: true, sessionTimeoutMinutes: 30, lockOnIdle: true },
};

function safeLoadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      account: { ...DEFAULT_SETTINGS.account, ...parsed.account },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
      display: { ...DEFAULT_SETTINGS.display, ...parsed.display },
      ehr: { ...DEFAULT_SETTINGS.ehr, ...parsed.ehr },
      security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const SettingsPage = () => {
  const [settings, setSettings] = React.useState<Settings>(() => safeLoadSettings());

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Button
          variant="outline"
          onClick={() => {
            setSettings(DEFAULT_SETTINGS);
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {
              // ignore
            }
          }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset to defaults
        </Button>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Account Settings
            </CardTitle>
            <div className="text-xs text-muted-foreground">Manage your profile and contact details</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={settings.account.name}
                  onChange={(e) => setSettings((s) => ({ ...s, account: { ...s.account, name: e.target.value } }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.account.email}
                  onChange={(e) => setSettings((s) => ({ ...s, account: { ...s.account, email: e.target.value } }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={settings.account.role}
                  onChange={(e) => setSettings((s) => ({ ...s, account: { ...s.account, role: e.target.value } }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notification Preferences
            </CardTitle>
            <div className="text-xs text-muted-foreground">Configure alert thresholds and channels</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">High-risk alerts</div>
                  <div className="text-xs text-muted-foreground">Red / critical</div>
                </div>
                <Switch
                  checked={settings.notifications.highRisk}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, highRisk: v } }))}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Medium-risk alerts</div>
                  <div className="text-xs text-muted-foreground">Yellow / watch</div>
                </div>
                <Switch
                  checked={settings.notifications.mediumRisk}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, mediumRisk: v } }))}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Low-risk alerts</div>
                  <div className="text-xs text-muted-foreground">Green / informational</div>
                </div>
                <Switch
                  checked={settings.notifications.lowRisk}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, lowRisk: v } }))}
                />
              </div>
            </div>

            <Separator />

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">In-app</div>
                  <div className="text-xs text-muted-foreground">Banner + badge</div>
                </div>
                <Switch
                  checked={settings.notifications.inApp}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, inApp: v } }))}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-xs text-muted-foreground">Digest + critical</div>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, email: v } }))}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">SMS</div>
                  <div className="text-xs text-muted-foreground">Critical only</div>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, notifications: { ...s.notifications, sms: v } }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              Display Settings
            </CardTitle>
            <div className="text-xs text-muted-foreground">Customize layout and refresh behavior</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Auto-refresh</Label>
                  <span className="text-xs text-muted-foreground">{settings.display.autoRefreshSeconds}s</span>
                </div>
                <Slider
                  value={[settings.display.autoRefreshSeconds]}
                  min={10}
                  max={120}
                  step={5}
                  onValueChange={(v) =>
                    setSettings((s) => ({ ...s, display: { ...s.display, autoRefreshSeconds: v[0] ?? 30 } }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Default view</Label>
                <Select
                  value={settings.display.defaultView}
                  onValueChange={(v) => setSettings((s) => ({ ...s, display: { ...s.display, defaultView: v as Settings["display"]["defaultView"] } }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grid">Grid</SelectItem>
                    <SelectItem value="List">List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chart type</Label>
                <Select
                  value={settings.display.chartType}
                  onValueChange={(v) => setSettings((s) => ({ ...s, display: { ...s.display, chartType: v as Settings["display"]["chartType"] } }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Area">Area</SelectItem>
                    <SelectItem value="Line">Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Compact mode</div>
                  <div className="text-xs text-muted-foreground">Denser cards and tables</div>
                </div>
                <Switch
                  checked={settings.display.compactMode}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, display: { ...s.display, compactMode: v } }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EHR Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              EHR Integration
            </CardTitle>
            <div className="text-xs text-muted-foreground">Connection settings for HL7/FHIR</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Connection status</div>
                <div className="text-xs text-muted-foreground">{settings.ehr.connected ? "Connected" : "Disconnected"}</div>
              </div>
              <Switch
                checked={settings.ehr.connected}
                onCheckedChange={(v) => setSettings((s) => ({ ...s, ehr: { ...s.ehr, connected: v } }))}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Protocol</Label>
                <Select
                  value={settings.ehr.protocol}
                  onValueChange={(v) => setSettings((s) => ({ ...s, ehr: { ...s.ehr, protocol: v as Settings["ehr"]["protocol"] } }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HL7 v2.5">HL7 v2.5</SelectItem>
                    <SelectItem value="FHIR R4">FHIR R4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facility">Facility ID</Label>
                <Input
                  id="facility"
                  value={settings.ehr.facilityId}
                  onChange={(e) => setSettings((s) => ({ ...s, ehr: { ...s.ehr, facilityId: e.target.value } }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ehr-url">Base URL</Label>
                <Input
                  id="ehr-url"
                  value={settings.ehr.baseUrl}
                  onChange={(e) => setSettings((s) => ({ ...s, ehr: { ...s.ehr, baseUrl: e.target.value } }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={settings.ehr.apiKey}
                  onChange={(e) => setSettings((s) => ({ ...s, ehr: { ...s.ehr, apiKey: e.target.value } }))}
                  placeholder="Optional"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Security
            </CardTitle>
            <div className="text-xs text-muted-foreground">Session, 2FA, and lock controls</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Two-factor authentication</div>
                  <div className="text-xs text-muted-foreground">Recommended for clinicians</div>
                </div>
                <Switch
                  checked={settings.security.twoFactor}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, security: { ...s.security, twoFactor: v } }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Session timeout</Label>
                <Select
                  value={String(settings.security.sessionTimeoutMinutes)}
                  onValueChange={(v) =>
                    setSettings((s) => ({ ...s, security: { ...s.security, sessionTimeoutMinutes: Number(v) as Settings["security"]["sessionTimeoutMinutes"] } }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="120">120 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-3 sm:col-span-2">
                <div>
                  <div className="text-sm font-medium">Lock on idle</div>
                  <div className="text-xs text-muted-foreground">Auto-lock when workstation is unattended</div>
                </div>
                <Switch
                  checked={settings.security.lockOnIdle}
                  onCheckedChange={(v) => setSettings((s) => ({ ...s, security: { ...s.security, lockOnIdle: v } }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
