# Request Cancellation Implementation Guide

This document outlines the comprehensive request cancellation implementation for the ANAM Gallery application to prevent memory leaks and race conditions.

## Overview

Request cancellation has been implemented throughout the application using:
- AbortController for native fetch requests
- Custom hooks with built-in cancellation support
- Proper cleanup in useEffect hooks
- Graceful error handling for cancelled requests

## Core Implementation

### 1. Custom Hooks with Cancellation Support

#### `useApiRequest` Hook
Located in `/hooks/use-api-request.ts`

```typescript
// Basic usage
const { data, loading, error, cancel, retry } = useApiRequest(
  async (signal) => {
    const response = await fetch('/api/endpoint', { signal })
    return response.json()
  },
  { immediate: true, retryAttempts: 2 }
)
```

**Features:**
- Automatic request cancellation on unmount
- Built-in retry logic with exponential backoff
- Loading state management
- Error handling with AbortError detection
- Focus revalidation support

#### `useFetch` Hook
Specialized hook for simple API calls:

```typescript
const { data, loading, error, retry } = useFetch<DataType>('/api/endpoint', {
  immediate: true,
  revalidateOnFocus: true,
  retryAttempts: 2
})
```

#### Domain-Specific Hooks
- `useArtworks()` - Fetch artworks with cancellation
- `useArtist()` - Fetch artist data with cancellation
- `useRandomArtworks()` - Fetch random artworks with cancellation
- `useExhibitions()` - Fetch exhibition data with cancellation

### 2. Manual Request Cancellation

For components that need direct control over fetch requests:

```typescript
export function MyComponent() {
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSubmit = async () => {
    // Cancel existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new controller
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        signal: abortControllerRef.current.signal,
        // ... other options
      })
      
      const data = await response.json()
      // Handle success
    } catch (error) {
      // Handle AbortError
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled')
        return
      }
      // Handle other errors
    } finally {
      abortControllerRef.current = null
    }
  }
}
```

### 3. Error Recovery Component

The `ApiErrorRecovery` component provides user-friendly error handling:

```typescript
<ApiErrorRecovery
  error={error}
  onRetry={retry}
  loading={loading}
  showNetworkStatus={true}
/>
```

**Features:**
- Network status detection
- Retry button with loading state
- Retry attempt counter
- Contextual error messages

## Updated Components

### 1. HomePage (`/app/page.tsx`)
- Replaced manual fetch logic with `useArtworks()` and `useArtist()` hooks
- Automatic cancellation on component unmount
- Fallback to static data on API failure
- Proper null checking for artwork arrays

### 2. ContactInfo (`/components/contact-info.tsx`)
- Uses `useArtist()` hook for automatic cancellation
- Retry functionality for failed requests
- Loading and error states

### 3. ContactForm (`/components/contact-form.tsx`)
- AbortController implementation for form submissions
- Request cancellation on component unmount
- Proper error handling for cancelled requests

### 4. ContactSection (`/components/single-page/ContactSection.tsx`)
- Request cancellation for contact form submissions
- Cleanup on unmount
- AbortError handling

### 5. EnhancedGalleryComponent (Example)
- Demonstrates comprehensive cancellation implementation
- Multiple API calls with coordinated cancellation
- Search and filter functionality with debouncing
- Error recovery and retry mechanisms

## Best Practices

### 1. Always Use AbortSignal
```typescript
// ✅ Good
const response = await fetch('/api/endpoint', {
  signal: abortController.signal
})

// ❌ Bad
const response = await fetch('/api/endpoint')
```

### 2. Handle AbortError Gracefully
```typescript
catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    // Request was cancelled - this is expected
    return
  }
  // Handle actual errors
  setError(error.message)
}
```

### 3. Cleanup on Unmount
```typescript
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }
}, [])
```

### 4. Cancel Previous Requests
```typescript
const handleNewRequest = async () => {
  // Cancel any existing request first
  if (abortControllerRef.current) {
    abortControllerRef.current.abort()
  }
  
  abortControllerRef.current = new AbortController()
  // ... make new request
}
```

### 5. Use Custom Hooks When Possible
```typescript
// ✅ Preferred
const { data, loading, error } = useArtworks()

// ❌ Manual implementation (only when necessary)
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
// ... manual fetch logic
```

## Performance Benefits

### Memory Leak Prevention
- Automatic cleanup prevents memory leaks from pending requests
- Component unmounting cancels all associated requests
- Prevents setState calls on unmounted components

### Race Condition Prevention
- Sequential requests are properly cancelled
- Only the latest request updates the UI state
- Form submissions cancel previous pending submissions

### Improved User Experience
- Faster navigation (cancelled requests don't consume bandwidth)
- Immediate response to user actions
- Better error handling with retry mechanisms

## Testing Considerations

### 1. Test Cancellation Behavior
```typescript
it('should cancel request on unmount', async () => {
  const { unmount } = render(<Component />)
  
  // Trigger request
  // Unmount before completion
  unmount()
  
  // Verify no state updates after unmount
})
```

### 2. Test Error Handling
```typescript
it('should handle AbortError gracefully', async () => {
  // Mock AbortError
  global.fetch = jest.fn(() => 
    Promise.reject(new DOMException('Aborted', 'AbortError'))
  )
  
  // Verify no error state is set for AbortError
})
```

### 3. Test Retry Functionality
```typescript
it('should retry failed requests', async () => {
  // Mock failed then successful response
  // Verify retry mechanism works
})
```

## Migration Guide

### For Existing Components

1. **Identify fetch calls**: Find all `fetch()` calls in components
2. **Add AbortController**: Implement AbortController pattern
3. **Add cleanup**: Include useEffect cleanup
4. **Handle AbortError**: Add proper error handling
5. **Consider custom hooks**: Replace with domain-specific hooks where applicable

### Example Migration

**Before:**
```typescript
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(setData)
    .catch(setError)
}, [])
```

**After:**
```typescript
const { data, error } = useFetch('/api/data')

useEffect(() => {
  if (data) setData(data)
  if (error) setError(error)
}, [data, error])
```

## Conclusion

This implementation provides:
- ✅ Memory leak prevention
- ✅ Race condition prevention  
- ✅ Improved user experience
- ✅ Proper error handling
- ✅ Reusable patterns
- ✅ Testing support

All major components now support request cancellation, making the application more robust and user-friendly.