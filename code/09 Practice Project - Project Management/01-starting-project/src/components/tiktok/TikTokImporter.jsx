import React, { useState } from 'react';
import Button from '../ui/Button';
import { readTextFile, parseTikTokList } from '../../utils/tiktokImport';

/**
 * TikTokImporter Component
 * 
 * Provides a UI for importing TikTok favorites from a text file.
 * 
 * @param {Object} props
 * @param {Function} props.onImport - Handler called with the parsed TikTok items
 * @param {Function} props.onCancel - Handler for canceling the import
 */
function TikTokImporter({ onImport, onCancel }) {
  const [file, setFile] = useState(null);
  const [previewItems, setPreviewItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError(null);
    setIsLoading(true);
    
    try {
      // Read the file content
      const content = await readTextFile(selectedFile);
      
      // Parse the TikTok list
      const items = parseTikTokList(content);
      
      if (items.length === 0) {
        setError('No valid TikTok entries found in the file. Check the format.');
        setPreviewItems([]);
      } else {
        setPreviewItems(items);
      }
    } catch (err) {
      setError(`Error reading file: ${err.message}`);
      setPreviewItems([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle import confirmation
  const handleConfirmImport = () => {
    if (previewItems.length === 0) {
      setError('No items to import.');
      return;
    }
    
    onImport(previewItems);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Import TikTok Favorites</h2>
      
      {/* File selection */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-2">Select File</h3>
        <div className="bg-black p-4 rounded">
          <p className="text-gray-400 mb-3 text-sm">
            Select a text file containing your TikTok favorites. 
            The file should have entries with date and URL/Link for each item.
          </p>
          
          <div className="bg-gray-900 p-3 rounded mb-3">
            <h4 className="text-sm font-medium text-white mb-1">Supported Formats:</h4>
            <div className="text-xs text-gray-400 space-y-2">
              <div>
                <strong>Format 1:</strong>
                <pre className="mt-1 bg-black p-2 rounded">
                  Date: 2023-05-15<br/>
                  URL: https://www.tiktok.com/...
                </pre>
              </div>
              <div>
                <strong>Format 2:</strong>
                <pre className="mt-1 bg-black p-2 rounded">
                  Date: 2023-05-15 22:51:47<br/>
                  Link: https://www.tiktokv.com/...
                </pre>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">Each entry should be separated by a blank line.</p>
          </div>
          
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-900 file:text-white hover:file:bg-red-800"
          />
          {error && (
            <p className="text-red-500 mt-2 text-sm">{error}</p>
          )}
        </div>
      </div>
      
      {/* Preview */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading file...</p>
        </div>
      ) : previewItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-2">Preview ({previewItems.length} items)</h3>
          <div className="bg-black p-4 rounded max-h-60 overflow-y-auto scrollbar-thin">
            <ul className="space-y-2">
              {previewItems.slice(0, 5).map((item, index) => (
                <li key={index} className="border-b border-gray-800 pb-2 last:border-b-0 last:pb-0">
                  <div className="text-white">{item.date}</div>
                  <div className="text-gray-400 text-sm truncate">{item.url}</div>
                </li>
              ))}
              {previewItems.length > 5 && (
                <li className="text-gray-500 italic text-sm">
                  ...and {previewItems.length - 5} more items
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirmImport}
          disabled={previewItems.length === 0}
        >
          Import {previewItems.length} Items
        </Button>
      </div>
    </div>
  );
}

export default TikTokImporter; 