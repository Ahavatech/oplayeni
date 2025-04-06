import React, { useState } from 'react';
import { Publication } from '@shared/schema';

interface Author {
  name: string;
  institution: string;
  isMainAuthor: boolean;
}

interface PublicationFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Publication;
  onCancel?: () => void;
}

export function PublicationForm({ onSubmit, initialData, onCancel }: PublicationFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [abstract, setAbstract] = useState(initialData?.abstract || '');
  const [authors, setAuthors] = useState<Author[]>(
    initialData?.authors || [{ name: '', institution: '', isMainAuthor: true }]
  );
  const [publicationType, setPublicationType] = useState(initialData?.publicationType || 'journal');
  const [year, setYear] = useState(initialData?.year?.toString() || new Date().getFullYear().toString());
  const [journal, setJournal] = useState(initialData?.journal || '');
  const [volume, setVolume] = useState(initialData?.volume || '');
  const [issue, setIssue] = useState(initialData?.issue || '');
  const [pages, setPages] = useState(initialData?.pages || '');
  const [doi, setDoi] = useState(initialData?.doi || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [status, setStatus] = useState(initialData?.status || 'published');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddAuthor = () => {
    setAuthors([...authors, { name: '', institution: '', isMainAuthor: false }]);
  };

  const handleRemoveAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: string | boolean) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('abstract', abstract);
      formData.append('authors', JSON.stringify(authors));
      formData.append('publicationType', publicationType);
      formData.append('year', year);
      if (journal) formData.append('journal', journal);
      if (volume) formData.append('volume', volume);
      if (issue) formData.append('issue', issue);
      if (pages) formData.append('pages', pages);
      if (doi) formData.append('doi', doi);
      if (url) formData.append('url', url);
      formData.append('status', status);
      if (selectedFile) formData.append('pdf', selectedFile);

      await onSubmit(formData);
      
      // Reset form if not editing
      if (!initialData) {
        setTitle('');
        setAbstract('');
        setAuthors([{ name: '', institution: '', isMainAuthor: true }]);
        setPublicationType('journal');
        setYear(new Date().getFullYear().toString());
        setJournal('');
        setVolume('');
        setIssue('');
        setPages('');
        setDoi('');
        setUrl('');
        setStatus('published');
        setSelectedFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="abstract" className="block text-sm font-medium text-gray-700">
          Abstract *
        </label>
        <textarea
          id="abstract"
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Authors *</label>
          <button
            type="button"
            onClick={handleAddAuthor}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Author
          </button>
        </div>
        {authors.map((author, index) => (
          <div key={index} className="flex gap-4 items-start p-4 border rounded-md">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={author.name}
                onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                required
                aria-label={`Author ${index + 1} name`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                value={author.institution}
                onChange={(e) => handleAuthorChange(index, 'institution', e.target.value)}
                aria-label={`Author ${index + 1} institution`}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                checked={author.isMainAuthor}
                onChange={(e) => handleAuthorChange(index, 'isMainAuthor', e.target.checked)}
                aria-label={`Author ${index + 1} is main author`}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Main Author</label>
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={() => handleRemoveAuthor(index)}
                className="mt-6 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="publicationType" className="block text-sm font-medium text-gray-700">
            Publication Type *
          </label>
          <select
            id="publicationType"
            value={publicationType}
            onChange={(e) => setPublicationType(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="journal">Journal</option>
            <option value="conference">Conference</option>
            <option value="book">Book</option>
            <option value="bookChapter">Book Chapter</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year *
          </label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={1900}
            max={new Date().getFullYear() + 1}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="journal" className="block text-sm font-medium text-gray-700">
            Journal/Conference/Book
          </label>
          <input
            type="text"
            id="journal"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="published">Published</option>
            <option value="accepted">Accepted</option>
            <option value="inPress">In Press</option>
            <option value="underReview">Under Review</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="volume" className="block text-sm font-medium text-gray-700">
            Volume
          </label>
          <input
            type="text"
            id="volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="issue" className="block text-sm font-medium text-gray-700">
            Issue
          </label>
          <input
            type="text"
            id="issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="pages" className="block text-sm font-medium text-gray-700">
            Pages
          </label>
          <input
            type="text"
            id="pages"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="doi" className="block text-sm font-medium text-gray-700">
            DOI
          </label>
          <input
            type="text"
            id="doi"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pdf" className="block text-sm font-medium text-gray-700">
          PDF File
        </label>
        <input
          type="file"
          id="pdf"
          accept=".pdf"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Publication' : 'Create Publication'}
        </button>
      </div>
    </form>
  );
}
