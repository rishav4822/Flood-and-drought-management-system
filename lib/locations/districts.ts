import { DistrictSeed } from "@/lib/types";

export const districts: DistrictSeed[] = [
  { slug: "kolkata-wb", name: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639, tags: ["flood", "heat"] },
  { slug: "mumbai-mh", name: "Mumbai", state: "Maharashtra", lat: 19.076, lon: 72.8777, tags: ["flood"] },
  { slug: "patna-br", name: "Patna", state: "Bihar", lat: 25.5941, lon: 85.1376, tags: ["flood"] },
  { slug: "guwahati-as", name: "Guwahati", state: "Assam", lat: 26.1445, lon: 91.7362, tags: ["flood"] },
  { slug: "kochi-kl", name: "Kochi", state: "Kerala", lat: 9.9312, lon: 76.2673, tags: ["flood"] },
  { slug: "bhubaneswar-od", name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lon: 85.8245, tags: ["flood", "heat"] },
  { slug: "chennai-tn", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, tags: ["flood", "heat"] },
  { slug: "surat-gj", name: "Surat", state: "Gujarat", lat: 21.1702, lon: 72.8311, tags: ["flood"] },

  { slug: "aurangabad-mh", name: "Chhatrapati Sambhajinagar (Marathwada)", state: "Maharashtra", lat: 19.8762, lon: 75.3433, tags: ["drought"] },
  { slug: "nagpur-mh", name: "Nagpur (Vidarbha)", state: "Maharashtra", lat: 21.1458, lon: 79.0882, tags: ["drought", "heat"] },
  { slug: "jhansi-up", name: "Jhansi (Bundelkhand)", state: "Uttar Pradesh", lat: 25.4484, lon: 78.5685, tags: ["drought", "heat"] },
  { slug: "latur-mh", name: "Latur", state: "Maharashtra", lat: 18.4088, lon: 76.5604, tags: ["drought"] },
  { slug: "anantapur-ap", name: "Anantapur", state: "Andhra Pradesh", lat: 14.6819, lon: 77.6006, tags: ["drought", "heat"] },
  { slug: "kutch-gj", name: "Bhuj (Kutch)", state: "Gujarat", lat: 23.242, lon: 69.6669, tags: ["drought", "heat"] },

  { slug: "delhi", name: "Delhi", state: "Delhi", lat: 28.7041, lon: 77.1025, tags: ["heat"] },
  { slug: "ahmedabad-gj", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714, tags: ["heat"] },
  { slug: "jodhpur-rj", name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lon: 73.0243, tags: ["heat", "drought"] },
  { slug: "prayagraj-up", name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lon: 81.8463, tags: ["heat", "flood"] },
];

export function findDistrict(slug: string): DistrictSeed | undefined {
  return districts.find((d) => d.slug === slug);
}
