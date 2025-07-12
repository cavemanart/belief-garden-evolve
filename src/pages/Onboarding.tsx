import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import TagSelector from '@/components/TagSelector';

const onboardingSchema = z.object({
  display_name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  bio: z.string().max(300, 'Bio must be less than 300 characters').optional(),
  belief_areas: z.array(z.string()).min(1, 'Please select at least one topic'),
  avatar_url: z.string().optional(),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completing, setCompleting] = useState(false);

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      display_name: '',
      bio: '',
      belief_areas: [],
      avatar_url: '',
    },
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    // If user already completed onboarding, redirect to home
    if (profile?.profile_completed) {
      navigate('/');
    }
  }, [user, authLoading, profile, navigate]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingData) => {
    if (!user) return;

    setCompleting(true);
    
    try {
      await updateProfile({
        ...data,
        profile_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      });
      
      navigate('/');
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    } finally {
      setCompleting(false);
    }
  };

  const canProceed = () => {
    const values = form.getValues();
    switch (currentStep) {
      case 1:
        return values.display_name?.trim().length > 0;
      case 2:
        return true; // Bio is optional
      case 3:
        return values.belief_areas?.length > 0;
      case 4:
        return true; // Photo is optional
      default:
        return false;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-medium">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="w-full" />
          <CardTitle className="text-2xl">Welcome to the platform!</CardTitle>
          <CardDescription>
            Let's set up your profile so you can start sharing your thoughts and beliefs
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Name/Handle */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">What should we call you?</h3>
                    <p className="text-muted-foreground">This will be your public display name</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your name or handle"
                            className="text-center text-lg"
                            autoFocus
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Bio */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Tell us about yourself</h3>
                    <p className="text-muted-foreground">Share a brief bio (optional)</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What's your story? What drives your thinking and writing?"
                            className="min-h-24 resize-none"
                            maxLength={300}
                            autoFocus
                            {...field} 
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground text-right">
                          {field.value?.length || 0}/300
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Topics */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">What topics do you explore?</h3>
                    <p className="text-muted-foreground">Select areas you're interested in writing about</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="belief_areas"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TagSelector
                            selectedTags={field.value || []}
                            onTagsChange={field.onChange}
                            placeholder="Search or add topics..."
                            maxTags={8}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Profile Photo */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Add a profile photo</h3>
                    <p className="text-muted-foreground">Help others recognize you (optional)</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ProfilePhotoUpload
                            currentPhotoUrl={field.value}
                            onPhotoUpdate={field.onChange}
                            userId={user.id}
                            displayName={form.watch('display_name')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={completing || !canProceed()}
                  >
                    {completing ? (
                      'Completing...'
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;