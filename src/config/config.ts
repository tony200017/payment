export default () => ({
  database: { connectionString: process.env.MONGODB_CONNECTION_LINK },
  secrets: {
    jwtSecret: process.env.JWT_TOKEN_RANDOM_STRING,
    myFatoorahToken : process.env.MYFATOORAH_TOKEN,
  },
  baseUrl:{myFatoorah:'https://apitest.myfatoorah.com'}

});
