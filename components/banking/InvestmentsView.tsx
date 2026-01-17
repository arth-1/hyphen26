'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/updated_ui/components/ui/card';
import { Badge } from '@/updated_ui/components/ui/badge';
import { Button } from '@/updated_ui/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/updated_ui/components/ui/tabs';
import { TrendingUp, PiggyBank, Landmark, Target, Sparkles, ChevronRight } from 'lucide-react';

interface InvestmentProduct {
  id: string;
  product_type: 'fixed_deposit' | 'recurring_deposit' | 'loan' | 'mutual_fund' | 'insurance';
  product_name: string;
  interest_rate?: string;
  min_amount: string;
  max_amount?: string;
  min_tenure_months?: number;
  max_tenure_months?: number;
  features: string[];
  eligibility_criteria: Record<string, unknown>;
  is_active: boolean;
}

interface PortfolioRecommendation {
  id: string;
  recommendation_type: 'diversification' | 'fd_renewal' | 'loan_prepayment' | 'insurance' | 'investment_opportunity';
  title: string;
  description: string;
  potential_benefit: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

interface InvestmentsViewProps {
  language?: string;
}

export function InvestmentsView({ language = 'hi' }: InvestmentsViewProps) {
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [recommendations, setRecommendations] = useState<PortfolioRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const content = {
    hi: {
      title: 'निवेश के अवसर',
      subtitle: 'आपके लिए उपलब्ध निवेश उत्पाद',
      recommendations: 'AI सिफारिशें',
      recommendationsSubtitle: 'आपके लिए वैयक्तिकृत सलाह',
      products: 'उत्पाद',
      allProducts: 'सभी उत्पाद',
      fixedDeposits: 'सावधि जमा',
      recurringDeposits: 'आवर्ती जमा',
      loans: 'ऋण',
      interestRate: 'ब्याज दर',
      minAmount: 'न्यूनतम राशि',
      maxAmount: 'अधिकतम राशि',
      tenure: 'अवधि',
      months: 'महीने',
      years: 'साल',
      features: 'विशेषताएं',
      applyNow: 'अभी आवेदन करें',
      learnMore: 'और जानें',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कम',
      priority: 'प्राथमिकता',
      potentialBenefit: 'संभावित लाभ',
      noProducts: 'कोई उत्पाद उपलब्ध नहीं है',
      noRecommendations: 'फिलहाल कोई सिफारिशें नहीं',
      loading: 'लोड हो रहा है...',
    },
    en: {
      title: 'Investment Opportunities',
      subtitle: 'Available investment products for you',
      recommendations: 'AI Recommendations',
      recommendationsSubtitle: 'Personalized advice for you',
      products: 'Products',
      allProducts: 'All Products',
      fixedDeposits: 'Fixed Deposits',
      recurringDeposits: 'Recurring Deposits',
      loans: 'Loans',
      interestRate: 'Interest Rate',
      minAmount: 'Min Amount',
      maxAmount: 'Max Amount',
      tenure: 'Tenure',
      months: 'months',
      years: 'years',
      features: 'Features',
      applyNow: 'Apply Now',
      learnMore: 'Learn More',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      priority: 'Priority',
      potentialBenefit: 'Potential Benefit',
      noProducts: 'No products available',
      noRecommendations: 'No recommendations at this time',
      loading: 'Loading...',
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  useEffect(() => {
    fetchInvestmentData();
  }, []);

  const fetchInvestmentData = async () => {
    try {
      // Fetch investment products
      const productsRes = await fetch('/api/banking/investments/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      // Fetch AI recommendations
      const recsRes = await fetch('/api/banking/recommendations');
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        setRecommendations(recsData.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching investment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'fixed_deposit':
        return <PiggyBank className="w-6 h-6 text-green-600" />;
      case 'recurring_deposit':
        return <TrendingUp className="w-6 h-6 text-purple-600" />;
      case 'loan':
        return <Landmark className="w-6 h-6 text-orange-600" />;
      default:
        return <Target className="w-6 h-6 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500">{t.loading}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations Section */}
      <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            {t.recommendations}
          </CardTitle>
          <CardDescription>{t.recommendationsSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t.noRecommendations}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <Badge variant="secondary" className={priorityColors[rec.priority]}>
                        {t[rec.priority as keyof typeof t]}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">{t.potentialBenefit}:</span>{' '}
                        {rec.potential_benefit}
                      </div>
                      <Button size="sm" variant="outline">
                        {t.learnMore}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Products Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t.allProducts}</TabsTrigger>
              <TabsTrigger value="fixed_deposit">{t.fixedDeposits}</TabsTrigger>
              <TabsTrigger value="recurring_deposit">{t.recurringDeposits}</TabsTrigger>
              <TabsTrigger value="loan">{t.loans}</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ProductsList products={products} t={t} formatCurrency={formatCurrency} getProductIcon={getProductIcon} />
            </TabsContent>

            <TabsContent value="fixed_deposit">
              <ProductsList
                products={products.filter((p) => p.product_type === 'fixed_deposit')}
                t={t}
                formatCurrency={formatCurrency}
                getProductIcon={getProductIcon}
              />
            </TabsContent>

            <TabsContent value="recurring_deposit">
              <ProductsList
                products={products.filter((p) => p.product_type === 'recurring_deposit')}
                t={t}
                formatCurrency={formatCurrency}
                getProductIcon={getProductIcon}
              />
            </TabsContent>

            <TabsContent value="loan">
              <ProductsList
                products={products.filter((p) => p.product_type === 'loan')}
                t={t}
                formatCurrency={formatCurrency}
                getProductIcon={getProductIcon}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsList({
  products,
  t,
  formatCurrency,
  getProductIcon,
}: {
  products: InvestmentProduct[];
  t: Record<string, string>;
  formatCurrency: (amount: string) => string;
  getProductIcon: (type: string) => React.ReactElement;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{t.noProducts}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                {getProductIcon(product.product_type)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{product.product_name}</h3>
                {product.interest_rate && (
                  <p className="text-sm text-green-600 font-semibold">
                    {t.interestRate}: {product.interest_rate}% p.a.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.minAmount}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(product.min_amount)}
                </span>
              </div>

              {product.max_amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.maxAmount}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(product.max_amount)}
                  </span>
                </div>
              )}

              {product.min_tenure_months && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t.tenure}</span>
                  <span className="font-semibold text-gray-900">
                    {product.min_tenure_months}
                    {product.max_tenure_months && ` - ${product.max_tenure_months}`} {t.months}
                  </span>
                </div>
              )}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">{t.features}:</p>
                <ul className="space-y-1">
                  {product.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {t.applyNow}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
