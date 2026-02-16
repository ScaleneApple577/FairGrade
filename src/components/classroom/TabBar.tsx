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
    <div className="border-b border-[#e0e0e0] flex gap-0">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === tab.key
              ? 'text-[#1a73e8]'
              : 'text-[#5f6368] hover:text-[#202124]'
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a73e8] rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}
