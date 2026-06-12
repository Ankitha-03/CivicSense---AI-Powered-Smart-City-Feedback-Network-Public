export const CATEGORIES = [
  { value: "infrastructure", label: "Infrastructure", description: "Roads, bridges, sidewalks, public buildings" },
  { value: "sanitation", label: "Sanitation", description: "Garbage collection, waste management, cleanliness" },
  { value: "public_safety", label: "Public Safety", description: "Street lighting, traffic signals, security concerns" },
  { value: "utilities", label: "Utilities", description: "Water supply, electricity, gas, telecommunications" },
  { value: "transportation", label: "Transportation", description: "Public transit, parking, traffic management" },
  { value: "environment", label: "Environment", description: "Parks, trees, pollution, noise complaints" },
];

export const SEVERITIES = [
  { value: "minor",    label: "Minor",    description: "Cosmetic issues, minor inconveniences",              examples: "Faded paint · Minor litter · Small cracks",             color: "bg-gray-100 text-gray-700 border-gray-300"    },
  { value: "medium",   label: "Medium",   description: "Moderate issues affecting daily use",                examples: "Potholes · Broken benches · Overgrown vegetation",     color: "bg-yellow-50 text-yellow-700 border-yellow-300" },
  { value: "high",     label: "High",     description: "Significant problems requiring prompt attention",    examples: "Damaged sidewalks · Malfunctioning traffic lights",     color: "bg-orange-50 text-orange-700 border-orange-300" },
  { value: "critical", label: "Critical", description: "Urgent safety hazards needing immediate action",     examples: "Exposed wires · Structural damage · Hazardous spills",  color: "bg-red-50 text-red-700 border-red-300"         },
];

export const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export const API_BASE = "http://127.0.0.1:8000/api/";
