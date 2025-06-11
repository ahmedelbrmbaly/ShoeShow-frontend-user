export const environment = {
  production: false,
  // apiUrl: 'http://localhost:8081',
  apiUrl: 'http://185.69.166.150/',
  get imageBaseUrl() {
    return this.apiUrl;
  }
};

