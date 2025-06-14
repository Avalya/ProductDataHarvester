import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Calendar, Info, MapPin, Clock } from "lucide-react";
import { OpportunityWithMatch } from "@/types";

interface OpportunityCardProps {
  opportunity: OpportunityWithMatch;
  onSave?: (opportunityId: number) => void;
  onAddToCalendar?: (opportunity: OpportunityWithMatch) => void;
}

export default function OpportunityCard({ 
  opportunity, 
  onSave, 
  onAddToCalendar 
}: OpportunityCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "internship": return "bg-green-400/20 text-green-400";
      case "fellowship": return "bg-orange-400/20 text-orange-400";
      case "study-abroad": return "bg-blue-400/20 text-blue-400";
      case "grant": return "bg-purple-400/20 text-purple-400";
      default: return "bg-gray-400/20 text-gray-400";
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-green-400";
      case "deadline-passed": return "text-red-400";
      case "closed": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  return (
    <Card className="opportunity-card group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge className={`uppercase text-xs font-medium ${getTypeColor(opportunity.type)}`}>
              {opportunity.type.replace("-", " ")}
            </Badge>
            <div className={`match-badge px-2 py-1 rounded-full text-xs font-bold text-black ${getMatchColor(opportunity.matchPercentage)}`}>
              {opportunity.matchPercentage}% match
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave?.(opportunity.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Title and Organization */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">
          {opportunity.title}
        </h3>
        <p className="text-gray-300 font-medium mb-4">{opportunity.organization}</p>
        
        {/* Location and Duration */}
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{opportunity.location}</span>
          {opportunity.duration && (
            <>
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4 mr-2" />
              <span>{opportunity.duration}</span>
            </>
          )}
        </div>
        
        {/* Status and Salary */}
        <div className="flex items-center text-sm mb-4">
          <span className={`font-bold ${getStatusColor(opportunity.status)}`}>
            {opportunity.deadline}
          </span>
          {opportunity.salary && (
            <>
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-green-400 font-bold">{opportunity.salary}</span>
            </>
          )}
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-400 mb-6 line-clamp-3">
          {opportunity.description}
        </p>
        
        {/* Tags */}
        {opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {opportunity.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Match Reasons */}
        {opportunity.matchReasons.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-green-400 mb-2">Why this matches you:</p>
            <ul className="text-xs text-gray-400 space-y-1">
              {opportunity.matchReasons.slice(0, 2).map((reason, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-green-400 rounded-full mr-2"></span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            className="flex-1 bg-green-400 text-black hover:bg-green-400/80 transition-colors"
            onClick={() => opportunity.url && window.open(opportunity.url, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Apply Now
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddToCalendar?.(opportunity)}
            className="glass-card hover:bg-white/10"
          >
            <Calendar className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="glass-card hover:bg-white/10"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
