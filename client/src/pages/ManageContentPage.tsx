import React, { useState, useEffect } from 'react';
import { Publication, UpcomingTalk } from '@shared/schema';
import { PublicationForm } from '@/components/PublicationForm';
import { PublicationList } from '@/components/PublicationList';
import { UpcomingTalkForm } from '@/components/UpcomingTalkForm';
import { UpcomingTalkList } from '../components/UpcomingTalkList';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ManageContentPageProps {
  isAdmin?: boolean;
}

interface PublicationWithId extends Publication {
  _id: string;
}

interface UpcomingTalkWithId extends UpcomingTalk {
  _id: string;
}

export function ManageContentPage({ isAdmin }: ManageContentPageProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'publications' | 'talks'>('publications');
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [showTalkForm, setShowTalkForm] = useState(false);
  const [publications, setPublications] = useState<PublicationWithId[]>([]);
  const [talks, setTalks] = useState<UpcomingTalkWithId[]>([]);
  const [editingPublication, setEditingPublication] = useState<PublicationWithId | null>(null);
  const [editingTalk, setEditingTalk] = useState<UpcomingTalkWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [publicationsRes, talksRes] = await Promise.all([
        fetch('/api/publications'),
        fetch('/api/talks')
      ]);

      if (!publicationsRes.ok || !talksRes.ok) {
        throw new Error('Failed to fetch content');
      }

      const [publicationsData, talksData] = await Promise.all([
        publicationsRes.json(),
        talksRes.json()
      ]);

      setPublications(publicationsData as PublicationWithId[]);
      setTalks(talksData as UpcomingTalkWithId[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublicationSubmit = async (formData: FormData) => {
    try {
      const url = editingPublication 
        ? `/api/publications/${editingPublication._id}`
        : '/api/publications';
      
      const method = editingPublication ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save publication');
      }

      await fetchContent();
      setShowPublicationForm(false);
      setEditingPublication(null);
    } catch (err) {
      throw err;
    }
  };

  const handleTalkSubmit = async (formData: FormData) => {
    try {
      const url = editingTalk 
        ? `/api/talks/${editingTalk._id}`
        : '/api/talks';
      
      const method = editingTalk ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save talk');
      }

      await fetchContent();
      setShowTalkForm(false);
      setEditingTalk(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeletePublication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this publication?')) {
      return;
    }

    try {
      const response = await apiRequest('DELETE', `/api/publications/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete publication');
      }
      await fetchContent();
      toast({ title: 'Publication deleted successfully' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete publication';
      setError(errorMessage);
      toast({
        title: 'Error deleting publication',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTalk = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this talk?')) {
      return;
    }

    try {
      const response = await fetch(`/api/talks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete talk');
      }

      await fetchContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete talk');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('publications')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'publications'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Publications
          </button>
          <button
            onClick={() => setActiveTab('talks')}
            className={`px-3 py-2 font-medium text-sm rounded-md ${
              activeTab === 'talks'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming Talks
          </button>
        </nav>
      </div>

      {activeTab === 'publications' && (
        <div>
          {isAdmin && !showPublicationForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowPublicationForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Publication
              </button>
            </div>
          )}

          {showPublicationForm && (
            <div className="mb-6 bg-white shadow sm:rounded-lg p-6">
              <PublicationForm
                onSubmit={handlePublicationSubmit}
                initialData={editingPublication || undefined}
                onCancel={() => {
                  setShowPublicationForm(false);
                  setEditingPublication(null);
                }}
              />
            </div>
          )}

          <PublicationList
            publications={publications}
            isAdmin={isAdmin}
            onEdit={(publication) => {
              setEditingPublication(publication);
              setShowPublicationForm(true);
            }}
            onDelete={handleDeletePublication}
          />
        </div>
      )}

      {activeTab === 'talks' && (
        <div>
          {isAdmin && !showTalkForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowTalkForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Talk
              </button>
            </div>
          )}

          {showTalkForm && (
            <div className="mb-6 bg-white shadow sm:rounded-lg p-6">
              <UpcomingTalkForm
                onSubmit={handleTalkSubmit}
                initialData={editingTalk || undefined}
                onCancel={() => {
                  setShowTalkForm(false);
                  setEditingTalk(null);
                }}
              />
            </div>
          )}

          <UpcomingTalkList
            talks={talks}
            isAdmin={isAdmin}
            onEdit={(talk) => {
              setEditingTalk(talk);
              setShowTalkForm(true);
            }}
            onDelete={handleDeleteTalk}
          />
        </div>
      )}
    </div>
  );
} 