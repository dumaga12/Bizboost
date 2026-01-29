import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Filter, ArrowLeft, Search, Loader2, ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDeals, useCategories, Deal } from "@/hooks/useDeals";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays, parseISO } from "date-fns";

const BrowseAll = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("trending");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: deals, isLoading: dealsLoading } = useDeals({ 
    search: searchQuery, 
    sortBy 
  });
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { user } = useAuth();
  const { addToCart, isInCart, cartCount } = useCart();

  const discountRanges = [
    { label: "10% or more", value: 10 },
    { label: "25% or more", value: 25 },
    { label: "50% or more", value: 50 },
    { label: "75% or more", value: 75 },
  ];

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
    }
    setCurrentPage(1);
  };

  const handleDiscountChange = (range: string, checked: boolean) => {
    setSelectedDiscount(checked ? range : null);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleAddToCart = (e: React.MouseEvent, dealId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/customer/login");
      return;
    }
    addToCart.mutate(dealId);
  };

  const getDiscountValue = (deal: Deal): number => {
    const numericValue = parseFloat(deal.discount_value.replace(/[^0-9.]/g, ""));
    return isNaN(numericValue) ? 0 : numericValue;
  };

  const getDaysLeft = (endDate: string): number => {
    return differenceInDays(parseISO(endDate), new Date());
  };

  const getExpiryText = (endDate: string, isPerpetual?: boolean): string => {
    if (isPerpetual) return "Never expires";
    const days = getDaysLeft(endDate);
    if (days < 0) return "Expired";
    if (days === 0) return "Ends today";
    if (days === 1) return "1 day left";
    if (days < 7) return `${days} days left`;
    if (days < 14) return "1 week left";
    return `${Math.ceil(days / 7)} weeks left`;
  };

  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    
    let result = [...deals];

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      result = result.filter(deal => deal.category_id && selectedCategories.includes(deal.category_id));
    }

    // Filter by discount value
    if (selectedDiscount) {
      const minDiscount = discountRanges.find(r => r.label === selectedDiscount)?.value || 0;
      result = result.filter(deal => getDiscountValue(deal) >= minDiscount);
    }

    return result;
  }, [deals, selectedCategories, selectedDiscount]);

  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedDiscount(null);
    setSearchQuery("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const isLoading = dealsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/customer/cart" className="relative">
            <Button variant="outline" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cartCount > 0 && (
                <Badge className="ml-2">{cartCount}</Badge>
              )}
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search deals..." 
                className="pl-10 h-12"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button size="lg" onClick={handleSearch}>Search</Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Browse All Deals</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `${filteredDeals.length} deals found`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(selectedCategories.length > 0 || selectedDiscount) && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedCategories.length + (selectedDiscount ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Deals</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Categories</h3>
                    <div className="space-y-2">
                      {categories?.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={category.id} 
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                          />
                          <label htmlFor={category.id} className="text-sm text-muted-foreground cursor-pointer">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 text-foreground">Discount</h3>
                    <div className="space-y-2">
                      {discountRanges.map((range) => (
                        <div key={range.label} className="flex items-center space-x-2">
                          <Checkbox 
                            id={range.label} 
                            checked={selectedDiscount === range.label}
                            onCheckedChange={(checked) => handleDiscountChange(range.label, checked as boolean)}
                          />
                          <label htmlFor={range.label} className="text-sm text-muted-foreground cursor-pointer">
                            {range.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : paginatedDeals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No deals found. Try adjusting your filters or search.</p>
              <Button className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDeals.map((deal) => (
              <Link key={deal.id} to={`/deals/${deal.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden h-full">
                  <div className="h-40 overflow-hidden bg-muted">
                    {deal.image_url ? (
                      <img 
                        src={deal.image_url} 
                        alt={deal.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <CardHeader className="pt-3">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-destructive text-destructive-foreground">
                        {deal.discount_value}
                      </Badge>
                      <Badge variant="outline">{getExpiryText(deal.end_date, deal.is_perpetual)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-bold text-lg mb-2 text-card-foreground">{deal.title}</h4>
                    <p className="text-sm text-muted-foreground">{deal.business_name}</p>
                    {deal.category_name && (
                      <Badge variant="secondary" className="mt-2">{deal.category_name}</Badge>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={isInCart(deal.id) ? "secondary" : "default"}
                      onClick={(e) => handleAddToCart(e, deal.id)}
                      disabled={isInCart(deal.id)}
                    >
                      {isInCart(deal.id) ? "In Cart" : "Add to Cart"}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button 
              variant="outline" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button 
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button 
              variant="outline" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseAll;
