import { useState } from 'react';
import { Button } from './ui/button';
import { Link2, MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ShareLinkButtonsProps {
  recordId: string;
  courseTitle: string;
}

export function ShareLinkButtons({ recordId, courseTitle }: ShareLinkButtonsProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate shareable link
  const encodedId = btoa(recordId); // Base64 encode the record ID
  const shareUrl = `${window.location.origin}/view/${encodedId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Link copied to clipboard!');
      
      setTimeout(() => {
        setCopiedLink(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Check out this Lab Record: ${courseTitle}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
      <Button
        onClick={handleCopyLink}
        size="sm"
        variant="outline"
        className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
      >
        {copiedLink ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-1" />
            Copy Link
          </>
        )}
      </Button>
      
      <Button
        onClick={handleWhatsAppShare}
        size="sm"
        variant="outline"
        className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
      >
        <MessageCircle className="w-4 h-4 mr-1" />
        WhatsApp
      </Button>
    </div>
  );
}
