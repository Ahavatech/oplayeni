import React from 'react';
import { UpcomingTalk } from '@shared/schema';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';

interface EventWithId extends UpcomingTalk {
  _id: string;
}

interface EventListProps {
  talks: EventWithId[];
  isAdmin?: boolean;
  onEdit?: (talk: EventWithId) => void;
  onDelete?: (id: string) => void;
}

export function EventList({ talks = [], isAdmin, onEdit, onDelete }: EventListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: UpcomingTalk['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!Array.isArray(talks)) {
    console.error('Events is not an array:', talks);
    return null;
  }

  // Filter out any invalid talk objects
  const validTalks = talks.filter(talk => 
    talk && 
    typeof talk === 'object' && 
    !Array.isArray(talk) &&
    '_id' in talk &&
    'title' in talk
  );

  return (
    <div className="space-y-6">
      {validTalks.map((talk) => (
        <Card key={talk._id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {talk.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(talk.date)} at {formatTime(talk.time)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={talk.status === 'upcoming' ? 'default' : talk.status === 'completed' ? 'secondary' : 'destructive'}>
                {talk.status.charAt(0).toUpperCase() + talk.status.slice(1)}
              </Badge>
              {isAdmin && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(talk)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete?.(talk._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900">{talk.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Venue</h4>
              <p className="mt-1 text-sm text-gray-900">{talk.venue}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              {talk.registrationLink && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Registration</h4>
                  <a
                    href={talk.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Register Here
                  </a>
                </div>
              )}

              {talk.flyerUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Flyer</h4>
                  <a
                    href={talk.flyerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Flyer
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
      {validTalks.length === 0 && (
        <p className="text-center text-gray-500">No events found.</p>
      )}
    </div>
  );
} 