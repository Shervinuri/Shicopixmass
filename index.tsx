import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// SAFETY: Error Boundary to catch render crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
            color: '#FFD700', 
            background: '#0a0a0a', 
            padding: '20px', 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{fontSize: '2rem', marginBottom: '10px'}}>⚠️ SHΞN™ System Malfunction</h1>
            <p style={{marginBottom: '20px', color: '#ccc'}}>The elves dropped a byte. Please reload.</p>
            <pre style={{color: '#DC143C', background: '#000', padding: '10px', borderRadius: '5px', maxWidth: '80%', overflow: 'auto'}}>
                {this.state.error?.message}
            </pre>
            <button 
                onClick={() => window.location.reload()} 
                style={{
                    marginTop: '30px', 
                    padding: '12px 24px', 
                    background: 'linear-gradient(to right, #DC143C, #8B0000)', 
                    color: 'white', 
                    border: '1px solid #FFD700', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                REBOOT SYSTEM
            </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
  </React.StrictMode>
);