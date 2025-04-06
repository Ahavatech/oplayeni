import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PublicationForm } from '@/components/PublicationForm';
import { PublicationList } from '@/components/PublicationList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function PublicationsPage() {
  const { toast } = useToast();
  const [isAddingPublication, setIsAddingPublication] = useState(false);
  
  const { data: publications = [] } = useQuery({
    queryKey: ['/api/publications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/publications');
      return response.json();
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Publications</h1>
        <Button onClick={() => setIsAddingPublication(true)} variant="default">
          Add Publication
        </Button>
      </div>

      {isAddingPublication ? (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Publication</h2>
          <PublicationForm
            onSubmit={async (formData) => {
              try {
                const response = await apiRequest('POST', '/api/publications', formData, { isFormData: true });
                if (!response.ok) {
                  throw new Error('Failed to create publication');
                }
                queryClient.invalidateQueries({ queryKey: ['/api/publications'] });
                setIsAddingPublication(false);
                toast({ title: 'Publication created successfully' });
              } catch (error) {
                console.error('Error creating publication:', error);
                toast({
                  title: 'Error creating publication',
                  description: error instanceof Error ? error.message : 'Failed to create publication',
                  variant: 'destructive'
                });
                throw error;
              }
            }}
            onCancel={() => setIsAddingPublication(false)}
          />
        </Card>
      ) : null}

      <PublicationList publications={publications} />
    </div>
  );
} 