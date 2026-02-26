interface Tab {
  key: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
