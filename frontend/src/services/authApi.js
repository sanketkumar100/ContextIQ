import { apiClient } from './api';

export const authApi = {
  /**
   * POST /api/v1/auth/login — raw LoginResponse ({ accessToken, user })
   */
  async login(username, password) {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * POST /api/v1/auth/register — raw UserDto ({ id, username, email, role })
   */
  async register(username, email, password) {
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },
};
