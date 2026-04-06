import { interviewCovers, mappings } from "@/constants";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech) => {
  if (!tech) return null;

  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");

  return mappings[key] || key; // fallback if mapping not found
};

const checkIconExists = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray = []) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);

    return {
      tech,
      url: normalized
        ? `${techIconBaseURL}/${normalized}/${normalized}-original.svg`
        : "/tech.svg",
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => {
      const exists = await checkIconExists(url);

      return {
        tech,
        url: exists ? url : "/tech.svg",
      };
    }),
  );

  return results;
};

export const getRandomInterviewCover = () => {
  if (!interviewCovers?.length) return "/covers/default.png";

  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};
