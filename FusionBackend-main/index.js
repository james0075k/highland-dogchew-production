import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';

import errorMiddleware from './src/middlewares/ErrorMiddleware/errorMiddleware.js';
import Connection from './src/config/Connection.js';
import LogoRoute from './src/routes/LogoRoute.js';
import testimonialRoute from './src/routes/testimonialRoute.js';
import faqRoute from './src/routes/faqRoute.js';
import partnerRoute from './src/routes/partnerRoute.js';
import blogRoute from './src/routes/blogRoute.js';
import destinationRoute from './src/routes/destionationRoute.js';
import statRoute from './src/routes/statRoute.js';
import contactRoute from './src/routes/contactRoute.js';
import heroBannerRoute from './src/routes/heroBannerRoute.js';
import tourPackageRoute from './src/routes/tourPackageRoute.js';
import BookingRoute from './src/routes/bookingRoute.js';
import ReviewRoute from './src/routes/reviewRoute.js';
import adminRoute from './src/routes/adminRoute.js';
import teamRoute from './src/routes/teamRoute.js';
import activityRoute from './src/routes/activityRoutes.js';
import tourCategoryRoute from './src/routes/tourCategoryRoutes.js';
import paymentRoute from './src/routes/paymentRoute.js';
import blogCategory from './src/routes/blogCategoryRoute.js';
import contactinfoRoute from './src/routes/contactinfoRoute.js';
import privateTripRoute from './src/routes/privatetripRoute.js';
import termsRoute from './src/routes/termsRoute.js';
import productRoute from './src/routes/productRoute.js';
import varietyRoute from './src/routes/varietyRoute.js';
import cartPaymentRoute from './src/routes/cartPaymentRoute.js';
import promoCodeRoute from './src/routes/promoCodeRoute.js';
import orderRoute from './src/routes/orderRoute.js';
import productWebhookRoute from './src/routes/productWebhookRoute.js';
import newsletterRoute from './src/routes/newsletterRoute.js';
import instagramPostRoute from './src/routes/instagramPostRoute.js';
import instagramRoute from './src/routes/instagramRoute.js';




dotenv.config();

const app = express();
const api = process.env.API_URL || 'api'; 


const port = process.env.PORT ;


app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://dogchewuk.vercel.app', 'https://highlanddogchew.co.uk'],  // Your frontend origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

// Webhook route MUST be before express.json() — Stripe needs raw body
app.use(`/${api}/webhook`, productWebhookRoute);

app.use(express.json({
  limit: '1000mb',      
  parameterLimit: 100000,
}));

app.use(express.urlencoded({ 
  limit: '1000mb',        
  extended: true,
  parameterLimit: 100000
}));



// Debugging middleware
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

  
  app.use((req, res, next) => {
  if (req.headers['content-length']) {
    const size = parseInt(req.headers['content-length']);
    console.log(`Request size: ${(size / 1024 / 1024).toFixed(2)}MB`);
    
    // Log if request is too large
    if (size > 1000 * 1024 * 1024) {
      console.log('WARNING: Request exceeds 1GB');
    }
  }
  next();
});

app.use(`/${api}/logo`, LogoRoute);
app.use(`/${api}/testimonials`, testimonialRoute);
app.use(`/${api}/faqs`, faqRoute);
app.use(`/${api}/partners`, partnerRoute);
app.use(`/${api}/blogs`, blogRoute);
app.use(`/${api}/destinations`, destinationRoute);
app.use(`/${api}/stats`, statRoute);  
app.use(`/${api}/contact`, contactRoute);
app.use(`/${api}/herobanner`, heroBannerRoute);
app.use(`/${api}/tour/tour-packages`, tourPackageRoute  );
app.use(`/${api}/tour/bookings`, BookingRoute);
app.use(`/${api}/reviews`, ReviewRoute);
app.use(`/${api}/admin`, adminRoute);
app.use(`/${api}/teams`, teamRoute);
app.use(`/${api}/activities`, activityRoute);
app.use(`/${api}/category/activities`, tourCategoryRoute);
app.use(`/${api}/payments`, paymentRoute);
app.use(`/${api}/category/blogs`, blogCategory);
app.use(`/${api}/info`, contactinfoRoute);
app.use(`/${api}/privatetrip`, privateTripRoute);
app.use(`/${api}/terms`, termsRoute);
app.use(`/${api}/products`, productRoute);
app.use(`/${api}/variety`, varietyRoute);
app.use(`/${api}/cart-payments`, cartPaymentRoute);
app.use(`/${api}/promo`, promoCodeRoute);
app.use(`/${api}/orders`, orderRoute);
app.use(`/${api}/newsletter`, newsletterRoute);
app.use(`/${api}/instagram-posts`, instagramPostRoute);
app.use(`/${api}/instagram`, instagramRoute);


//error middleware route pachi
app.use(errorMiddleware)




// Database connection
Connection(); 


app.listen(port, ()=>{
    console.log(`Hamro Kam port ${port} ma chaldai xa`)
})



