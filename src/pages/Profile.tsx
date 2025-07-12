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
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Loader } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import TagSelector from '@/components/TagSelector';

const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  belief_areas: z.array(z.string()).optional(),
  avatar_url: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    values: {
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      belief_areas: profile?.belief_areas || [],
      avatar_url: profile?.avatar_url || '',
    },
  });

  const onSubmit = async (data: ProfileData) => {
    setUpdating(true);
    await updateProfile(data);
    setUpdating(false);
  };


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto p-6 pt-24">
        <Card className="shadow-medium">
          <CardHeader className="text-center">
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Share who you are and what beliefs you're exploring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Photo */}
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

                <FormField
                  control={form.control}
                  name="display_name"
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
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us a bit about yourself and your thinking journey..." 
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="belief_areas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topics You Write About</FormLabel>
                      <FormControl>
                        <TagSelector
                          selectedTags={field.value || []}
                          onTagsChange={field.onChange}
                          placeholder="Add topics you explore..."
                          maxTags={8}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={updating}>
                  {updating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Save Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;