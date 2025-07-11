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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader, Plus, X, Save } from 'lucide-react';
import Navigation from '@/components/Navigation';

const beliefCardSchema = z.object({
  previous_belief: z.string().min(10, 'Previous belief must be at least 10 characters'),
  current_belief: z.string().min(10, 'Current belief must be at least 10 characters'),
  explanation: z.string().max(500, 'Explanation must be less than 500 characters').optional(),
  date_changed: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type BeliefCardData = z.infer<typeof beliefCardSchema>;

const CreateBeliefCard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const form = useForm<BeliefCardData>({
    resolver: zodResolver(beliefCardSchema),
    defaultValues: {
      previous_belief: '',
      current_belief: '',
      explanation: '',
      date_changed: new Date().toISOString().split('T')[0],
      tags: [],
    },
  });

  const onSubmit = async (data: BeliefCardData) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('belief_cards')
        .insert({
          user_id: user.id,
          previous_belief: data.previous_belief,
          current_belief: data.current_belief,
          explanation: data.explanation || null,
          date_changed: data.date_changed || null,
          tags: data.tags || [],
        });

      if (error) throw error;

      toast({
        title: "Belief card created!",
        description: "Your belief evolution has been recorded.",
      });

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Failed to create belief card",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags') || [];
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()]);
        setNewTag('');
      }
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(t => t !== tag));
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
            <CardTitle>Create a Belief Card</CardTitle>
            <CardDescription>
              Track how your beliefs have evolved over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="previous_belief"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I used to believe...</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what you used to believe" 
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
                  name="current_belief"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Now I believe...</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what you believe now" 
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
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What changed your mind? (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share what led to this change in belief..." 
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
                  name="date_changed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>When did this change happen?</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(form.watch('tags') || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 p-0 h-auto"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag (e.g., Politics, Health, Relationships)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                  variant="warm"
                >
                  {submitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Create Belief Card
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateBeliefCard;