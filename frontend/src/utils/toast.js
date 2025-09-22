// Simple toast manager without context
let toastContainer = null;
let toastId = 0;

// Create toast container if it doesn't exist
const createToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-20 right-4 z-50 space-y-3';
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

// Create individual toast element
const createToastElement = (message, type = 'success', duration = 3000) => {
  const container = createToastContainer();
  const id = ++toastId;
  
  const toast = document.createElement('div');
  toast.id = `toast-${id}`;
  
  // Base styles
  const baseStyles = 'px-6 py-4 border shadow-lg transition-all duration-300 ease-in-out transform max-w-sm bg-white';
  
  // Type-specific styles
  let typeStyles = '';
  let icon = '';
  
  switch (type) {
    case 'success':
      typeStyles = 'border-gray-700 text-gray-800';
      icon = `
        <div class="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center mr-3">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      `;
      break;
    case 'error':
      typeStyles = 'border-red-500 text-red-700';
      icon = `
        <div class="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mr-3">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      `;
      break;
    case 'info':
      typeStyles = 'border-gray-500 text-gray-700';
      icon = `
        <div class="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center mr-3">
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
      `;
      break;
  }
  
  toast.className = `${baseStyles} ${typeStyles} translate-x-full opacity-0`;
  toast.innerHTML = `
    <div class="flex items-center">
      ${icon}
      <div class="flex-1">
        <p class="text-sm font-medium">${message}</p>
      </div>
      <button class="ml-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" onclick="removeToast('${id}')">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.className = `${baseStyles} ${typeStyles} translate-x-0 opacity-100`;
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    removeToast(id);
  }, duration);
  
  return id;
};

// Remove toast function (make it global so onclick can access it)
window.removeToast = (id) => {
  const toast = document.getElementById(`toast-${id}`);
  if (toast) {
    toast.className = toast.className.replace('translate-x-0 opacity-100', 'translate-x-full opacity-0');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
};

// Export toast functions
export const toast = {
  success: (message, duration = 3000) => createToastElement(message, 'success', duration),
  error: (message, duration = 3000) => createToastElement(message, 'error', duration),
  info: (message, duration = 3000) => createToastElement(message, 'info', duration),
};

export default toast;