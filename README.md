# 📖 BookStore

A production-ready e-commerce web application for discovering, managing, and purchasing books.

## 📌 Project Overview

BookStore is a full-stack e-commerce application developed with Next.js, React, TypeScript, Tailwind CSS, and DynamoDB.

The application provides a complete online bookstore experience, including product browsing, search and filtering, book details, shopping cart management, wishlist management, user authentication, order management, and database integration.

The project was designed with a focus on clean architecture, reusable components, API development, business logic, validation, error handling, and maintainability.

---

## ✨ Features

### Storefront

* Responsive homepage
* Navigation bar
* Book collection
* Categories
* Book search
* Category filtering
* Sorting
* Book details
* Similar books
* Responsive design

### Shopping Cart

* Add books to cart
* Increase or decrease quantity
* Remove books
* Prevent duplicate cart entries
* Calculate subtotal
* Checkout workflow

### Wishlist

* Add books to wishlist
* Remove books from wishlist
* Wishlist persistence during the application session
* Prevent duplicate wishlist entries

### Users

* User registration
* User sign in
* User data management
* Authentication validation
* Protected checkout workflow

### Orders

* Create orders
* Store order information
* Retrieve user orders
* Display order history

### Validation & Error Handling

* Form validation
* API validation
* Error handling
* Empty states
* Loading states
* Custom 404 page
* Invalid request handling

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* HTML5
* CSS3

### Backend

* Next.js Route Handlers
* Node.js
* TypeScript

### Database

* Amazon DynamoDB
* DynamoDB Local for local development
* AWS SDK for JavaScript

### Development Tools

* Visual Studio Code
* Git
* GitHub
* npm

---

## 🏗️ Architecture

The application follows a layered architecture:

```text
User
  ↓
Next.js / React UI
  ↓
Components & Client Logic
  ↓
Next.js API Route Handlers
  ↓
Business Logic
  ↓
DynamoDB
```

The main layers are separated into:

* UI components
* Pages
* Client-side state management
* API routes
* Business logic
* Database access
* Type definitions
* Environment configuration

This structure helps keep the application maintainable and easier to extend.

---

## 📂 Project Structure

```text
bookstore/
│
├── app/
│   ├── api/
│   │   ├── users/
│   │   ├── books/
│   │   ├── cart/
│   │   ├── wishlist/
│   │   └── orders/
│   │
│   ├── books/
│   ├── categories/
│   ├── cart/
│   ├── wishlist/
│   ├── checkout/
│   ├── signin/
│   ├── signup/
│   ├── orders/
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── Navbar.tsx
│   ├── CartContext.tsx
│   ├── WishlistContext.tsx
│   └── ...
│
├── public/
│   └── books/
│
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.ts
├── README.md
└── ...
```

---

## 🗄️ Database Design

DynamoDB is used as the application's database.

The database stores information related to:

* Users
* Books / Products
* Categories
* Cart data
* Wishlist data
* Orders

The application communicates with DynamoDB through the AWS SDK.

For local development, DynamoDB Local is used instead of requiring a production AWS account.

---

## 🔐 Environment Variables

Sensitive configuration is stored in environment variables instead of being hardcoded in the application.

Example:

```env
AWS_REGION=local
DYNAMODB_ENDPOINT=http://localhost:8000
```

Additional environment variables can be configured according to the local or production environment.

> `.env.local` should not be committed to GitHub.

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd bookstore
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
AWS_REGION=local
DYNAMODB_ENDPOINT=http://localhost:8000
```

### 4. Start DynamoDB Local

Make sure DynamoDB Local is running on:

```text
http://localhost:8000
```

### 5. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 🧪 Testing

The application was tested during development through:

* Browser testing
* API endpoint testing
* Form validation testing
* Cart functionality testing
* Wishlist functionality testing
* Authentication testing
* Order functionality testing
* DynamoDB verification
* Error and 404 page testing
* Production build verification

The production build can be verified with:

```bash
npm run build
```

---

## 🔌 API

The application uses Next.js Route Handlers to expose backend API endpoints.

The API layer is responsible for:

* User operations
* Product/book operations
* Cart operations
* Wishlist operations
* Order operations
* Database communication
* Validation
* Error handling

The API keeps database operations separated from the user interface.

---

## 📱 Responsive Design

The application is designed to work across different screen sizes, including:

* Desktop
* Tablet
* Mobile

Tailwind CSS is used to implement responsive layouts and reusable styling.

---

## ⚠️ Error Handling

The application includes handling for common error scenarios such as:

* Invalid form input
* Missing data
* Invalid API requests
* Empty collections
* Missing products
* Invalid pages
* Database/API errors

A custom 404 page is also provided for unavailable routes.

---

## 🔒 Security Considerations

The project follows basic security practices including:

* Environment variables for configuration
* No hardcoded credentials
* Server-side database communication
* Input validation
* API error handling
* Separation between frontend and database layers

---

## 🌱 Git Workflow

Git is used for version control.

The project is organized into meaningful commits describing major development stages such as:

* Initial project setup
* Storefront development
* Cart implementation
* Wishlist implementation
* Authentication
* API development
* DynamoDB integration
* Error handling
* Final improvements

---

## 📸 Screenshots

Screenshots demonstrating the main features of the application are included in the project documentation.

Recommended screenshots:

* Homepage
* Books collection
* Book details
* Search and filtering
* Shopping cart
* Wishlist
* Authentication
* Orders
* 404 page

---

## 📋 Project Requirements

The project covers the main requirements of a production-ready e-commerce application:

* Responsive storefront
* Product catalog
* Categories
* Search and filtering
* Product details
* Similar products
* User management
* Shopping cart
* Wishlist
* Order management
* API development
* Database integration
* Validation
* Error handling
* 404 page
* Responsive UI
* Environment configuration
* Git version control
* Documentation

---

## 👩‍💻 Author

**Djamila Djebra**

Software Engineering Intern

---

## 📄 License

This project was developed as part of a software engineering internship project.
