
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface BaseContribution {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface LightningTalk extends BaseContribution {
  type: 'lightning-talk';
  audience: string;
  recordingLink?: string;
}

interface SCITalk extends BaseContribution {
  type: 'sci-talk';
  organizingTeam: string;
  feedbackReceived?: string;
}

interface Volunteering extends BaseContribution {
  type: 'volunteering';
  activityName: string;
  hoursSpent: number;
  impact: string;
  organization: string;
}

type Contribution = LightningTalk | SCITalk | Volunteering;

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Contributions = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('lightning-talk');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();

  // Mock data for fallback
  const mockContributions: Contribution[] = [
    {
      id: '1',
      type: 'lightning-talk',
      title: 'Introduction to React Hooks',
      description: 'A quick overview of React Hooks and their benefits',
      date: '2024-03-15',
      audience: 'Frontend Team',
      recordingLink: 'https://example.com/recording1'
    },
    {
      id: '2',
      type: 'sci-talk',
      title: 'AI in Healthcare',
      description: 'Exploring AI applications in modern healthcare',
      date: '2024-02-20',
      organizingTeam: 'Healthcare Innovation',
      feedbackReceived: 'Great presentation, very informative'
    }
  ];

  // Load contributions on component mount
  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}user.get_contributions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }

      const data = await response.json();
      setContributions(data.data || []);
    } catch (error) {
      console.error('Error loading contributions:', error);
      toast({
        title: "API Error",
        description: "Failed to load contributions. Using mock data.",
        variant: "destructive"
      });
      setContributions(mockContributions);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contributionData = {
        ...formData,
        type: selectedCategory,
        id: editingId || Date.now().toString()
      };

      if (isEditing) {
        await updateContribution(contributionData);
      } else {
        await createContribution(contributionData);
      }
      
      resetForm();
      loadContributions();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const createContribution = async (data: any) => {
    try {
      const response = await fetch(`${BASE_URL}user.create_contribution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to create contribution');
      }

      toast({
        title: "Success",
        description: "Contribution created successfully!"
      });
    } catch (error) {
      toast({
        title: "API Error",
        description: "Failed to create contribution. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateContribution = async (data: any) => {
    try {
      const response = await fetch(`${BASE_URL}user.update_contribution`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update contribution');
      }

      toast({
        title: "Success",
        description: "Contribution updated successfully!"
      });
    } catch (error) {
      toast({
        title: "API Error",
        description: "Failed to update contribution. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteContribution = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}user.delete_contribution`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete contribution');
      }

      toast({
        title: "Success",
        description: "Contribution deleted successfully!"
      });
      
      loadContributions();
    } catch (error) {
      toast({
        title: "API Error",
        description: "Failed to delete contribution. Please try again.",
        variant: "destructive"
      });
    }
  };

  const editContribution = (contribution: Contribution) => {
    setFormData(contribution);
    setSelectedCategory(contribution.type);
    setIsEditing(true);
    setEditingId(contribution.id);
  };

  const renderForm = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit' : 'Add'} Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lightning-talk">Lightning Talk</SelectItem>
                  <SelectItem value="sci-talk">SCI Talk</SelectItem>
                  <SelectItem value="volunteering">Volunteering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCategory === 'volunteering' && (
              <div>
                <Label htmlFor="activityName">Activity Name</Label>
                <Input
                  id="activityName"
                  value={formData.activityName || ''}
                  onChange={(e) => setFormData({...formData, activityName: e.target.value})}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="date">{selectedCategory === 'lightning-talk' ? 'Date Presented' : 'Date'}</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>

            {selectedCategory === 'lightning-talk' && (
              <>
                <div>
                  <Label htmlFor="audience">Audience</Label>
                  <Input
                    id="audience"
                    value={formData.audience || ''}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="recordingLink">Recording Link (Optional)</Label>
                  <Input
                    id="recordingLink"
                    type="url"
                    value={formData.recordingLink || ''}
                    onChange={(e) => setFormData({...formData, recordingLink: e.target.value})}
                  />
                </div>
              </>
            )}

            {selectedCategory === 'sci-talk' && (
              <>
                <div>
                  <Label htmlFor="organizingTeam">Organizing Team</Label>
                  <Input
                    id="organizingTeam"
                    value={formData.organizingTeam || ''}
                    onChange={(e) => setFormData({...formData, organizingTeam: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="feedbackReceived">Feedback Received (Optional)</Label>
                  <Textarea
                    id="feedbackReceived"
                    value={formData.feedbackReceived || ''}
                    onChange={(e) => setFormData({...formData, feedbackReceived: e.target.value})}
                  />
                </div>
              </>
            )}

            {selectedCategory === 'volunteering' && (
              <>
                <div>
                  <Label htmlFor="hoursSpent">Hours Spent</Label>
                  <Input
                    id="hoursSpent"
                    type="number"
                    value={formData.hoursSpent || ''}
                    onChange={(e) => setFormData({...formData, hoursSpent: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="impact">Impact</Label>
                  <Textarea
                    id="impact"
                    value={formData.impact || ''}
                    onChange={(e) => setFormData({...formData, impact: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization || ''}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {isEditing ? 'Update' : 'Add'} Contribution
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
    );
  };

  const renderContributionsList = (type: string) => {
    const filteredContributions = contributions.filter(c => c.type === type);
    
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      );
    }

    if (filteredContributions.length === 0) {
      return (
        <p className="text-gray-500 italic text-center py-8">
          No {type.replace('-', ' ')}s added yet.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {filteredContributions.map((contribution) => (
          <Card key={contribution.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{contribution.title}</h3>
                  <p className="text-gray-600 mt-1">{contribution.description}</p>
                  <p className="text-sm text-gray-500 mt-2">Date: {contribution.date}</p>
                  
                  {contribution.type === 'lightning-talk' && (
                    <div className="mt-2 text-sm">
                      <p>Audience: {(contribution as LightningTalk).audience}</p>
                      {(contribution as LightningTalk).recordingLink && (
                        <p>Recording: <a href={(contribution as LightningTalk).recordingLink} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">View</a></p>
                      )}
                    </div>
                  )}
                  
                  {contribution.type === 'sci-talk' && (
                    <div className="mt-2 text-sm">
                      <p>Organizing Team: {(contribution as SCITalk).organizingTeam}</p>
                      {(contribution as SCITalk).feedbackReceived && (
                        <p>Feedback: {(contribution as SCITalk).feedbackReceived}</p>
                      )}
                    </div>
                  )}
                  
                  {contribution.type === 'volunteering' && (
                    <div className="mt-2 text-sm">
                      <p>Activity: {(contribution as Volunteering).activityName}</p>
                      <p>Hours: {(contribution as Volunteering).hoursSpent}</p>
                      <p>Organization: {(contribution as Volunteering).organization}</p>
                      <p>Impact: {(contribution as Volunteering).impact}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editContribution(contribution)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteContribution(contribution.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const lightningTalks = contributions.filter(c => c.type === 'lightning-talk').length;
  const sciTalks = contributions.filter(c => c.type === 'sci-talk').length;
  const volunteering = contributions.filter(c => c.type === 'volunteering').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Contributions</h1>
        
        {renderForm()}
        
        <Tabs defaultValue="lightning-talks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lightning-talks">Lightning Talks ({lightningTalks})</TabsTrigger>
            <TabsTrigger value="sci-talks">SCI Talks ({sciTalks})</TabsTrigger>
            <TabsTrigger value="volunteering">Volunteering ({volunteering})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lightning-talks" className="mt-6">
            {renderContributionsList('lightning-talk')}
          </TabsContent>
          
          <TabsContent value="sci-talks" className="mt-6">
            {renderContributionsList('sci-talk')}
          </TabsContent>
          
          <TabsContent value="volunteering" className="mt-6">
            {renderContributionsList('volunteering')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Contributions;
