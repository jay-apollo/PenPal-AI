import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Upload, File, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecipientImportProps {
  onImport: (recipients: any[]) => Promise<void>;
  onCancel: () => void;
}

export function RecipientImport({ onImport, onCancel }: RecipientImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      return;
    }
    
    // Check file type
    if (selectedFile.type !== 'text/csv' && 
        !selectedFile.name.endsWith('.csv') &&
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        !selectedFile.name.endsWith('.xlsx')) {
      setError("Please upload a CSV or Excel file");
      return;
    }
    
    setFile(selectedFile);
    parseFile(selectedFile);
  };
  
  // Parse the uploaded file
  const parseFile = (file: File) => {
    setIsProcessing(true);
    
    // In a real implementation, we would parse CSV or Excel data here
    // For this prototype, we'll simulate parsing with a timeout
    setTimeout(() => {
      // Simulate parsed data
      const mockParsedData = [
        { firstName: "John", lastName: "Doe", company: "Acme Inc", email: "john@example.com" },
        { firstName: "Jane", lastName: "Smith", company: "XYZ Corp", email: "jane@example.com" },
        // Add more mock data as needed
      ];
      
      setPreviewData(mockParsedData);
      setIsProcessing(false);
    }, 1000);
  };
  
  // Handle the import action
  const handleImport = async () => {
    if (!previewData) return;
    
    setIsProcessing(true);
    try {
      await onImport(previewData);
    } catch (err) {
      setError((err as Error).message || "Failed to import recipients");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!file ? (
        // File upload state
        <div className="border-2 border-dashed border-primary/20 rounded-lg p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-primary/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Recipients</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
            Upload a CSV or Excel file with your recipients' data. 
            The file should include columns for name, email, and address details.
          </p>
          
          <input
            type="file"
            id="file-upload"
            className="sr-only"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button type="button" variant="outline" className="mr-2" asChild>
              <span>
                <File className="h-4 w-4 mr-2" />
                Select File
              </span>
            </Button>
          </label>
          
          <div className="mt-6 text-xs text-neutral-500">
            <a href="#" className="text-primary">Download template file</a>
          </div>
        </div>
      ) : (
        // File preview state
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <File className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium text-sm">{file.name}</span>
              <span className="ml-2 text-xs text-neutral-500">
                ({Math.round(file.size / 1024)} KB)
              </span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => {
              setFile(null);
              setPreviewData(null);
            }}>
              Change File
            </Button>
          </div>
          
          {isProcessing && !previewData ? (
            <div className="flex justify-center py-8">
              <Spinner />
              <span className="ml-2">Processing file...</span>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {previewData && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Preview ({previewData.length} recipients found)</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            First Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Last Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {previewData.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{item.firstName}</td>
                            <td className="px-4 py-2 text-sm">{item.lastName}</td>
                            <td className="px-4 py-2 text-sm">{item.company}</td>
                            <td className="px-4 py-2 text-sm">{item.email}</td>
                          </tr>
                        ))}
                        {previewData.length > 5 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-2 text-sm text-neutral-500 text-center">
                              + {previewData.length - 5} more recipients
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleImport}
          disabled={!previewData || isProcessing}
        >
          {isProcessing && <Spinner size="sm" className="mr-2" />}
          Import Recipients
        </Button>
      </div>
    </div>
  );
}