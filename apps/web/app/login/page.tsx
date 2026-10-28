import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { signIn } from '@/lib/auth';
import { githubSignIn } from '@/lib/github';

export default function LoginPage() {
  // Until a GitHub OAuth App is connected (lib/github.ts) there is no sign-in
  // to offer: say how to connect one instead of a button that cannot work.
  const connected = githubSignIn() !== null;

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            This demo uses GitHub for authentication.
          </CardDescription>
        </CardHeader>
        {connected ? (
          <CardFooter>
            <form
              action={async () => {
                'use server';
                await signIn('github', {
                  redirectTo: '/'
                });
              }}
              className="w-full"
            >
              <Button className="w-full">Sign in with GitHub</Button>
            </form>
          </CardFooter>
        ) : (
          <>
            <CardContent data-github-sign-in="not-connected">
              <p className="text-sm text-muted-foreground">
                GitHub sign-in is not connected yet. Create a GitHub OAuth App
                whose callback URL is this site&apos;s{' '}
                <code>/api/auth/callback/github</code>, store its client id and
                secret as <code>AUTH_GITHUB_ID</code> and{' '}
                <code>AUTH_GITHUB_SECRET</code>, and redeploy — the
                site&apos;s README, &ldquo;Connecting GitHub sign-in&rdquo;,
                has the steps.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                Sign in with GitHub
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
