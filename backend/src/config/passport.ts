import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Récupérer l'email (peut être null si privé)
        let email = profile.emails?.[0]?.value;

          if (!email) {
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `token ${accessToken}`,
                Accept: "application/vnd.github+json",
              },
            });

            // 🔥 CAST propre pour éviter l'erreur TS
            const emails = (await emailsResponse.json()) as {
              email: string;
              primary: boolean;
            }[];

            email = emails.find((e) => e.primary)?.email || emails[0]?.email;
          }

          if (!email) {
            return done(new Error("Impossible de récupérer un email GitHub."));
          }


        // Chercher l'utilisateur par email ou githubId
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { githubId: profile.id }
            ]
          }
        });

        if (!user) {
          // Créer un nouveau compte
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.username || email.split('@')[0],
              password: '', // Pas de mot de passe pour OAuth
              githubId: profile.id,
            },
          });
        } else if (!user.githubId) {
          // Lier GitHub à un compte existant
          user = await prisma.user.update({
            where: { id: user.id },
            data: { githubId: profile.id },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Erreur OAuth GitHub:', error);
        return done(error);
      }
    }
  )
);

export default passport;