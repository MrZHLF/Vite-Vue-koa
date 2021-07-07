const env = import.meta.env.MODE || 'prod'
const EnvConfig = {
  development:{
      baseApi:'/api',
      mockApi:'https://www.fastmock.site/mock/bf57ccb77960f2bafdebc74271cd98f4/api'
  },
  test:{
      baseApi:'//test.futurefe.com/api',
      mockApi:'https://www.fastmock.site/mock/bf57ccb77960f2bafdebc74271cd98f4/api'
  },
  prod:{
      baseApi:'//futurefe.com/api',
      mockApi:'https://www.fastmock.site/mock/bf57ccb77960f2bafdebc74271cd98f4/api'
  }
}
export default {
  env,
  mock: false,
  namespace:'manager',
  ...EnvConfig[env]
}