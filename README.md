# Tech-Hub-eCommerce-Nestjs

## Project Description

Tech-Hub-eCommerce-Nestjs is a backend API for an e-commerce platform built with NestJS, TypeORM, and PostgreSQL. The project provides a robust foundation for managing products, categories, users, and product images, with advanced features such as file uploads, validation, and database relationships.

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

1. **Install dependencies:**  
   `npm install`
2. **Configure database:**  
   Update the PostgreSQL connection settings in `src/app.module.ts`.
3. **Run the application:**  
   `npm run start:dev`
4. **Access API:**  
   The server runs on `http://localhost:3001` by default.

### Folder Structure

- `src/products/` — Product module, controller, service, entities, DTOs
- `src/category/` — Category module, controller, service, entities, DTOs
- `src/users/` — User module, controller, service, entities, DTOs
- `uploads/` — Directory for uploaded images

### Author

This project was developed as a student assignment to demonstrate backend development skills with NestJS, TypeORM, and file upload handling.
