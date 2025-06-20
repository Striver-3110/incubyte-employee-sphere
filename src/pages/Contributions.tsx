
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  ContributionType, 
  LightningTalk, 
  SCITalk, 
  Volunteering,
  useContributions,
  createContribution,
  updateContribution,
  deleteContribution
} from "@/api/employeeService";

const Contributions = () => {
  const [selectedCategory, setSelectedCategory] = useState<ContributionType>("lightning_talk");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  const { 
    contributions: lightningTalks, 
    loading: lightningLoading, 
    refetch: refetchLightning 
  } = useContributions("lightning_talk");
  
  const { 
    contributions: sciTalks, 
    loading: sciLoading, 
    refetch: refetchSci 
  } = useContributions("sci_talk");
  
  const { 
    contributions: volunteering, 
    loading: volunteeringLoading, 
    refetch: refetchVolunteering 
  } = useContributions("volunteering");

  const resetForm = () => {
    setFormData({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && editingId) {
        await updateContribution(selectedCategory, editingId, formData);
        toast({
          title: "Success",
          description: "Contribution updated successfully!",
        });
      } else {
        await createContribution(selectedCategory, formData);
        toast({
          title: "Success",
          description: "Contribution added successfully!",
        });
      }
      
      // Refetch data
      if (selectedCategory === "lightning_talk") refetchLightning();
      else if (selectedCategory === "sci_talk") refetchSci();
      else refetchVolunteering();
      
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} contribution. Using mock data.`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (contribution: any) => {
    setFormData(contribution);
    setIsEditing(true);
    setEditingId(contribution.id);
  };

  const handleDelete = async (id: string, type: ContributionType) => {
    try {
      await deleteContribution(type, id);
      toast({
        title: "Success",
        description: "Contribution deleted successfully!",
      });
      
      // Refetch data
      if (type === "lightning_talk") refetchLightning();
      else if (type === "sci_talk") refetchSci();
      else refetchVolunteering();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contribution.",
        variant: "destructive",
      });
    }
  };

  const renderForm = () => {
    const commonFields = (
      <>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
      </>
    );

    if (selectedCategory === "lightning_talk") {
      return (
        <>
          {commonFields}
          <div className="space-y-2">
            <Label htmlFor="date_presented">Date Presented</Label>
            <Input
              id="date_presented"
              type="date"
              value={formData.date_presented || ""}
              onChange={(e) => setFormData({ ...formData, date_presented: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience">Audience</Label>
            <Input
              id="audience"
              value={formData.audience || ""}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recording_link">Recording Link (Optional)</Label>
            <Input
              id="recording_link"
              type="url"
              value={formData.recording_link || ""}
              onChange={(e) => setFormData({ ...formData, recording_link: e.target.value })}
            />
          </div>
        </>
      );
    }

    if (selectedCategory === "sci_talk") {
      return (
        <>
          {commonFields}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ""}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizing_team">Organizing Team</Label>
            <Input
              id="organizing_team"
              value={formData.organizing_team || ""}
              onChange={(e) => setFormData({ ...formData, organizing_team: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback_received">Feedback Received (Optional)</Label>
            <Textarea
              id="feedback_received"
              value={formData.feedback_received || ""}
              onChange={(e) => setFormData({ ...formData, feedback_received: e.target.value })}
            />
          </div>
        </>
      );
    }

    if (selectedCategory === "volunteering") {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="activity_name">Activity Name</Label>
            <Input
              id="activity_name"
              value={formData.activity_name || ""}
              onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date || ""}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours_spent">Hours Spent</Label>
            <Input
              id="hours_spent"
              type="number"
              value={formData.hours_spent || ""}
              onChange={(e) => setFormData({ ...formData, hours_spent: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="impact">Impact</Label>
            <Textarea
              id="impact"
              value={formData.impact || ""}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={formData.organization || ""}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              required
            />
          </div>
        </>
      );
    }
  };

  const renderContributionCard = (contribution: any, type: ContributionType) => (
    <Card key={contribution.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {contribution.title || contribution.activity_name}
            </CardTitle>
            <CardDescription className="mt-1">
              {new Date(contribution.date_presented || contribution.date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(contribution)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(contribution.id, type)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{contribution.description}</p>
        {type === "lightning_talk" && (
          <div className="space-y-1">
            <Badge variant="secondary">Audience: {contribution.audience}</Badge>
            {contribution.recording_link && (
              <div>
                <a 
                  href={contribution.recording_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Recording
                </a>
              </div>
            )}
          </div>
        )}
        {type === "sci_talk" && (
          <div className="space-y-1">
            <Badge variant="secondary">Team: {contribution.organizing_team}</Badge>
            {contribution.feedback_received && (
              <p className="text-sm text-gray-500">Feedback: {contribution.feedback_received}</p>
            )}
          </div>
        )}
        {type === "volunteering" && (
          <div className="space-y-1">
            <Badge variant="secondary">{contribution.hours_spent} hours</Badge>
            <Badge variant="outline">{contribution.organization}</Badge>
            <p className="text-sm text-gray-500">Impact: {contribution.impact}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isEditing ? "Edit Contribution" : "Add New Contribution"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value: ContributionType) => {
                    setSelectedCategory(value);
                    if (!isEditing) resetForm();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lightning_talk">Lightning Talk</SelectItem>
                    <SelectItem value="sci_talk">SCI Talk</SelectItem>
                    <SelectItem value="volunteering">Volunteering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderForm()}

              <div className="flex gap-2">
                <Button type="submit">
                  {isEditing ? "Update" : "Add"} Contribution
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="lightning_talk" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lightning_talk">
              Lightning Talks ({lightningTalks.length})
            </TabsTrigger>
            <TabsTrigger value="sci_talk">
              SCI Talks ({sciTalks.length})
            </TabsTrigger>
            <TabsTrigger value="volunteering">
              Volunteering ({volunteering.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lightning_talk" className="mt-6">
            {lightningLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (lightningTalks || []).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No lightning talks found. Add your first one above!</p>
                </CardContent>
              </Card>
            ) : (
              (lightningTalks || []).map((talk) => renderContributionCard(talk, "lightning_talk"))
            )}
          </TabsContent>

          <TabsContent value="sci_talk" className="mt-6">
            {sciLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (sciTalks || []).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No SCI talks found. Add your first one above!</p>
                </CardContent>
              </Card>
            ) : (
              (sciTalks || []).map((talk) => renderContributionCard(talk, "sci_talk"))
            )}
          </TabsContent>

          <TabsContent value="volunteering" className="mt-6">
            {volunteeringLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : volunteering.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">No volunteering activities found. Add your first one above!</p>
                </CardContent>
              </Card>
            ) : (
              (volunteering || []).map((activity) => renderContributionCard(activity, "volunteering"))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Contributions;
