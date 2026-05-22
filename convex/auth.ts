import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";

const PasswordWithName = Password({
  profile(params) {
    const email = params.email as string;
    const rawName = (params.name as string | undefined)?.trim() ?? "";
    if (!email) throw new Error("Email is required");
    const profile: { email: string; name?: string; provider: string } = {
      email,
      provider: "password",
    };
    if (rawName.length > 0) profile.name = rawName;
    return profile;
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [PasswordWithName, Anonymous],
});
