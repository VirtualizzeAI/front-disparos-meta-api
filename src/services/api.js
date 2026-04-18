
// API Configuration
// Fabrica Neural Webhook URL
export const API_CONFIG = {
    BASE_URL: 'https://auto.fabricaneural.ia.br/webhook', // Production webhook URL
    ENDPOINTS: {
        // Authentication endpoints
        LOGIN: '/login',
        LOGOUT: '/auth-logout',

        // Blast endpoints
        LIST_BLASTS: '/listar-disparos',
        CREATE_BLAST: '/blasts-create',
        GET_BLAST: '/blasts-get', // Send blast ID in request body

        // Profile endpoints
        PROFILE: '/profile',
        UPDATE_PROFILE: '/profile-update',
        CHANGE_PASSWORD: '/profile-change-password',

        // WABA configuration endpoints
        WABA_CONFIG: '/waba-config',
        UPDATE_WABA: '/waba-config',
        GET_WABA_CONFIG: '/get-waba-config',

        // Templates endpoint
        TEMPLATES: '/templates'
    }
};

// Helper function to build full API URL
export function getApiUrl(endpoint) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Helper function to get authentication credentials
export function getAuthCredentials() {
    const token = localStorage.getItem('authToken') || '';
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? parseInt(userIdStr) : null;

    return { token, userId };
}

// Helper function to add auth credentials to request body
// This automatically includes token and userId in all API calls
export function addAuthToBody(body = {}) {
    const auth = getAuthCredentials();
    return {
        ...body,
        token: auth.token,
        userId: auth.userId
    };
}

// Helper function to make API calls with automatic auth injection
// NOTE: All data (IDs, tokens, userId, etc.) are sent in the request BODY
// This is required for webhook compatibility (webhooks don't accept query parameters)
// Token and userId are automatically added to all requests
export async function apiCall(endpoint, options = {}) {
    const url = getApiUrl(endpoint);

    // Prepare body with auth credentials
    let bodyData = options.body;

    if (bodyData) {
        // If body is a string (JSON), parse it, add auth, and stringify again
        if (typeof bodyData === 'string') {
            try {
                const parsed = JSON.parse(bodyData);
                bodyData = JSON.stringify(addAuthToBody(parsed));
            } catch (e) {
                // If not valid JSON, leave as is
                console.warn('Body is not valid JSON, auth not added');
            }
        }
        // If body is an object, add auth and stringify
        else if (typeof bodyData === 'object' && !(bodyData instanceof FormData)) {
            bodyData = JSON.stringify(addAuthToBody(bodyData));
        }
        // If FormData, we can't easily add auth here - handle separately
    } else {
        // No body provided, create one with just auth
        bodyData = JSON.stringify(getAuthCredentials());
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        },
    };

    const config = {
        ...defaultOptions,
        ...options,
        body: bodyData,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
