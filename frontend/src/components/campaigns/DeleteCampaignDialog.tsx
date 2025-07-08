import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface Campaign {
  campaignCode: string;
  name: string;
  market: string;
  channel: string;
  brand: string;
  startDate: string;
  endDate: string;
  ruleIds: string[];
  priority?: number;
  description?: string;
  terms?: string;
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
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-15 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-gray-400 border-opacity-30 ring-1 ring-gray-300 ring-opacity-20">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Delete Campaign</h2>
              <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
            className="h-11 w-11 p-0 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-8 bg-white bg-opacity-10 backdrop-blur-md">
          <div className="space-y-6">
            <div className="bg-white bg-opacity-25 backdrop-blur-sm border-2 border-white border-opacity-40 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-2 text-lg">
                    Are you sure you want to delete this campaign?
                  </h3>
                  <p className="text-red-700 text-sm mb-4">
                    This will permanently remove the campaign from your system.
                  </p>
                  <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-600 border-opacity-30">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Code:</span>
                        <span className="text-sm font-mono text-gray-900 bg-white bg-opacity-50 px-3 py-1 rounded-xl backdrop-blur-sm">
                          {campaign.campaignCode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Name:</span>
                        <span className="text-sm text-gray-900 font-semibold">
                          {campaign.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Market:</span>
                        <span className="text-sm text-gray-900">
                          {campaign.market} • {campaign.channel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-gray-600 border-opacity-40 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  This action will permanently delete all campaign data and cannot be reversed.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
              className="h-12 px-8 rounded-2xl border-2 border-gray-700 hover:border-gray-900 hover:bg-white hover:bg-opacity-20 transition-colors backdrop-blur-sm"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={onDelete}
              disabled={loading}
              className="h-12 px-8 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 mr-3" />
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
