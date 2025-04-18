'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PolicyComparisonService, Policy } from '@/lib/policyComparison';
import RoleGuard from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, StarOff, Edit, Trash2, Download, Share2 } from 'lucide-react';
import BenefitsAnalysis from '@/components/BenefitsAnalysis';

type Props = {
  params: { id: string }
}

export default function PolicyDetailPage({ params }: Props) {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  useEffect(() => {
    fetchPolicy();
  }, [id]);

  const fetchPolicy = async () => {
    try {
      console.log('Fetching policy:', id);
      setLoading(true);
      setError(null);
      const comparisonService = PolicyComparisonService.getInstance();
      const policyData = await comparisonService.getPolicyById(id);
      
      console.log('Policy data:', JSON.stringify(policyData, null, 2));
      if (!policyData) {
        setError('Policy not found');
        setPolicy(null);
        return;
      }

      setPolicy(policyData);
      
      // Check if policy is in user's favorites
      if (user) {
        const isFav = await comparisonService.isPolicyFavorite(user.uid, id);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
      setError('Failed to fetch policy details. Please try again later.');
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !policy) return;
    
    try {
      const comparisonService = PolicyComparisonService.getInstance();
      if (isFavorite) {
        await comparisonService.removeFromFavorites(user.uid, policy.id);
      } else {
        await comparisonService.addToFavorites(user.uid, policy.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async () => {
    if (!user || !policy) return;
    
    if (!confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      const comparisonService = PolicyComparisonService.getInstance();
      await comparisonService.deletePolicy(policy.id);
      router.push('/dashboard/policies');
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <Button
          onClick={() => router.push('/dashboard/policies')}
          className="mt-4"
        >
          Back to Policies
        </Button>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Policy not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The policy you're looking for doesn't exist or has been removed.
        </p>
        <Button
          onClick={() => router.push('/dashboard/policies')}
          className="mt-4"
        >
          Back to Policies
        </Button>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['user', 'insurer', 'admin']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/policies')}
              className="p-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{policy.provider}</h1>
              <p className="text-sm text-gray-500">{policy.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={handleToggleFavorite}
              className={isFavorite ? 'text-yellow-500' : 'text-gray-400'}
            >
              {isFavorite ? <Star className="h-5 w-5" /> : <StarOff className="h-5 w-5" />}
            </Button>
            {userProfile?.role === 'insurer' && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/dashboard/policies/${policy.id}/edit`)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button variant="ghost">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost">
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Policy Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Overview</CardTitle>
                <CardDescription>Key details about the policy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Premium</p>
                    <p className="text-lg font-semibold">₹{policy.premium?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coverage</p>
                    <p className="text-lg font-semibold">₹{policy.coverage?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Term</p>
                    <p className="text-lg font-semibold">{policy.term ? `${policy.term} years` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Claim Settlement Ratio</p>
                    <p className="text-lg font-semibold">{policy.claimSettlementRatio ? `${policy.claimSettlementRatio}%` : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <BenefitsAnalysis policy={policy} />

            <Tabs defaultValue="benefits">
              <TabsList>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="addons">Add-ons</TabsTrigger>
                <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
                <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              </TabsList>
              <TabsContent value="benefits" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {policy.benefits?.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-800 mr-2">✓</span>
                          <span>{benefit}</span>
                        </li>
                      )) || (
                        <li className="text-gray-500">No benefits listed</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="addons" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {policy.addOns?.map((addon, index) => (
                        <li key={index} className="flex items-start">
                          <span className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 mr-2">+</span>
                          <span>{addon}</span>
                        </li>
                      )) || (
                        <li className="text-gray-500">No add-ons available</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="exclusions" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {policy.exclusions?.map((exclusion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-800 mr-2">×</span>
                          <span>{exclusion}</span>
                        </li>
                      )) || (
                        <li className="text-gray-500">No exclusions listed</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="eligibility" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Age Range</p>
                        <p className="text-lg font-semibold">
                          {policy.eligibility ? `${policy.eligibility.minAge} - ${policy.eligibility.maxAge} years` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Minimum Income</p>
                        <p className="text-lg font-semibold">
                          ₹{policy.eligibility?.minIncome.toLocaleString() || 'N/A'}/year
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Goals Card */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>This policy helps achieve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {policy.goals?.length > 0 ? (
                    policy.goals.map((goal, index) => (
                      <Badge key={index} variant="secondary">{goal}</Badge>
                    ))
                  ) : (
                    <span className="text-gray-500">No goals specified</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Flexibility Features Card */}
            <Card>
              <CardHeader>
                <CardTitle>Flexibility Features</CardTitle>
                <CardDescription>Policy customization options</CardDescription>
              </CardHeader>
              <CardContent>
                {policy.flexibility ? (
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="h-5 w-5 flex items-center justify-center rounded-full bg-purple-100 text-purple-800 mr-2">⚡</span>
                      <span>Length: {policy.flexibility.length} years</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-5 w-5 flex items-center justify-center rounded-full bg-purple-100 text-purple-800 mr-2">⚡</span>
                      <span>Portability: {policy.flexibility.portability ? 'Yes' : 'No'}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-5 w-5 flex items-center justify-center rounded-full bg-purple-100 text-purple-800 mr-2">⚡</span>
                      <span>Partial Withdrawal: {policy.flexibility.partialWithdrawal ? 'Yes' : 'No'}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="h-5 w-5 flex items-center justify-center rounded-full bg-purple-100 text-purple-800 mr-2">⚡</span>
                      <span>Top-up: {policy.flexibility.topUp ? 'Yes' : 'No'}</span>
                    </li>
                  </ul>
                ) : (
                  <span className="text-gray-500">No flexibility features specified</span>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full"
              onClick={() => router.push(`/dashboard/policies/${policy.id}/purchase`)}
            >
              Purchase Policy
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}