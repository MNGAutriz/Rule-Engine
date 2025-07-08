import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface Campaign {
  campaignCode: string;
  name: string;
  market: string;
  channel: string;
  startDate: string;
  endDate: string;
  ruleIds: string[];
  description?: string;
}

interface DeleteCampaignDialogProps {
  campaign: Campaign;
  onDelete: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteCampaignDialog: React.FC<DeleteCampaignDialogProps> = ({
  campaign,
  onDelete,
  onCancel,
  loading = false
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Delete Campaign</h2>
            <p className="text-red-100 text-sm">This action cannot be undone</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={loading}
          className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-lg transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Modal Content */}
      <div className="p-6 bg-white">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">
                  Are you sure you want to delete this campaign?
                </h3>
                <div className="space-y-2 text-sm text-red-800">
                  <div className="bg-white/70 rounded-lg p-3 space-y-1">
                    <p><span className="font-medium">Code:</span> {campaign.campaignCode}</p>
                    <p><span className="font-medium">Name:</span> {campaign.name}</p>
                    <p><span className="font-medium">Market:</span> {campaign.market} • {campaign.channel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">
                This will permanently remove the campaign and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              disabled={loading}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={onDelete}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCampaignDialog;
