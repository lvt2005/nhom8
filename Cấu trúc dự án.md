.
├── E4-Mini-Blog-Platform/
├── ├── client/                       
├── │   ├── public/
├── │   │   ├── index.html
├── │   │   └── favicon.ico
├── │   │   └── ...
├── │   │
├── │   ├── src/
├── │   │   ├── assets/                  
├── │   │   │   └── images/
├── │   │   │
├── │   │   ├── components/             
├── │   │   │   ├── ui/                  
├── │   │   │   ├── layout/         
├── │   │   │   └── blog/             
├── │   │   │
├── │   │   ├── composables/       
├── │   │   │   ├── useAuth.js
├── │   │   │   ├── useBlog.js
├── │   │   │   └── useToast.js
├── │   │   │
├── │   │   ├── router/
├── │   │   │   ├── index.js
├── │   │   │   └── routes/
├── │   │   │       ├── auth.js
├── │   │   │       └── blog.js
├── │   │   │
├── │   │   ├── store/                
├── │   │   │   ├── index.js
├── │   │   │   ├── auth.js
├── │   │   │   └── blog.js
├── │   │   │
├── │   │   ├── views/          
├── │   │   │   ├── HomeView.vue
├── │   │   │   ├── LoginView.vue
├── │   │   │   ├── RegisterView.vue
├── │   │   │   ├── ProfileView.vue
├── │   │   │   ├── CreateBlog.vue
├── │   │   │   └── BlogDetail.vue
├── │   │   │
├── │   │   ├── styles/          
├── │   │   │   ├── main.scss
├── │   │   │   ├── variables.scss
├── │   │   │   └── tailwind.css
├── │   │   │
├── │   │   ├── App.vue
├── │   │   ├── main.js
├── │   │   └── router/index.js
├── │   │
├── │   ├── .env
├── │   ├── vite.config.js
├── │   ├── tailwind.config.js
├── │   ├── postcss.config.js
├── │   ├── package.json
├── │   └── index.html
├── │
├── ├── server/                         
├── │   ├── src/
├── │   │   ├── config/
├── │   │   │   └── db.js               
├── │   │   │
├── │   │   ├── controllers/
├── │   │   │   ├── authController.js    
├── │   │   │   └── blogController.js  
├── │   │   │
├── │   │   ├── middlewares/
├── │   │   │   ├── authMiddleware.js    
├── │   │   │   ├── errorHandler.js
├── │   │   │   └── upload.js           
├── │   │   │
├── │   │   ├── models/
├── │   │   │   ├── User.js
├── │   │   │   └── Blog.js
├── │   │   │
├── │   │   ├── routes/
├── │   │   │   ├── auth.js
├── │   │   │   └── blog.js
├── │   │   │
├── │   │   ├── utils/                  
├── │   │   │   └── cloudinary.js 
├── │   │   │
├── │   │   └── index.js                
├── │   │
├── │   ├── uploads/                    
├── │   │   └── ...
├── │   │
├── │   ├── .env
├── │   ├── seed.js                    
├── │   ├── package.json
├── │   └── package-lock.json
├── │
├── ├── postman_collection.json         
├── ├── start_project.bat               
└── └── README.md