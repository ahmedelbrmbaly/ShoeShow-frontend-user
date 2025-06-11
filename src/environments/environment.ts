export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081',
  get imageBaseUrl() {
    return this.apiUrl;
  }
};

