import { useState, useEffect } from 'react';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('https://api.minepi.com/v2');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Check if API key is already set in environment variables or localStorage
    const envApiKey = import.meta.env.VITE_PI_NETWORK_API_KEY;
    const envApiUrl = import.meta.env.VITE_PI_NETWORK_API_URL;
    const storedApiKey = localStorage.getItem('PI_NETWORK_API_KEY');
    const storedApiUrl = localStorage.getItem('PI_NETWORK_API_URL');
    
    if (envApiKey || storedApiKey) {
      setApiKey(envApiKey || storedApiKey || '');
      setIsConfigured(true);
    } else {
      // Pre-fill with default API key
      setApiKey('qiaosfanwgacik1zpzqykwnnxj1avnfch2ojhcjpsvcfmk2ximte6nzpbov74cfz');
    }
    
    if (envApiUrl || storedApiUrl) {
      setApiUrl(envApiUrl || storedApiUrl || 'https://api.minepi.com/v2');
    }
  }, []);

  const handleSaveConfig = () => {
    // Save to local storage
    localStorage.setItem('PI_NETWORK_API_KEY', apiKey);
    localStorage.setItem('PI_NETWORK_API_URL', apiUrl);
    
    // Update window.env for runtime access
    window.env = {
      ...window.env,
      VITE_PI_NETWORK_API_KEY: apiKey,
      VITE_PI_NETWORK_API_URL: apiUrl
    };
    
    setIsConfigured(true);
    onApiKeySet(apiKey);
  };

  if (isConfigured) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">API Configuration</h2>
        <p className="text-green-600 mb-2">✓ Pi Network API is configured</p>
        <button 
          onClick={() => setIsConfigured(false)}
          className="text-blue-500 hover:text-blue-700"
        >
          Change API settings
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-2">Configure Pi Network API</h2>
      <p className="text-gray-600 mb-4">
        To use this wallet with the Pi Network, you need to configure your API key.
      </p>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Pi Network API key"
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">API URL</label>
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="Enter the Pi Network API URL"
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        onClick={handleSaveConfig}
        disabled={!apiKey}
        className={`w-full py-2 rounded ${
          !apiKey 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Save API Configuration
      </button>
    </div>
  );
};

export default ApiKeySetup;
