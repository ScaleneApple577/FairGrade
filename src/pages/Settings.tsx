import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Scale,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Save,
  AlertTriangle,
  Trash2,
  Key,
  GraduationCap,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    lowContribution: true,
    extensionIssues: true,
    weeklyDigest: true,
    flagAlerts: true,
  });

  const [gradingWeights, setGradingWeights] = useState({
    documentEdits: 40,
    meetings: 30,
    tasks: 20,
    communication: 10,
  });

  const [thresholds, setThresholds] = useState({
    lowContribution: 20,
    flagSeverity: "medium",
    inactivityDays: 3,
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, notifications, and grading preferences
          </p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="grading">
              <Scale className="h-4 w-4 mr-2" />
              Grading
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h3 className="font-semibold text-foreground mb-6">Personal Information</h3>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    JD
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue="Dr. John Doe" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@university.edu" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" defaultValue="Computer Science" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input id="institution" defaultValue="State University" className="mt-2" />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Teaching Profile</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Default Grading Scale</Label>
                    <Select defaultValue="percentage">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                        <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                        <SelectItem value="points">Points Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Default Group Size</Label>
                    <Select defaultValue="4">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 students</SelectItem>
                        <SelectItem value="3">3 students</SelectItem>
                        <SelectItem value="4">4 students</SelectItem>
                        <SelectItem value="5">5 students</SelectItem>
                        <SelectItem value="6">6 students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Email Notifications</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="font-medium text-foreground">Low Contribution Alerts</p>
                      <p className="text-sm text-muted-foreground">Get notified when students fall below threshold</p>
                    </div>
                    <Switch
                      checked={notifications.lowContribution}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, lowContribution: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="font-medium text-foreground">AI/Plagiarism Flags</p>
                      <p className="text-sm text-muted-foreground">Receive alerts for suspicious activity</p>
                    </div>
                    <Switch
                      checked={notifications.flagAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, flagAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="font-medium text-foreground">Extension Issues</p>
                      <p className="text-sm text-muted-foreground">Alert when students have tracking problems</p>
                    </div>
                    <Switch
                      checked={notifications.extensionIssues}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, extensionIssues: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-foreground">Weekly Digest</p>
                      <p className="text-sm text-muted-foreground">Summary of all project activity</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyDigest: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Notification Preferences</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Notification Frequency</Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quiet Hours</Label>
                    <Select defaultValue="none">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No quiet hours</SelectItem>
                        <SelectItem value="night">10PM - 8AM</SelectItem>
                        <SelectItem value="weekend">Weekends only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Grading Tab */}
          <TabsContent value="grading">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h3 className="font-semibold text-foreground mb-2">Contribution Weights</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Adjust how different activities contribute to the overall score
                </p>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Document Edits</Label>
                      <span className="text-sm font-semibold text-primary">{gradingWeights.documentEdits}%</span>
                    </div>
                    <Slider
                      value={[gradingWeights.documentEdits]}
                      onValueChange={([value]) =>
                        setGradingWeights({ ...gradingWeights, documentEdits: value })
                      }
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Text additions, edits, and formatting changes</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Meeting Attendance</Label>
                      <span className="text-sm font-semibold text-primary">{gradingWeights.meetings}%</span>
                    </div>
                    <Slider
                      value={[gradingWeights.meetings]}
                      onValueChange={([value]) =>
                        setGradingWeights({ ...gradingWeights, meetings: value })
                      }
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Video call participation and camera usage</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Task Completion</Label>
                      <span className="text-sm font-semibold text-primary">{gradingWeights.tasks}%</span>
                    </div>
                    <Slider
                      value={[gradingWeights.tasks]}
                      onValueChange={([value]) =>
                        setGradingWeights({ ...gradingWeights, tasks: value })
                      }
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Assigned tasks completed on time</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Communication</Label>
                      <span className="text-sm font-semibold text-primary">{gradingWeights.communication}%</span>
                    </div>
                    <Slider
                      value={[gradingWeights.communication]}
                      onValueChange={([value]) =>
                        setGradingWeights({ ...gradingWeights, communication: value })
                      }
                      max={100}
                      step={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Slack/Discord messages and responses</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className={`font-bold ${
                        gradingWeights.documentEdits + gradingWeights.meetings + gradingWeights.tasks + gradingWeights.communication === 100
                          ? "text-success"
                          : "text-destructive"
                      }`}>
                        {gradingWeights.documentEdits + gradingWeights.meetings + gradingWeights.tasks + gradingWeights.communication}%
                      </span>
                    </div>
                    {gradingWeights.documentEdits + gradingWeights.meetings + gradingWeights.tasks + gradingWeights.communication !== 100 && (
                      <p className="text-xs text-destructive mt-1">Weights must total 100%</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h3 className="font-semibold text-foreground mb-2">Alert Thresholds</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Configure when to receive alerts about student activity
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Low Contribution Threshold</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="number"
                        value={thresholds.lowContribution}
                        onChange={(e) =>
                          setThresholds({ ...thresholds, lowContribution: parseInt(e.target.value) || 0 })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">% or below triggers alert</span>
                    </div>
                  </div>

                  <div>
                    <Label>Inactivity Days</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="number"
                        value={thresholds.inactivityDays}
                        onChange={(e) =>
                          setThresholds({ ...thresholds, inactivityDays: parseInt(e.target.value) || 0 })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">days without activity</span>
                    </div>
                  </div>

                  <div>
                    <Label>AI Flag Sensitivity</Label>
                    <Select
                      value={thresholds.flagSeverity}
                      onValueChange={(value) =>
                        setThresholds({ ...thresholds, flagSeverity: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (fewer alerts)</SelectItem>
                        <SelectItem value="medium">Medium (balanced)</SelectItem>
                        <SelectItem value="high">High (more alerts)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Theme</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex flex-col items-center gap-3">
                    <Sun className="h-6 w-6 text-primary" />
                    <span className="font-medium text-foreground">Light</span>
                  </button>
                  <button className="p-4 rounded-xl border-2 border-border hover:border-primary/50 flex flex-col items-center gap-3 transition-colors">
                    <Moon className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium text-foreground">Dark</span>
                  </button>
                  <button className="p-4 rounded-xl border-2 border-border hover:border-primary/50 flex flex-col items-center gap-3 transition-colors">
                    <Globe className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium text-foreground">System</span>
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <h3 className="font-semibold text-foreground mb-6">Display Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="font-medium text-foreground">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Show more content in less space</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="font-medium text-foreground">Show Animations</p>
                      <p className="text-sm text-muted-foreground">Enable smooth transitions and effects</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-foreground">Show Tooltips</p>
                      <p className="text-sm text-muted-foreground">Display helpful hints on hover</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <Key className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Password</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" className="mt-2" />
                  </div>
                </div>

                <Button className="mt-6">Update Password</Button>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Two-Factor Authentication</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>

              <div className="bg-destructive/5 rounded-xl border border-destructive/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold text-destructive">Danger Zone</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-destructive/10">
                    <div>
                      <p className="font-medium text-foreground">Export All Data</p>
                      <p className="text-sm text-muted-foreground">Download all your projects and data</p>
                    </div>
                    <Button variant="outline">Export</Button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
