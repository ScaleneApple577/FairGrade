import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
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

// TODO: GET http://localhost:8000/api/auth/profile
// TODO: PUT http://localhost:8000/api/auth/profile

interface Profile {
  fullName: string;
  email: string;
  department: string;
  institution: string;
  avatarInitials: string;
  role: "teacher" | "student";
}

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [notifications, setNotifications] = useState({
    emailAlerts: false,
    lowContribution: false,
    extensionIssues: false,
    weeklyDigest: false,
    flagAlerts: false,
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

  useEffect(() => {
    // TODO: Connect to GET http://localhost:8000/api/auth/profile
    // fetch('http://localhost:8000/api/auth/profile')
    //   .then(res => res.json())
    //   .then(data => { setProfile(data); setIsLoading(false); })
    //   .catch(err => { setIsLoading(false); })
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111827]">
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827]">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">
            Manage your account, notifications, and preferences
          </p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white/5 border border-white/10">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="grading" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
              <Scale className="h-4 w-4 mr-2" />
              Grading
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">
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
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="font-semibold text-white mb-6">Personal Information</h3>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                    {profile?.avatarInitials || "—"}
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/10 text-white hover:bg-white/15">
                      Change Photo
                    </Button>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profile?.fullName || ""} 
                      placeholder="Enter your name"
                      onChange={() => setHasChanges(true)}
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profile?.email || ""} 
                      placeholder="Enter your email"
                      onChange={() => setHasChanges(true)}
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-slate-300">Department</Label>
                    <Input 
                      id="department" 
                      value={profile?.department || ""} 
                      placeholder="Enter department"
                      onChange={() => setHasChanges(true)}
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution" className="text-slate-300">Institution</Label>
                    <Input 
                      id="institution" 
                      value={profile?.institution || ""} 
                      placeholder="Enter institution"
                      onChange={() => setHasChanges(true)}
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500" 
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
                  <Button variant="outline" className="bg-white/10 border-white/10 text-white hover:bg-white/15">
                    Cancel
                  </Button>
                  <Button disabled={!hasChanges} className={hasChanges ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 text-slate-500"}>
                    <Save className="h-4 w-4 mr-2" />
                    {hasChanges ? "Save Changes" : "No Changes"}
                  </Button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Teaching Profile</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-300">Default Grading Scale</Label>
                    <Select defaultValue="percentage">
                      <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                        <SelectItem value="letter">Letter Grade (A-F)</SelectItem>
                        <SelectItem value="points">Points Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">Default Group Size</Label>
                    <Select defaultValue="4">
                      <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
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
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Email Notifications</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="font-medium text-white">Low Contribution Alerts</p>
                      <p className="text-sm text-slate-400">Get notified when students fall below threshold</p>
                    </div>
                    <Switch
                      checked={notifications.lowContribution}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, lowContribution: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="font-medium text-white">AI/Plagiarism Flags</p>
                      <p className="text-sm text-slate-400">Receive alerts for suspicious activity</p>
                    </div>
                    <Switch
                      checked={notifications.flagAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, flagAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="font-medium text-white">Extension Issues</p>
                      <p className="text-sm text-slate-400">Alert when students have tracking problems</p>
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
                      <p className="font-medium text-white">Weekly Digest</p>
                      <p className="text-sm text-slate-400">Summary of all project activity</p>
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

              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Notification Preferences</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-300">Notification Frequency</Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">Quiet Hours</Label>
                    <Select defaultValue="none">
                      <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
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
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="font-semibold text-white mb-2">Contribution Weights</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Adjust how different activities contribute to the overall score
                </p>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-300">Document Edits</Label>
                      <span className="text-sm font-semibold text-blue-400">{gradingWeights.documentEdits}%</span>
                    </div>
                    <Slider
                      value={[gradingWeights.documentEdits]}
                      onValueChange={([value]) =>
                        setGradingWeights({ ...gradingWeights, documentEdits: value })
                      }
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:bg-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Text additions, edits, and formatting changes</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-300">Meeting Attendance</Label>
                      <span className="text-sm font-semibold text-blue-400">{gradingWeights.meetings}%</span>
                    </div>
                    <Slider
                      value={[gradingWeights.meetings]}
                      onValueChange={([value]) =>
                        setGradingWeights({ ...gradingWeights, meetings: value })
                      }
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:bg-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Video call participation and camera usage</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-300">Task Completion</Label>
                      <span className="text-sm font-semibold text-blue-400">{gradingWeights.tasks}%</span>
                    </div>
                    <Slider
                      value={[gradingWeights.tasks]}
                      onValueChange={([value]) =>
                        setGradingWeights({ ...gradingWeights, tasks: value })
                      }
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:bg-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Assigned tasks completed on time</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-slate-300">Communication</Label>
                      <span className="text-sm font-semibold text-blue-400">{gradingWeights.communication}%</span>
                    </div>
                    <Slider
                      value={[gradingWeights.communication]}
                      onValueChange={([value]) =>
                        setGradingWeights({ ...gradingWeights, communication: value })
                      }
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:bg-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Slack/Discord messages and responses</p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Total</span>
                      <span className={`font-bold ${
                        gradingWeights.documentEdits + gradingWeights.meetings + gradingWeights.tasks + gradingWeights.communication === 100
                          ? "text-green-400"
                          : "text-red-400"
                      }`}>
                        {gradingWeights.documentEdits + gradingWeights.meetings + gradingWeights.tasks + gradingWeights.communication}%
                      </span>
                    </div>
                    {gradingWeights.documentEdits + gradingWeights.meetings + gradingWeights.tasks + gradingWeights.communication !== 100 && (
                      <p className="text-xs text-red-400 mt-1">Weights must total 100%</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="font-semibold text-white mb-2">Alert Thresholds</h3>
                <p className="text-sm text-slate-400 mb-6">
                  Configure when to receive alerts about student activity
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-slate-300">Low Contribution Threshold</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="number"
                        value={thresholds.lowContribution}
                        onChange={(e) =>
                          setThresholds({ ...thresholds, lowContribution: parseInt(e.target.value) || 0 })
                        }
                        className="w-24 bg-white/10 border-white/10 text-white"
                      />
                      <span className="text-sm text-slate-400">% or below triggers alert</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Inactivity Days</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="number"
                        value={thresholds.inactivityDays}
                        onChange={(e) =>
                          setThresholds({ ...thresholds, inactivityDays: parseInt(e.target.value) || 0 })
                        }
                        className="w-24 bg-white/10 border-white/10 text-white"
                      />
                      <span className="text-sm text-slate-400">days without activity</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">AI Flag Sensitivity</Label>
                    <Select
                      value={thresholds.flagSeverity}
                      onValueChange={(value) =>
                        setThresholds({ ...thresholds, flagSeverity: value })
                      }
                    >
                      <SelectTrigger className="mt-2 bg-white/10 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
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
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Theme</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 rounded-xl border-2 border-white/10 hover:border-white/20 flex flex-col items-center gap-3 transition-colors">
                    <Sun className="h-6 w-6 text-slate-400" />
                    <span className="font-medium text-white">Light</span>
                  </button>
                  <button className="p-4 rounded-xl border-2 border-blue-500 bg-blue-500/10 flex flex-col items-center gap-3">
                    <Moon className="h-6 w-6 text-blue-400" />
                    <span className="font-medium text-white">Dark</span>
                  </button>
                  <button className="p-4 rounded-xl border-2 border-white/10 hover:border-white/20 flex flex-col items-center gap-3 transition-colors">
                    <Globe className="h-6 w-6 text-slate-400" />
                    <span className="font-medium text-white">System</span>
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="font-semibold text-white mb-6">Display Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="font-medium text-white">Compact Mode</p>
                      <p className="text-sm text-slate-400">Show more content in less space</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="font-medium text-white">Show Animations</p>
                      <p className="text-sm text-slate-400">Enable smooth transitions and effects</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-white">Show Tooltips</p>
                      <p className="text-sm text-slate-400">Display helpful hints on hover</p>
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
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Key className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Password</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      placeholder="Enter current password"
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      placeholder="Enter new password"
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="Confirm new password"
                      className="mt-2 bg-white/10 border-white/10 text-white placeholder:text-slate-500" 
                    />
                  </div>
                </div>

                <Button className="mt-6 bg-blue-500 hover:bg-blue-600">Update Password</Button>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Enable 2FA</p>
                    <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" className="bg-white/10 border-white/10 text-white hover:bg-white/15">
                    Enable
                  </Button>
                </div>
              </div>

              <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <h3 className="font-semibold text-red-400">Danger Zone</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-red-500/10">
                    <div>
                      <p className="font-medium text-white">Export All Data</p>
                      <p className="text-sm text-slate-400">Download all your projects and data</p>
                    </div>
                    <Button variant="outline" className="bg-white/10 border-white/10 text-white hover:bg-white/15">
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-red-400">Delete Account</p>
                      <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
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
    </div>
  );
}
