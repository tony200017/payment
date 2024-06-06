export default () => ({
  database: { connectionString: process.env.MONGODB_CONNECTION_LINK },
  secrets: {
    jwtSecret: process.env.JWT_TOKEN_RANDOM_STRING,
    myFatoorahToken : process.env.MYFATOORAH_TOKEN,
  },
  baseUrl:{myFatoorah:process.env.MYFATOORAH_BASEURL}
  ,
  myFatoorahApi:{
    callBackUrl :  process.env.CALLBACK_URL,
    errorUrl : process.env.ERROR_URL,
    executePayment:'/v2/ExecutePayment',
    initialPayment:'/v2/InitiatePayment',
    getPaymentStatus:'/v2/getPaymentStatus'


  }

});
