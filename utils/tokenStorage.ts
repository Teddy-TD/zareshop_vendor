import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const tokenStorage = {
  // Store token and user data
  async setToken(token: string, user: any) {
    try {
      console.log('🔐 Storing token:', token ? 'Present' : 'Missing');
      console.log('👤 Storing user:', user);
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('✅ Token and user stored successfully');
    } catch (error) {
      console.error('❌ Error storing token:', error);
    }
  },

  // Get stored token
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('🔍 Retrieved token:', token ? 'Present' : 'Missing');
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  },

  // Get stored user data
  async getUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      const user = userData ? JSON.parse(userData) : null;
      console.log('👤 Retrieved user:', user);
      return user;
    } catch (error) {
      console.error('❌ Error getting user:', error);
      return null;
    }
  },

  // Remove token and user data
  async removeToken() {
    try {
      console.log('🗑️ Removing token and user data');
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      console.log('✅ Token and user data removed successfully');
    } catch (error) {
      console.error('❌ Error removing token:', error);
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const isAuth = !!token;
      console.log('🔐 Authentication check:', isAuth ? 'Authenticated' : 'Not authenticated');
      return isAuth;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  }
};
