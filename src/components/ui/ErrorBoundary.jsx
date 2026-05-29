import React from 'react';
import Card from './Card.jsx';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card>
          <h2 className="text-lg font-bold text-rose-600">Something went wrong</h2>
          <p className="mt-1 text-sm text-slate-500">Refresh the page or contact administrator.</p>
        </Card>
      );
    }
    return this.props.children;
  }
}
