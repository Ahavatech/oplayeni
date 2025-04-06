import React, { useState } from 'react';
import { UpcomingTalk } from '@shared/schema';

interface UpcomingTalkFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: UpcomingTalk;
  onCancel?: () => void;
}

export function UpcomingTalkForm({ onSubmit, initialData, onCancel }: UpcomingTalkFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [venue, setVenue] = useState(initialData?.venue || '');
  const [registrationLink, setRegistrationLink] = useState(initialData?.registrationLink || '');
  const [status, setStatus] = useState(initialData?.status || 'upcoming');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      /*formData.append('title', title);
      formData.append('description', description);
      formData.append('date', date);
      formData.append('time', time);
      formData.append('venue', venue);
      if (registrationLink) formData.append('registrationLink', registrationLink);
      formData.append('status', status);*/

      formData.append('data', JSON.stringify({
        title,
        description,
        date,
        time,
        venue,
        registrationLink,
        status,
      }));
      
      if (selectedFile) formData.append('flyer', selectedFile);

      await onSubmit(formData);
      
      // Reset form if not editing
      if (!initialData) {
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setVenue('');
        setRegistrationLink('');
        setStatus('upcoming');
        setSelectedFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save talk');
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time *
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
          Venue *
        </label>
        <input
          type="text"
          id="venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="registrationLink" className="block text-sm font-medium text-gray-700">
          Registration Link
        </label>
        <input
          type="url"
          id="registrationLink"
          value={registrationLink}
          onChange={(e) => setRegistrationLink(e.target.value)}
          placeholder="https://..."
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
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label htmlFor="flyer" className="block text-sm font-medium text-gray-700">
          Flyer (Image)
        </label>
        <input
          type="file"
          id="flyer"
          accept="image/*"
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
          {isSubmitting ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
} 