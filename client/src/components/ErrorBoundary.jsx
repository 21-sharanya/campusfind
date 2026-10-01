// Component is the base class that every class component extends.
import { Component } from 'react'

// A CLASS component. Error boundaries can only be written as classes, because React has no hook for this.
export default class ErrorBoundary extends Component {
  // The constructor runs when the component is created. props are the values passed in.
  constructor(props) {
    // super(props) must be called first. It sets up the parent Component class.
    super(props)
    // Class components keep their data in this.state. hasError starts as false.
    this.state = { hasError: false }
    // Bind the method so "this" still points to this component when it's used as a click handler.
    this.handleReset = this.handleReset.bind(this)
  }

  // React calls this automatically when any child component throws an error while rendering.
  // Whatever it returns is merged into the state, so here it switches hasError on.
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  // Also called after an error. Used for side effects such as logging.
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack)
  }

  // Clears the error so the page tries to render normally again.
  handleReset() {
    this.setState({ hasError: false })
  }

  // render() decides what to show, as in every class component.
  render() {
    // If a child crashed, show a friendly message instead of a blank page.
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="mt-1 text-sm text-red-600">Please try again.</p>
          <button
            onClick={this.handleReset}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )
    }
    // No error, so just render whatever was placed inside <ErrorBoundary>...</ErrorBoundary>.
    return this.props.children
  }
}