import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type SignUpData = z.infer<typeof signUpSchema>;
type SignInData = z.infer<typeof signInSchema>;
type ResetData = z.infer<typeof resetSchema>;

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [loading, setLoading] = useState(false);
  const { user, signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
    },
  });

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const resetForm = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSignUp = async (data: SignUpData) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.displayName);
    setLoading(false);
    
    if (!error) {
      signUpForm.reset();
    }
  };

  const onSignIn = async (data: SignInData) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    
    if (!error) {
      navigate('/');
    }
  };

  const onReset = async (data: ResetData) => {
    setLoading(true);
    const { error } = await resetPassword(data.email);
    setLoading(false);
    
    if (!error) {
      resetForm.reset();
      setMode('signin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center">
          <div className="text-2xl font-bold text-primary font-interface mb-2">
            Unthink
          </div>
          <CardTitle>
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Join Unthink'}
            {mode === 'reset' && 'Reset password'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' && 'Sign in to continue your thinking journey'}
            {mode === 'signup' && 'Start exploring how your beliefs evolve'}
            {mode === 'reset' && 'Enter your email to receive a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === 'signup' && (
            <Form {...signUpForm}>
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <FormField
                  control={signUpForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="How should we call you?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="At least 6 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </Form>
          )}

          {mode === 'signin' && (
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
          )}

          {mode === 'reset' && (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center space-y-2">
            {mode === 'signin' && (
              <>
                <Button
                  variant="link"
                  onClick={() => setMode('signup')}
                  className="text-sm text-muted-foreground"
                >
                  Don't have an account? Sign up
                </Button>
                <br />
                <Button
                  variant="link"
                  onClick={() => setMode('reset')}
                  className="text-sm text-muted-foreground"
                >
                  Forgot your password?
                </Button>
              </>
            )}
            {mode === 'signup' && (
              <Button
                variant="link"
                onClick={() => setMode('signin')}
                className="text-sm text-muted-foreground"
              >
                Already have an account? Sign in
              </Button>
            )}
            {mode === 'reset' && (
              <Button
                variant="link"
                onClick={() => setMode('signin')}
                className="text-sm text-muted-foreground"
              >
                Back to sign in
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;