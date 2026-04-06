"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

/**
 * Get current user from DB (auto-create if not exists)
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  // Auto-create user (IMPORTANT FIX)
  if (!user) {
    const clerkUser = await currentUser();

    user = await db.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
        name: clerkUser?.firstName || "",
        imageUrl: clerkUser?.imageUrl || "",
      },
    });
  }

  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Update user profile + industry insights
 */
export async function updateUser(data) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const result = await db.$transaction(async (tx) => {
      let industryInsight = await tx.industryInsight.findUnique({
        where: {
          industry: data.industry,
        },
      });

      if (!industryInsight) {
        const insights = await generateAIInsights(data.industry);

        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      const updatedUser = await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          industry: data.industry,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      });

      return updatedUser;
    });

    revalidatePath("/");
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update profile");
  }
}

/**
 * Check onboarding status
 */
export async function getUserOnboardingStatus() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    return {
      isOnboarded: !!user.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
