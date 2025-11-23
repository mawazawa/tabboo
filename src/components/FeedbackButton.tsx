/**
 * Feedback Button Component
 *
 * Floating button for beta users to submit feedback.
 * Opens a dialog with a simple form to report bugs, request features, etc.
 */

import { useState } from 'react';
import { MessageSquarePlus, Bug, Lightbulb, HelpCircle, Send, X } from '@/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FeedbackButtonProps {
  className?: string;
}

type FeedbackType = 'bug' | 'feature' | 'usability' | 'other';

const feedbackTypes: { value: FeedbackType; label: string; icon: React.ReactNode }[] = [
  { value: 'bug', label: 'Bug Report', icon: <Bug className="h-4 w-4" /> },
  { value: 'feature', label: 'Feature Request', icon: <Lightbulb className="h-4 w-4" /> },
  { value: 'usability', label: 'Usability Issue', icon: <HelpCircle className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <MessageSquarePlus className="h-4 w-4" /> },
];

export function FeedbackButton({ className }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('beta_feedback').insert({
        user_id: user?.id,
        feedback_type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;

      toast.success('Thank you for your feedback!', {
        description: 'We review all feedback to improve SwiftFill.',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFeedbackType('bug');
      setIsOpen(false);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback', {
        description: 'Please try again or email support@swiftfill.app',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className={cn(
            'fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg',
            'bg-background/80 backdrop-blur-sm border-2',
            'hover:scale-105 transition-transform',
            className
          )}
          aria-label="Send feedback"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve SwiftFill. Your feedback is valuable!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label>Type of feedback</Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={feedbackType === type.value ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => setFeedbackType(type.value)}
                >
                  {type.icon}
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="feedback-title">Title</Label>
            <Input
              id="feedback-title"
              placeholder={
                feedbackType === 'bug'
                  ? "What's not working?"
                  : feedbackType === 'feature'
                  ? 'What would you like to see?'
                  : 'Brief summary'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="feedback-description">Description</Label>
            <Textarea
              id="feedback-description"
              placeholder={
                feedbackType === 'bug'
                  ? 'Steps to reproduce, what you expected, what happened...'
                  : 'Please describe in detail...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
