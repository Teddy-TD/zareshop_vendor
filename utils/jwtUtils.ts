// Simple JWT decoder (without verification since we trust our own tokens)
export const decodeJWT = (token: string) => {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const extractUserFromToken = (token: string) => {
  const decoded = decodeJWT(token);
  if (decoded && decoded.id && decoded.type) {
    return {
      id: decoded.id.toString(),
      type: decoded.type,
    };
  }
  return null;
};
