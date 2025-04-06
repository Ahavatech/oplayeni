import React from 'react';
import { Publication } from '@shared/schema';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface PublicationWithId extends Publication {
  _id: string;
}

interface PublicationListProps {
  publications: PublicationWithId[];
  isAdmin?: boolean;
  onEdit?: (publication: PublicationWithId) => void;
  onDelete?: (id: string) => void;
}

export function PublicationList({ publications = [], isAdmin, onEdit, onDelete }: PublicationListProps) {
  const formatAuthors = (authors: Publication['authors']) => {
    if (!Array.isArray(authors)) return '';
    return authors.map(author => author.name).join(', ');
  };

  if (!Array.isArray(publications)) {
    console.error('Publications is not an array:', publications);
    return null;
  }

  return (
    <div className="space-y-6">
      {publications.map((publication) => (
        <Card key={publication._id} className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {publication.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {formatAuthors(publication.authors)}
              </p>
            </div>
            {isAdmin && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(publication)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete?.(publication._id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500">Abstract</h4>
              <p className="mt-1 text-sm text-gray-900">{publication.abstract}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Type</h4>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {publication.publicationType ? 
                  publication.publicationType.replace(/([A-Z])/g, ' $1').trim() :
                  'Unknown Type'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Year</h4>
              <p className="mt-1 text-sm text-gray-900">{publication.year}</p>
            </div>

            {publication.journal && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Journal/Conference/Book</h4>
                <p className="mt-1 text-sm text-gray-900">{publication.journal}</p>
              </div>
            )}

            {(publication.volume || publication.issue || publication.pages) && (
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Details</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {[
                    publication.volume && `Volume ${publication.volume}`,
                    publication.issue && `Issue ${publication.issue}`,
                    publication.pages && `Pages ${publication.pages}`,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}

            <div className="col-span-2 flex flex-wrap gap-4">
              {publication.doi && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">DOI</h4>
                  <a
                    href={`https://doi.org/${publication.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {publication.doi}
                  </a>
                </div>
              )}

              {publication.url && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">URL</h4>
                  <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Publication
                  </a>
                </div>
              )}

              {publication.pdfUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">PDF</h4>
                  <a
                    href={publication.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
      {publications.length === 0 && (
        <p className="text-center text-gray-500">No publications found.</p>
      )}
    </div>
  );
} 