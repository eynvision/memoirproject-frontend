import { MemoryItem } from "../types";

export const mockMemories: MemoryItem[] = [
  {
    id: "mem-1",
    kind: "photo",
    title: "The Storefront",
    content: "Found this old Polaroid of him standing outside the original storefront in 1982. The sign was still missing the 'S' at the end.",
    date: "OCT 12, 1982",
    author: "Ahmad",
    mediaUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "mem-2",
    kind: "combined",
    title: "Afternoon Baking",
    content: "He finally told me the secret to the sourdough starter while humming an old tune.",
    date: "NOV 04, 1985",
    author: "Sarah",
    mediaUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
    transcription: "He finally told me the secret to the sourdough starter while humming an old tune."
  },
  {
    id: "mem-3",
    kind: "audio",
    title: "4 AM Starts",
    content: "He used to wake up at 4 AM to start the ovens. I remember the smell of the yeast hitting the street before the sun was even up.",
    date: "OCT 14, 2023",
    author: "Uncle Tariq",
    duration: "01:24",
    transcription: "He used to wake up at four AM to start the ovens. I remember the smell of the yeast hitting the street before the sun was even up."
  },
  {
    id: "mem-4",
    kind: "text",
    title: "Sunday Porch Conversations",
    content: "Every Sunday afternoon he would sit on the wooden rocking chair with his radio tuned to the old broadcast. He never said much, but his presence was enough.",
    date: "NOV 02, 2023",
    author: "Sarah"
  }
];

export const contributorNames = [
  { name: "Sarah", top: "25%", left: "20%", size: "text-4xl", scale: 1.1, blur: "blur-0" },
  { name: "Jasra", top: "60%", left: "75%", size: "text-5xl", scale: 1.2, blur: "blur-0" },
  { name: "Ahmad", top: "45%", left: "30%", size: "text-6xl", scale: 1.3, blur: "blur-0" },
  { name: "Uncle Tariq", top: "80%", left: "50%", size: "text-3xl", scale: 0.95, blur: "blur-[1px]" },
  { name: "Aunt Salma", top: "30%", left: "65%", size: "text-4xl", scale: 1, blur: "blur-0" },
  { name: "Daniel", top: "65%", left: "12%", size: "text-3xl", scale: 0.9, blur: "blur-[1px]" },
  { name: "Elena", top: "15%", left: "45%", size: "text-2xl", scale: 0.85, blur: "blur-[2px]" }
];