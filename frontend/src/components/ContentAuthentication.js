import React, { useState, useContext } from 'react';
import { AuthContext, API } from '../App';
import axios from 'axios';

const ContentAuthentication = () => {
  const { user } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, analyzing, completed
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
    } else {
      alert('Please select a valid image file (JPG, PNG, GIF, etc.)');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setUploadState('uploading');
      
      // Create FormData to properly send the image
      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadState('analyzing');
      
      const response = await axios.post(`${API}/content-authentication/analyze-image`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setAnalysisResult(response.data);
      setUploadState('completed');
    } catch (error) {
      console.error('Error analyzing image:', error);
      setUploadState('idle');
      alert('Error analyzing image. Please try again.');
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setUploadState('idle');
  };

  const getResultColor = () => {
    if (!analysisResult) return 'text-gray-600';
    return analysisResult.analysis.is_authentic ? 'text-green-600' : 'text-red-600';
  };

  const getResultIcon = () => {
    if (!analysisResult) return '❓';
    return analysisResult.analysis.is_authentic ? '✅' : '⚠️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Content Authentication</h1>
          <p className="text-gray-600">Upload an image to detect if it's authentic or AI-generated</p>
        </div>

        {/* Upload Interface */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {!selectedFile ? (
            /* File Upload Area */
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDrag}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
            >
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload an image for analysis</h3>
              <p className="text-gray-600 mb-4">Drag and drop your image here, or click to browse</p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose Image
              </label>
              <p className="text-sm text-gray-500 mt-4">Supports JPG, PNG, GIF, WebP (Max 10MB)</p>
            </div>
          ) : (
            /* Image Preview and Analysis */
            <div>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Uploaded Image</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Uploaded content"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">File:</span> {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Size:</span> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {selectedFile.type}
                    </p>
                  </div>
                </div>

                {/* Analysis Panel */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Analysis</h3>
                  
                  {uploadState === 'idle' && (
                    <div className="text-center p-8">
                      <button
                        onClick={handleAnalyze}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Analyze Image
                      </button>
                    </div>
                  )}

                  {uploadState === 'uploading' && (
                    <div className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Uploading image...</p>
                    </div>
                  )}

                  {uploadState === 'analyzing' && (
                    <div className="text-center p-8">
                      <div className="animate-pulse">
                        <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl">🧠</span>
                        </div>
                      </div>
                      <p className="text-gray-600">AI is analyzing the image...</p>
                      <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                    </div>
                  )}

                  {uploadState === 'completed' && analysisResult && (
                    <div className="space-y-6">
                      {/* Main Result */}
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <div className="text-4xl mb-2">{getResultIcon()}</div>
                        <h4 className={`text-2xl font-bold ${getResultColor()}`}>
                          {analysisResult.analysis.result}
                        </h4>
                        <p className="text-gray-600 mt-2">
                          Confidence: {(analysisResult.analysis.confidence * 100).toFixed(1)}%
                        </p>
                      </div>

                      {/* Analysis Details */}
                      <div>
                        <h5 className="font-semibold mb-3">Detection Indicators:</h5>
                        <ul className="space-y-2">
                          {analysisResult.analysis.indicators.map((indicator, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              <span className="text-gray-700">{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technical Info */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2">Technical Details:</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Processing Time: {analysisResult.processing_time.toFixed(2)}s</p>
                          <p>Model Version: {analysisResult.model_version}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Analyze Another Image
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Information Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
              <h4 className="font-medium mb-2">Upload</h4>
              <p className="text-gray-600">Upload your image for analysis</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <h4 className="font-medium mb-2">Analyze</h4>
              <p className="text-gray-600">AI examines pixel patterns and artifacts</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-medium mb-2">Results</h4>
              <p className="text-gray-600">Get detailed authenticity report</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAuthentication;