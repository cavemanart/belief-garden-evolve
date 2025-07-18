import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader, Save, Flame } from 'lucide-react';
import Navigation from '@/components/Navigation';
import TagSelector from '@/components/TagSelector';

const hotTakeSchema = z.object({
  statement: z.string().min(10, 'Statement must be at least 10 characters').max(500, 'Statement must be less than 500 characters'),
  tags: z.array(z.string()).optional(),
});

type HotTakeData = z.infer<typeof hotTakeSchema>;

const CreateHotTake = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const form = useForm<HotTakeData>({
    resolver: zodResolver(hotTakeSchema),
    defaultValues: {
      statement: '',
      tags: [],
    },
  });

  const onSubmit = async (data: HotTakeData) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('hot_takes')
        .insert({
          user_id: user.id,
          statement: data.statement,
          tags: data.tags || [],
        });

      if (error) throw error;

      toast({
        title: "Hot take posted!",
        description: "Your provocative statement is now live.",
      });

      navigate('/feed');
    } catch (error: any) {
      toast({
        title: "Failed to post hot take",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-2xl mx-auto p-6 pt-24">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Create a Hot Take
            </CardTitle>
            <CardDescription>
              Share a bold, provocative statement that will spark discussion and debate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Hot Take</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your bold, controversial, or thought-provoking opinion..." 
                          className="min-h-32 text-lg"
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground text-right">
                        {field.value?.length || 0}/500 characters
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Tags</FormLabel>
                  <TagSelector
                    selectedTags={form.watch('tags') || []}
                    onTagsChange={(tags) => form.setValue('tags', tags)}
                    placeholder="Add tags to help categorize your hot take..."
                    maxTags={5}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                  variant="warm"
                >
                  {submitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  <Flame className="w-4 h-4 mr-2" />
                  Post Hot Take
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateHotTake;