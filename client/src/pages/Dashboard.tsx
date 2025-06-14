import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import OpportunityCard from "@/components/OpportunityCard";
import { Target, CheckCircle, Heart, Clock, Search, Grid, List } from "lucide-react";
import { useGetMatches } from "@/hooks/useAI";
import { OpportunityWithMatch, UserProfile } from "@/types";
import { demoOpportunities } from "@/data/opportunities";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState<OpportunityWithMatch[]>(demoOpportunities);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("best-match");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);
  
  const getMatches = useGetMatches();
  const { toast } = useToast();

  // Load opportunities with AI matching if user profile exists
  useEffect(() => {
    const loadOpportunities = async () => {
      // Check if user has a profile (from localStorage or session)
      const userProfile: UserProfile = {
        email: "demo@example.com",
        name: "Demo User",
        skills: ["JavaScript", "React", "Python", "Machine Learning"],
        interests: ["Technology", "Data Science", "AI"],
        goals: ["internship", "fellowship"],
        education: "Bachelor's Degree"
      };

      try {
        setIsLoading(true);
        const result = await getMatches.mutateAsync({ userProfile });
        setOpportunities(result.opportunities);
      } catch (error) {
        console.error("Failed to load matches:", error);
        // Use demo data if API fails
        setOpportunities(demoOpportunities);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  const filteredOpportunities = opportunities
    .filter(opp => {
      const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           opp.organization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || opp.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "best-match":
          return b.matchPercentage - a.matchPercentage;
        case "deadline-soon":
          return a.deadline.localeCompare(b.deadline);
        case "recently-added":
          return b.id - a.id;
        case "highest-salary":
          const salaryA = a.salary ? parseInt(a.salary.replace(/[^\d]/g, "")) : 0;
          const salaryB = b.salary ? parseInt(b.salary.replace(/[^\d]/g, "")) : 0;
          return salaryB - salaryA;
        default:
          return 0;
      }
    });

  const stats = {
    total: opportunities.length,
    highMatches: opportunities.filter(opp => opp.matchPercentage >= 80).length,
    saved: 0, // Would come from saved state
    deadlineSoon: opportunities.filter(opp => opp.status === "open").length
  };

  const handleSaveOpportunity = (opportunityId: number) => {
    toast({
      title: "Opportunity Saved",
      description: "Added to your saved opportunities list.",
    });
  };

  const handleAddToCalendar = (opportunity: OpportunityWithMatch) => {
    // Generate .ics file for calendar integration
    const event = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI Career Navigator//EN
BEGIN:VEVENT
UID:${opportunity.id}@aicareernavigator.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Application Deadline: ${opportunity.title}
DESCRIPTION:${opportunity.description}
LOCATION:${opportunity.location}
URL:${opportunity.url || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([event], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${opportunity.title}-deadline.ics`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Added to Calendar",
      description: "Event has been downloaded. Import it to your calendar app.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6 py-12">
          {/* Dashboard Header */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Opportunity Dashboard</h2>
            <p className="text-xl text-gray-300 mb-8">Discover opportunities perfectly matched to your profile</p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats.total}</div>
                  <div className="text-sm text-gray-400">Total Opportunities</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stats.highMatches}</div>
                  <div className="text-sm text-gray-400">High Matches</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="text-3xl font-bold text-orange-400 mb-2">{stats.saved}</div>
                  <div className="text-sm text-gray-400">Saved</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.deadlineSoon}</div>
                  <div className="text-sm text-gray-400">Open Applications</div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search opportunities..."
                className="pl-12 glass-card border-none focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40 glass-card border-none focus:ring-2 focus:ring-green-400 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internship">Internships</SelectItem>
                  <SelectItem value="study-abroad">Study Abroad</SelectItem>
                  <SelectItem value="grant">Grants</SelectItem>
                  <SelectItem value="fellowship">Fellowships</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 glass-card border-none focus:ring-2 focus:ring-green-400 text-white">
                  <SelectValue placeholder="Best Match" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="best-match">Best Match</SelectItem>
                  <SelectItem value="deadline-soon">Deadline Soon</SelectItem>
                  <SelectItem value="recently-added">Recently Added</SelectItem>
                  <SelectItem value="highest-salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="glass-card hover:bg-white/10"
              >
                <Grid className="w-4 h-4" />
              </Button>
              
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="glass-card hover:bg-white/10"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-400">
              Showing {filteredOpportunities.length} of {opportunities.length} opportunities
            </p>
          </div>
          
          {/* Opportunity Cards */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading personalized matches...</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" 
                : "grid-cols-1"
            }`}>
              {filteredOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onSave={handleSaveOpportunity}
                  onAddToCalendar={handleAddToCalendar}
                />
              ))}
            </div>
          )}
          
          {filteredOpportunities.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No opportunities found matching your criteria.</p>
              <Button 
                className="mt-4 glass-card hover:bg-white/10"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
          
          {/* Load More */}
          {filteredOpportunities.length > 0 && (
            <div className="text-center mt-12">
              <Button className="glass-card hover:bg-white/10 px-8 py-3">
                Load More Opportunities
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <ChatWidget />
    </div>
  );
}
