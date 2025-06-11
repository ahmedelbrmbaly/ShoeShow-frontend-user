export const environment = {
  production: true,
  apiUrl: 'http://185.69.166.150:8081',  // Replace this with your actual production API domain
  get imageBaseUrl() {
    return this.apiUrl;
  }
};

