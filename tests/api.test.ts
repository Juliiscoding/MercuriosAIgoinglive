import { ApiClient } from '../services/api';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeAll(() => {
    apiClient = ApiClient.getInstance();
  });

  it('should authenticate and return a token', async () => {
    const mockTokenResponse = {
      token: {
        token: {
          value: 'mockAccessToken',
          name: 'accessToken',
          expiresIn: 3600
        },
        refreshToken: {
          value: 'mockRefreshToken',
          name: 'refreshToken',
          expiresIn: 7200
        }
      },
      serverUrl: 'https://api.prohandel.de',
      requiredActions: []
    };

    mock.onPost('https://auth.prohandel.cloud/api/v4/token').reply(200, mockTokenResponse);

    await apiClient['authenticate'](); // Call the private method

    expect(apiClient['accessToken']).toBe('mockAccessToken');
    expect(apiClient['refreshToken']).toBe('mockRefreshToken');
  });
});
