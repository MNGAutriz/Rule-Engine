import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/common';
import { AlertTriangle, X, Trash2, Settings } from 'lucide-react';
import { type Rule } from '@/services/api';

interface DeleteRuleDialogProps {
  rule: Rule;
  onDelete: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteRuleDialog: React.FC<DeleteRuleDialogProps> = ({
  rule,
  onDelete,
  onCancel,
  loading = false
}) => {
  const getCategoryLabel = (category?: string) => {
    const categories: { [key: string]: string } = {
      transaction: 'Transaction Rules',
      consumer: 'Consumer Attribute Rules',
      product: 'Product Multiplier Rules',
      basket: 'Basket Threshold Rules'
    };
    return categories[category || ''] || category || 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Delete Rule</h2>
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
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
              <Settings className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are you sure you want to delete this rule?
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Name:</span>
                    <span className="text-sm text-gray-900 font-semibold">{rule.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Category:</span>
                    <span className="text-sm text-gray-900">{getCategoryLabel(rule.category)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Priority:</span>
                    <span className="text-sm text-gray-900">{rule.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`text-sm font-medium ${rule.active !== false ? 'text-green-600' : 'text-gray-500'}`}>
                      {rule.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {rule.id && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">ID:</span>
                      <span className="text-sm text-gray-900 font-mono">{rule.id}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important consequences:</p>
                    <ul className="text-xs space-y-1 text-yellow-700">
                      <li>• This rule will be permanently removed from the rules engine</li>
                      <li>• Any events that depend on this rule will no longer trigger</li>
                      <li>• Points calculations may be affected for future transactions</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Please confirm that you want to permanently delete this rule. This will remove it from 
                the <span className="font-semibold">{rule.category}</span> category and it will no longer 
                be available for processing events.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex items-center gap-2"
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={onDelete}
            loading={loading}
            className="bg-red-600 hover:bg-red-700 text-white border-0 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Rule
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default DeleteRuleDialog;
