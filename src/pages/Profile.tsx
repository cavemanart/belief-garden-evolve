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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Loader, Plus, X } from 'lucide-react';
import Navigation from '@/components/Navigation';

const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  belief_areas: z.array(z.string()).optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [newTag, setNewTag] = useState('');
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
    },
  });

  const onSubmit = async (data: ProfileData) => {
    setUpdating(true);
    await updateProfile(data);
    setUpdating(false);
  };

  const addBeliefArea = () => {
    if (newTag.trim()) {
      const currentAreas = form.getValues('belief_areas') || [];
      if (!currentAreas.includes(newTag.trim())) {
        form.setValue('belief_areas', [...currentAreas, newTag.trim()]);
        setNewTag('');
      }
    }
  };

  const removeBeliefArea = (tag: string) => {
    const currentAreas = form.getValues('belief_areas') || [];
    form.setValue('belief_areas', currentAreas.filter(area => area !== tag));
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
            <div className="flex justify-center mb-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-lg font-semibold bg-accent text-accent-foreground">
                  {profile?.display_name ? getInitials(profile.display_name) : 'UN'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Share who you are and what beliefs you're exploring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                <div className="space-y-3">
                  <FormLabel>Belief Areas</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(form.watch('belief_areas') || []).map((area) => (
                      <Badge key={area} variant="secondary" className="text-sm">
                        {area}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 p-0 h-auto"
                          onClick={() => removeBeliefArea(area)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a belief area (e.g., AI, Parenting, Spirituality)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addBeliefArea();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addBeliefArea}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

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