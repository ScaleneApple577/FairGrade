const BANNER_COLORS = [
  '#1967d2', // blue
  '#137333', // green
  '#8430ce', // purple
  '#e8710a', // orange
  '#0d7377', // teal
  '#c5221f', // red
  '#795548', // brown
  '#1e8e3e', // emerald
];

export function getClassroomColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BANNER_COLORS[Math.abs(hash) % BANNER_COLORS.length];
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}
