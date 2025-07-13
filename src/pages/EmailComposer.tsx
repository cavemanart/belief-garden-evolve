import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Send, Eye, Users, Clock, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';

const EmailComposer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [audienceType, setAudienceType] = useState('free');
  const [sendType, setSendType] = useState('instant');
  
  // Mock post data - in real app this would come from the URL params
  const postData = {
    title: "The Art of Changing Your Mind",
    excerpt: "Exploring how our beliefs evolve and why intellectual humility is the key to growth...",
    content: "In a world where certainty is often prized above all else, there's something profoundly liberating about admitting we might be wrong...",
    tags: ["Philosophy", "Growth", "Thinking"],
    createdAt: "2024-01-15"
  };

  const subscriberCounts = {
    free: 1247,
    paid: 89,
    all: 1336
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto p-6 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Send to Newsletter</h1>
            <p className="text-muted-foreground">Share your post with your subscribers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Email Settings */}
          <div className="space-y-6">
            {/* Audience Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Choose Audience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={audienceType} onValueChange={setAudienceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      Free Subscribers Only ({subscriberCounts.free})
                    </SelectItem>
                    <SelectItem value="paid">
                      Paid Subscribers Only ({subscriberCounts.paid})
                    </SelectItem>
                    <SelectItem value="all">
                      All Subscribers ({subscriberCounts.all})
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="text-sm text-muted-foreground">
                  {audienceType === 'free' && 'This post will be sent to all free newsletter subscribers.'}
                  {audienceType === 'paid' && 'This post will only be sent to paid subscribers.'}
                  {audienceType === 'all' && 'This post will be sent to all your subscribers.'}
                </div>
              </CardContent>
            </Card>

            {/* Send Timing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  When to Send
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={sendType} onValueChange={setSendType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Send Now</SelectItem>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  </SelectContent>
                </Select>
                
                {sendType === 'scheduled' && (
                  <div className="space-y-2">
                    <input
                      type="datetime-local"
                      className="w-full p-2 border rounded-md"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Best times: Tuesday-Thursday, 9-11 AM in your audience's timezone
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Send className="w-4 h-4 mr-2" />
                {sendType === 'instant' ? 'Send Newsletter Now' : 'Schedule Newsletter'}
              </Button>
              
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Send Test Email
              </Button>
            </div>
          </div>

          {/* Right: Email Preview */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Email Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="inbox" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="inbox">Inbox View</TabsTrigger>
                    <TabsTrigger value="full">Full Email</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="inbox" className="mt-4">
                    {/* Inbox Preview */}
                    <div className="border rounded-lg p-4 bg-white text-black">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user?.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Your Newsletter</div>
                          <div className="text-xs text-gray-600">to me</div>
                        </div>
                        <div className="text-xs text-gray-500">now</div>
                      </div>
                      <div className="font-medium text-base mb-1">{postData.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{postData.excerpt}</div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="full" className="mt-4">
                    {/* Full Email Preview */}
                    <div className="border rounded-lg p-6 bg-white text-black max-h-96 overflow-y-auto">
                      <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-2">{postData.title}</h1>
                        <div className="flex justify-center gap-2 mb-4">
                          {postData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(postData.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div className="prose prose-sm max-w-none mb-8">
                        <p className="text-gray-800 leading-relaxed">{postData.content}</p>
                      </div>
                      
                      {/* Email Footer */}
                      <div className="border-t pt-6 mt-8 text-center text-sm text-gray-600">
                        <div className="space-y-3">
                          <div className="flex justify-center gap-4">
                            <a href="#" className="text-primary hover:underline">
                              View Online
                            </a>
                            <span className="text-gray-400">•</span>
                            <a href="#" className="text-primary hover:underline">
                              Subscribe
                            </a>
                            <span className="text-gray-400">•</span>
                            <a href="#" className="text-primary hover:underline">
                              Share
                            </a>
                          </div>
                          <div>
                            You're receiving this because you subscribed to our newsletter.
                          </div>
                          <div className="text-xs text-gray-500">
                            <a href="#" className="hover:underline">Unsubscribe</a> | 
                            <a href="#" className="hover:underline ml-1">Update preferences</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;