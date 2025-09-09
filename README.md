# Tech-Hub-eCommerce-Nestjs

## Category Module Changes (Task)

### Overview
The Category module was recently updated to support full CRUD operations with validation and error handling. The changes include:

#### Features
- **Create Category**: Adds a new category with unique name validation.
- **Get Categories**: Supports pagination with `offset` and `limit` query parameters.
- **Get Category by ID**: Fetches a single category by its ID.
- **Update Category**: Updates category details, checks for unique name conflicts.
- **Delete Category**: Removes a category by ID.

#### Validation & Error Handling
- Uses DTOs for input validation (`CreateCategoryDto`, `UpdateCategoryDto`).
- Throws `ConflictException` if category name already exists.
- Throws `NotFoundException` if category is not found.

#### Entity
- The `Category` entity includes fields: `id`, `name`, `description`, `createdAt`, and `updatedAt`.

#### Example Endpoints
- `POST /categories` — Create category
- `GET /categories` — List categories
- `GET /categories/:id` — Get category by ID
- `PUT /categories/:id` — Update category
- `DELETE /categories/:id` — Delete category

---
_This task documents the recent changes and improvements to the Category module._
