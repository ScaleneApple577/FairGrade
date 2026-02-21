interface DashboardTab {
  key: string;
  label: string;
}

interface DashboardTabsProps {
  tabs: DashboardTab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export function DashboardTabs({ tabs, activeTab, onChange }: DashboardTabsProps) {
  return (
    <div className="border-b border-border flex gap-0 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-5 py-3 text-sm font-medium transition-colors relative ${
            activeTab === tab.key
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}
