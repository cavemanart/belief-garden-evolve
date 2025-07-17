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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader, Save, Eye, Mail, DollarSign, FileText, MessageSquare, Sparkles } from 'lucide-react';
import Navigation from '@/components/Navigation';
import TagSelector from '@/components/TagSelector';

const essaySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(10, 'Content is required'),
  tldr: z.string().max(300, 'TL;DR must be less than 300 characters').optional(),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  tags: z.array(z.string()).optional(),
  post_type: z.enum(['long-form', 'short-insight']),
  email_subscribers: z.boolean().optional(),
  paid_only: z.boolean().optional(),
});

type EssayData = z.infer<typeof essaySchema>;

const WriteEssay = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('write');

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
      excerpt: '',
      tags: [],
      post_type: 'long-form',
      email_subscribers: false,
      paid_only: false,
    },
  });

  const postType = form.watch('post_type');
  const formData = form.watch();

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
          excerpt: data.excerpt || null,
          tags: data.tags || [],
          post_type: data.post_type,
          email_subscribers: data.email_subscribers || false,
          paid_only: data.paid_only || false,
          published,
        });

      if (error) throw error;

      toast({
        title: published ? "Post published!" : "Draft saved!",
        description: published 
          ? "Your post is now live and visible to everyone."
          : "Your draft has been saved. You can publish it later.",
      });

      if (published) {
        navigate('/feed');
      } else {
        // Don't reset form for drafts, allow continuing to work
        toast({
          title: "Auto-saved",
          description: "Your work is automatically saved as you write.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to save post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPreviewContent = () => {
    if (postType === 'short-insight') {
      return (
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-4">{formData.title || 'Untitled'}</h1>
          {formData.excerpt && (
            <div className="text-lg text-muted-foreground mb-6 italic">
              {formData.excerpt}
            </div>
          )}
          <div className="whitespace-pre-wrap leading-relaxed">
            {formData.content || 'Start writing your insight...'}
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-4">{formData.title || 'Untitled'}</h1>
        {formData.tldr && (
          <div className="bg-muted p-4 rounded-lg mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              TL;DR
            </h3>
            <p className="text-base">{formData.tldr}</p>
          </div>
        )}
        <div className="whitespace-pre-wrap leading-relaxed">
          {formData.content || 'Start writing your article...'}
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span key={tag} className="bg-accent text-accent-foreground px-2 py-1 rounded-md text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
      <div className="max-w-5xl mx-auto p-6 pt-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="write" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Write
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={form.handleSubmit((data) => onSubmit(data, false))}
                disabled={submitting}
                size="sm"
              >
                {submitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={form.handleSubmit((data) => onSubmit(data, true))}
                disabled={submitting}
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {submitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                <Sparkles className="w-4 h-4 mr-2" />
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/email-composer')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Newsletter
              </Button>
            </div>
          </div>

          <TabsContent value="write" className="space-y-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Editor */}
              <div className="lg:col-span-3">
                <Card className="shadow-medium border-0">
                  <CardContent className="p-8">
                    <Form {...form}>
                      <form className="space-y-8">
                        {/* Post Type Selection */}
                        <div className="flex gap-4 p-1 bg-muted rounded-lg">
                          <Button
                            type="button"
                            variant={postType === 'long-form' ? 'default' : 'ghost'}
                            onClick={() => form.setValue('post_type', 'long-form')}
                            className="flex-1 gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Long-form Article
                          </Button>
                          <Button
                            type="button"
                            variant={postType === 'short-insight' ? 'default' : 'ghost'}
                            onClick={() => form.setValue('post_type', 'short-insight')}
                            className="flex-1 gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Short Insight
                          </Button>
                        </div>

                        {/* Title */}
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  placeholder={postType === 'long-form' ? "What's your article about?" : "Share your insight..."} 
                                  className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* TL;DR for long-form */}
                        {postType === 'long-form' && (
                          <FormField
                            control={form.control}
                            name="tldr"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-muted-foreground">
                                  TL;DR (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Summarize your main point in a few sentences..." 
                                    className="min-h-20 border-0 px-0 focus-visible:ring-0 bg-muted/30 rounded-lg p-4"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Excerpt for short insights */}
                        {postType === 'short-insight' && (
                          <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-muted-foreground">
                                  Subtitle (Optional)
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Add a subtitle or context..." 
                                    className="border-0 px-0 focus-visible:ring-0 italic text-muted-foreground"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <Separator />

                        {/* Content */}
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder={
                                    postType === 'long-form' 
                                      ? "Tell your story. Share your thoughts, experiences, and reflections..." 
                                      : "Share your insight in 1-2 paragraphs..."
                                  }
                                  className={`border-0 px-0 focus-visible:ring-0 resize-none leading-relaxed text-lg ${
                                    postType === 'long-form' ? 'min-h-96' : 'min-h-32'
                                  }`}
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publishing Options */}
                <Card className="shadow-medium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Publishing Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Send to Email Subscribers</span>
                      </div>
                      <Switch
                        checked={form.watch('email_subscribers') || false}
                        onCheckedChange={(checked) => form.setValue('email_subscribers', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Paid Subscribers Only</span>
                      </div>
                      <Switch
                        checked={form.watch('paid_only') || false}
                        onCheckedChange={(checked) => form.setValue('paid_only', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card className="shadow-medium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tags</CardTitle>
                    <CardDescription className="text-xs">
                      Help readers find your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TagSelector
                      selectedTags={form.watch('tags') || []}
                      onTagsChange={(tags) => form.setValue('tags', tags)}
                      placeholder="Add tags..."
                      maxTags={5}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-0">
            <Card className="shadow-medium border-0">
              <CardContent className="p-8 lg:p-12">
                {getPreviewContent()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WriteEssay;