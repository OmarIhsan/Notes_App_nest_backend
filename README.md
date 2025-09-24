# Document Annotation Backend

## Project Description

Document Annotation Backend is a comprehensive API built with NestJS, TypeORM, and PostgreSQL. It provides a robust foundation for document annotation and management, with user subscriptions, category-based organization, and annotation features.

### Key Features

- **Product Management:** Full CRUD operations for products, including support for multiple images per product.
- **Category Management:** Create, update, delete, and list categories, each with optional image upload.
- **User Management:** Register, update, and delete users with role-based access (Admin, Customer, Super Admin).
- **File Uploads:** Secure image upload for products and categories using Multer, with file size validation and unique naming.
- **Database Relationships:** Products are linked to categories, and each product can have multiple images (gallery support).
- **Validation:** All input data is validated using class-validator and class-transformer, ensuring data integrity and type safety.
- **Error Handling:** Comprehensive error responses for conflicts, missing entities, and invalid data.
- **Static File Serving:** Uploaded images are served via HTTP for easy access in front-end applications.
- **Pagination:** List endpoints for products, categories, and users support pagination for efficient data retrieval.

### Technologies Used

- **NestJS:** Modular, scalable Node.js framework for building efficient server-side applications.
- **TypeORM:** Powerful ORM for TypeScript and JavaScript, used for database modeling and queries.
- **PostgreSQL:** Reliable, open-source relational database.
- **Multer:** Middleware for handling multipart/form-data, primarily used for file uploads.
- **Class-Validator & Class-Transformer:** Libraries for validating and transforming incoming request data.

### API Endpoints

#### Categories
- `POST /categories` — Create category with image upload
- `GET /categories` — List categories with pagination
- `GET /categories/:id` — Get category by ID
- `PUT /categories/:id` — Update category
- `DELETE /categories/:id` — Delete category

#### Products
- `POST /products` — Create product with image upload
- `GET /products` — List products with category relations
- `GET /products/:id` — Get product by ID with category
- `PUT /products/:id` — Update product
- `DELETE /products/:id` — Delete product

#### Users
- `POST /users` — Create user
- `GET /users` — List users with pagination
- `GET /users/:id` — Get user by ID
- `PUT /users/:id` — Update user
- `DELETE /users/:id` — Delete user

### How It Works

- **Product Images:** Each product can have multiple images, managed via the `ProductImage` entity. Images are uploaded and stored in the `uploads/products/` directory.
- **Category Images:** Categories can have an optional image, stored in the `uploads/categories/` directory.
- **Validation:** All DTOs use decorators to enforce required fields, types, and constraints.
- **Error Handling:** The API returns clear error messages for invalid requests, duplicate entries, and missing resources.
- **Static Assets:** Uploaded images are accessible via `/uploads/` URLs.

### Getting Started

#### Local Development
1. **Install dependencies:**  
   ```bash
   npm install
   ```
2. **Configure environment variables:**  
   Copy `.env.example` to `.env` and update the database settings.
3. **Run the application:**  
   ```bash
   npm run start:dev
   ```
4. **Access API:**  
   The server runs on `http://localhost:3000` by default.

#### Vercel Deployment

This application is optimized for Vercel deployment with the following features:
- Serverless function architecture
- Environment variable configuration
- Compatible dependency versions

**Steps to deploy:**

1. **Connect to Vercel:**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Set Environment Variables:**
   Add these environment variables in your Vercel dashboard:
   ```
   JWT_SECRET=your-super-secure-production-jwt-secret
   JWT_EXPIRES_IN=24h
   DB_HOST=your-cloud-db-host
   DB_PORT=5432
   DB_USERNAME=your-db-username
   DB_PASSWORD=your-db-password
   DB_DATABASE=document_annotation_db
   NODE_ENV=production
   ```

3. **Database Setup:**
   Use a cloud PostgreSQL service like:
   - [Supabase](https://supabase.com/)
   - [Railway](https://railway.app/)
   - [Neon](https://neon.tech/)
   - [Aiven](https://aiven.io/)

4. **Deploy:**
   Vercel will automatically deploy when you push to your main branch.

### API Documentation

Once deployed, visit `/api/docs` for Swagger documentation.

### Folder Structure

- `src/auth/` — Authentication module (JWT, guards, strategies)
- `src/users/` — User management and profiles
- `src/category/` — Document categories and organization
- `src/subscriptions/` — User subscription management
- `api/` — Vercel serverless function entry point
- `uploads/` — File upload directory (for local development)

### Production Considerations

- File uploads in production should use cloud storage (AWS S3, Cloudinary, etc.)
- Database should be a managed PostgreSQL service
- Set proper CORS origins for your frontend domain
- Use strong JWT secrets and environment variables

### Author

Document Annotation Backend - A scalable solution for document management and annotation.
