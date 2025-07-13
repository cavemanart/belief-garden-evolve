import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Settings, 
  Shield,
  ArrowLeft,
  ExternalLink,
  Gift
} from 'lucide-react';
import Navigation from '@/components/Navigation';

const PaymentSettings = () => {
  const navigate = useNavigate();
  const [stripeConnected, setStripeConnected] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState('5');
  const [yearlyPrice, setYearlyPrice] = useState('50');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(true);
  const [freeTrialDays, setFreeTrialDays] = useState('7');
  const [supporterTierEnabled, setSupporterTierEnabled] = useState(false);
  const [supporterPrice, setSupporterPrice] = useState('20');

  const mockEarnings = {
    thisMonth: 247,
    subscribers: 89,
    totalEarnings: 1240,
    conversionRate: 7.1
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payment Settings</h1>
            <p className="text-muted-foreground">Manage your subscriptions and earnings</p>
          </div>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            {/* Stripe Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Stripe Connection
                </CardTitle>
                <CardDescription>
                  Connect your Stripe account to start accepting payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!stripeConnected ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Connect Stripe Account</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Stripe handles all payment processing securely. You'll need a Stripe account to start earning.
                    </p>
                    <div className="space-y-3">
                      <Button 
                        className="w-full max-w-sm"
                        onClick={() => setStripeConnected(true)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect with Stripe
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Don't have a Stripe account? <a href="#" className="text-primary hover:underline">Create one here</a>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">Stripe Connected</h4>
                        <p className="text-sm text-green-700">Account: stripe_acc_****1234</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Supported Payment Methods</CardTitle>
                <CardDescription>
                  These payment methods will be available to your subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Visa', 'Mastercard', 'Apple Pay', 'Google Pay'].map((method) => (
                    <div key={method} className="p-3 border rounded-lg text-center">
                      <div className="w-8 h-8 bg-muted rounded mx-auto mb-2"></div>
                      <p className="text-sm font-medium">{method}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            {/* Subscription Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Subscription Pricing
                </CardTitle>
                <CardDescription>
                  Set your monthly and yearly subscription prices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthly">Monthly Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="monthly"
                        type="number"
                        value={monthlyPrice}
                        onChange={(e) => setMonthlyPrice(e.target.value)}
                        className="pl-9"
                        placeholder="5"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Billed monthly</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearly">Yearly Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="yearly"
                        type="number"
                        value={yearlyPrice}
                        onChange={(e) => setYearlyPrice(e.target.value)}
                        className="pl-9"
                        placeholder="50"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">Billed yearly</p>
                      <Badge variant="secondary" className="text-xs">17% off</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Free Trial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Free Trial
                </CardTitle>
                <CardDescription>
                  Offer a free trial to convert more subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Free Trial</h4>
                    <p className="text-sm text-muted-foreground">Let new subscribers try your content risk-free</p>
                  </div>
                  <Switch checked={freeTrialEnabled} onCheckedChange={setFreeTrialEnabled} />
                </div>
                
                {freeTrialEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="trial-days">Trial Length (days)</Label>
                    <Input
                      id="trial-days"
                      type="number"
                      value={freeTrialDays}
                      onChange={(e) => setFreeTrialDays(e.target.value)}
                      className="max-w-24"
                      min="1"
                      max="30"
                    />
                    <p className="text-sm text-muted-foreground">Recommended: 7-14 days</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supporter Tier */}
            <Card>
              <CardHeader>
                <CardTitle>Supporter Tier</CardTitle>
                <CardDescription>
                  Add a higher-priced tier for your biggest fans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Supporter Tier</h4>
                    <p className="text-sm text-muted-foreground">Premium tier with exclusive perks</p>
                  </div>
                  <Switch checked={supporterTierEnabled} onCheckedChange={setSupporterTierEnabled} />
                </div>
                
                {supporterTierEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="supporter-price">Monthly Price</Label>
                    <div className="relative max-w-32">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="supporter-price"
                        type="number"
                        value={supporterPrice}
                        onChange={(e) => setSupporterPrice(e.target.value)}
                        className="pl-9"
                        placeholder="20"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button className="w-full">Save Pricing Settings</Button>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">This Month</span>
                  </div>
                  <div className="text-2xl font-bold">${mockEarnings.thisMonth}</div>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Subscribers</span>
                  </div>
                  <div className="text-2xl font-bold">{mockEarnings.subscribers}</div>
                  <p className="text-xs text-blue-600">+5 this week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Earnings</span>
                  </div>
                  <div className="text-2xl font-bold">${mockEarnings.totalEarnings}</div>
                  <p className="text-xs text-muted-foreground">Since you started</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-muted-foreground">Conversion</span>
                  </div>
                  <div className="text-2xl font-bold">{mockEarnings.conversionRate}%</div>
                  <p className="text-xs text-orange-600">Above average</p>
                </CardContent>
              </Card>
            </div>

            {/* Subscriber Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>Your subscriber count over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Free Subscribers</span>
                    <span className="font-medium">1,158</span>
                  </div>
                  <Progress value={93} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Paid Subscribers</span>
                    <span className="font-medium">89</span>
                  </div>
                  <Progress value={7} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Payout Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Information</CardTitle>
                <CardDescription>Your earnings are automatically paid out via Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium">Next Payout</h4>
                      <p className="text-sm text-muted-foreground">January 1, 2024</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$247.00</div>
                      <Badge variant="secondary" className="text-xs">Pending</Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>• Payouts occur every 2 weeks</p>
                    <p>• Stripe fees: 2.9% + $0.30 per transaction</p>
                    <p>• View detailed reports in your Stripe dashboard</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentSettings;