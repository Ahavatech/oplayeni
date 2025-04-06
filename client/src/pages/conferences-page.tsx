import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UpcomingTalkForm } from '@/components/UpcomingTalkForm';
import { EventList } from '@/components/EventList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ConferencesPage() {
  const [isAddingTalk, setIsAddingTalk] = useState(false);

  const { data: talks = [] } = useQuery({
    queryKey: ['talks'],
    queryFn: async () => {
      const response = await fetch('/api/talks');
      if (!response.ok) {
        throw new Error('Failed to fetch talks');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Conferences & Talks</h1>
        <Button onClick={() => setIsAddingTalk(true)} variant="default">
          Add Talk
        </Button>
      </div>

      {isAddingTalk ? (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Talk</h2>
          <UpcomingTalkForm
            onSubmit={async (formData) => {
              try {
                const response = await fetch('/api/talks', {
                  method: 'POST',
                  body: formData,
                });
                if (!response.ok) {
                  throw new Error('Failed to create talk');
                }
                setIsAddingTalk(false);
              } catch (error) {
                console.error('Error creating talk:', error);
                throw error;
              }
            }}
            onCancel={() => setIsAddingTalk(false)}
          />
        </Card>
      ) : null}

      <EventList talks={talks} />
    </div>
  );
} 