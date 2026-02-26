import React from "react";

const IC = "#444746"; // icon color

function ToolbarButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center w-7 h-7 rounded cursor-default select-none hover:bg-black/[0.06] ${className}`}>
      {children}
    </div>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-[#dadce0] mx-0.5 flex-shrink-0" />;
}

function ToolbarDropdown({ label, width }: { label: string; width?: string }) {
  return (
    <div
      className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[12px] text-[#444746] bg-white border border-[#c4c7c5] select-none cursor-default hover:bg-[#f8f9fa]"
      style={width ? { width, justifyContent: "space-between" } : undefined}
    >
      <span className="truncate">{label}</span>
      <svg width="8" height="5" viewBox="0 0 8 5" className="flex-shrink-0 ml-0.5">
        <path d="M0.5 0.5L4 4L7.5 0.5" stroke={IC} strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  );
}

/* ─── SVG Icons (18×18, stroke/fill #444746) ─── */

function UndoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5.5 4.5L2.5 7.5L5.5 10.5" stroke={IC} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 7.5H11C13.2 7.5 15 9.3 15 11.5C15 13.7 13.2 15.5 11 15.5H9" stroke={IC} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M12.5 4.5L15.5 7.5L12.5 10.5" stroke={IC} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7.5H7C4.8 7.5 3 9.3 3 11.5C3 13.7 4.8 15.5 7 15.5H9" stroke={IC} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="4.5" y="2.5" width="9" height="4" stroke={IC} strokeWidth="1.2" />
      <rect x="2.5" y="6.5" width="13" height="6" rx="1" stroke={IC} strokeWidth="1.2" />
      <rect x="5" y="10.5" width="8" height="5" stroke={IC} strokeWidth="1.2" fill="white" />
      <circle cx="13" cy="9" r="0.8" fill={IC} />
    </svg>
  );
}

function SpellCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 14L6.5 4H8.5L12 14" stroke={IC} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 11H10.5" stroke={IC} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 13L13 15L17 10" stroke={IC} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaintFormatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="2.5" width="10" height="5" rx="1" stroke={IC} strokeWidth="1.2" />
      <path d="M7 7.5V10.5" stroke={IC} strokeWidth="1.2" />
      <rect x="5.5" y="10.5" width="3" height="5" rx="0.5" stroke={IC} strokeWidth="1.2" />
    </svg>
  );
}

function BoldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 3.5H10C11.65 3.5 13 4.85 13 6.5C13 8.15 11.65 9.5 10 9.5H5V3.5Z" stroke={IC} strokeWidth="1.4" />
      <path d="M5 9.5H10.5C12.15 9.5 13.5 10.85 13.5 12.5C13.5 14.15 12.15 15.5 10.5 15.5H5V9.5Z" stroke={IC} strokeWidth="1.4" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M7 15L11 3" stroke={IC} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5.5 15H8.5" stroke={IC} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 3H12.5" stroke={IC} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 3V9.5C5 12 7 14 9 14C11 14 13 12 13 9.5V3" stroke={IC} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 16H14" stroke={IC} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function TextColorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 13L7.5 4H10.5L13 13" stroke={IC} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 10.5H11.8" stroke={IC} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="3" y="15" width="12" height="2" rx="0.5" fill="#000" />
    </svg>
  );
}

function HighlightColorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M10.5 2L4 10L5.5 14L8 14.5L14.5 6.5L10.5 2Z" stroke={IC} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M4 10L5.5 14" stroke={IC} strokeWidth="1.2" strokeLinecap="round" />
      <rect x="3" y="15" width="12" height="2" rx="0.5" fill="#FBBC04" />
    </svg>
  );
}

function InsertLinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M7.5 10.5L10.5 7.5" stroke={IC} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 12L6.5 13.5C5.4 14.6 3.6 14.6 2.5 13.5C1.4 12.4 1.4 10.6 2.5 9.5L4.5 7.5" stroke={IC} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 6L11.5 4.5C12.6 3.4 14.4 3.4 15.5 4.5C16.6 5.6 16.6 7.4 15.5 8.5L13.5 10.5" stroke={IC} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function AddCommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 3.5H15V12.5H6L3 15.5V3.5Z" stroke={IC} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M9 6.5V10.5" stroke={IC} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7 8.5H11" stroke={IC} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function InsertImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="3.5" width="13" height="11" rx="1" stroke={IC} strokeWidth="1.2" />
      <circle cx="6" cy="7" r="1.5" stroke={IC} strokeWidth="1" />
      <path d="M2.5 12.5L6 9L8.5 11.5L11.5 8L15.5 12.5" stroke={IC} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 4H15M3 7.5H11M3 11H15M3 14.5H11" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 4H15M5 7.5H13M3 11H15M5 14.5H13" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 4H15M7 7.5H15M3 11H15M7 14.5H15" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function AlignJustifyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 4H15M3 7.5H15M3 11H15M3 14.5H15" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LineSpacingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M7 4H15M7 9H15M7 14H15" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 6L2.5 4L4 2" stroke={IC} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 12L2.5 14L4 16" stroke={IC} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 4V14" stroke={IC} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2.5 4.5L4 6L6.5 3" stroke={IC} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 4.5H16" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.5 10.5L4 12L6.5 9" stroke={IC} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10.5H16" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BulletedListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="3.5" cy="5" r="1.2" fill={IC} />
      <circle cx="3.5" cy="9.5" r="1.2" fill={IC} />
      <circle cx="3.5" cy="14" r="1.2" fill={IC} />
      <path d="M7 5H15.5M7 9.5H15.5M7 14H15.5" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <text x="2" y="6.5" fontSize="6" fill={IC} fontFamily="Arial" fontWeight="500">1.</text>
      <text x="2" y="11.5" fontSize="6" fill={IC} fontFamily="Arial" fontWeight="500">2.</text>
      <text x="2" y="16" fontSize="6" fill={IC} fontFamily="Arial" fontWeight="500">3.</text>
      <path d="M7.5 5H15.5M7.5 9.5H15.5M7.5 14H15.5" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function DecreaseIndentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 3.5H15M8 7.5H15M8 11.5H15M3 15.5H15" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5.5 8L3 9.5L5.5 11" stroke={IC} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IncreaseIndentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 3.5H15M8 7.5H15M8 11.5H15M3 15.5H15" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 8L5.5 9.5L3 11" stroke={IC} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClearFormattingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3.5 3H14.5" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 3V9" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.5 15L9 9" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 14L15 4" stroke="#c5221f" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 5H8" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 2V8M2 5H8" stroke={IC} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Main Component ─── */

export function GoogleDocsToolbar() {
  return (
    <div className="bg-[#edf2fa] border-b border-[#dadce0] px-2 py-1 flex items-center gap-0.5 flex-shrink-0 overflow-x-auto">
      {/* 1. History: Undo, Redo, Print */}
      <ToolbarButton><UndoIcon /></ToolbarButton>
      <ToolbarButton><RedoIcon /></ToolbarButton>
      <ToolbarButton><PrintIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 2. Spelling */}
      <ToolbarButton><SpellCheckIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 3. Paint format */}
      <ToolbarButton><PaintFormatIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 4. Zoom */}
      <ToolbarDropdown label="100%" />

      <ToolbarSeparator />

      {/* 5. Styles */}
      <ToolbarDropdown label="Normal text" width="108px" />

      <ToolbarSeparator />

      {/* 6. Font */}
      <ToolbarDropdown label="Arial" width="96px" />

      <ToolbarSeparator />

      {/* 7. Font size */}
      <ToolbarButton className="w-6 h-6"><MinusIcon /></ToolbarButton>
      <div className="px-1.5 py-0.5 rounded text-[12px] text-[#444746] bg-white border border-[#c4c7c5] select-none w-8 text-center cursor-default">11</div>
      <ToolbarButton className="w-6 h-6"><PlusIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 8. Format: B, I, U, text color, highlight */}
      <ToolbarButton><BoldIcon /></ToolbarButton>
      <ToolbarButton><ItalicIcon /></ToolbarButton>
      <ToolbarButton><UnderlineIcon /></ToolbarButton>
      <ToolbarButton><TextColorIcon /></ToolbarButton>
      <ToolbarButton><HighlightColorIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 9. Link */}
      <ToolbarButton><InsertLinkIcon /></ToolbarButton>

      {/* 10. Comment */}
      <ToolbarButton><AddCommentIcon /></ToolbarButton>

      {/* 11. Image */}
      <ToolbarButton><InsertImageIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 12. Alignment */}
      <ToolbarButton><AlignLeftIcon /></ToolbarButton>
      <ToolbarButton><AlignCenterIcon /></ToolbarButton>
      <ToolbarButton><AlignRightIcon /></ToolbarButton>
      <ToolbarButton><AlignJustifyIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 13. Spacing */}
      <ToolbarButton><LineSpacingIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 14. Lists */}
      <ToolbarButton><ChecklistIcon /></ToolbarButton>
      <ToolbarButton><BulletedListIcon /></ToolbarButton>
      <ToolbarButton><NumberedListIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 15. Indent */}
      <ToolbarButton><DecreaseIndentIcon /></ToolbarButton>
      <ToolbarButton><IncreaseIndentIcon /></ToolbarButton>

      <ToolbarSeparator />

      {/* 16. Clear formatting */}
      <ToolbarButton><ClearFormattingIcon /></ToolbarButton>
    </div>
  );
}
