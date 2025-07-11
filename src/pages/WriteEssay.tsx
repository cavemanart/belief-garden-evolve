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
import { Loader, Plus, X, Save, Eye } from 'lucide-react';
import Navigation from '@/components/Navigation';

const essaySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  tldr: z.string().max(300, 'TL;DR must be less than 300 characters').optional(),
  tags: z.array(z.string()).optional(),
});

type EssayData = z.infer<typeof essaySchema>;

const WriteEssay = () => {
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

  const form = useForm<EssayData>({
    resolver: zodResolver(essaySchema),
    defaultValues: {
      title: '',
      content: '',
      tldr: '',
      tags: [],
    },
  });

  const onSubmit = async (data: EssayData, published: boolean = false) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('essays')
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          tldr: data.tldr || null,
          tags: data.tags || [],
          published,
        });

      if (error) throw error;

      toast({
        title: published ? "Essay published!" : "Draft saved!",
        description: published 
          ? "Your essay is now live and visible to everyone."
          : "Your draft has been saved. You can publish it later.",
      });

      if (published) {
        navigate('/');
      } else {
        form.reset();
      }
    } catch (error: any) {
      toast({
        title: "Failed to save essay",
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
      <div className="max-w-4xl mx-auto p-6 pt-24">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Write Your Essay</CardTitle>
            <CardDescription>
              Share your thoughts and explore how your beliefs have evolved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="What's on your mind?" 
                          className="text-lg"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tldr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TL;DR (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Summarize your main point in a few sentences..." 
                          className="min-h-16"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your thoughts, experiences, and reflections..." 
                          className="min-h-80"
                          {...field} 
                        />
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
                      placeholder="Add a tag (e.g., AI, Philosophy, Personal Growth)"
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

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={form.handleSubmit((data) => onSubmit(data, false))}
                    disabled={submitting}
                  >
                    {submitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    variant="warm"
                    onClick={form.handleSubmit((data) => onSubmit(data, true))}
                    disabled={submitting}
                  >
                    {submitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    <Eye className="w-4 h-4 mr-2" />
                    Publish Essay
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WriteEssay;