export const environment = {
  production: true,
  apiUrl: 'https://api.shoeshow.com',  // Replace this with your actual production API domain
  get imageBaseUrl() {
    return this.apiUrl;
  }
};

