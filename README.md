# 📚 BookStore

A full-stack e-commerce web application for discovering, managing, and purchasing books online.

BookStore provides a complete online bookstore experience for customers and a dedicated administration interface for managing the store.

## 📌 Project Overview

BookStore is a web application developed with Next.js, React, TypeScript, Tailwind CSS, and Amazon DynamoDB.

The application allows customers to browse books, explore categories, manage their shopping carts and wishlists, place orders, and contact the bookstore.

Administrators have access to a dedicated dashboard where they can manage books, categories, customers, orders, wishlists, contact messages, and their administrator profile.

## ✨ Features

### 👤 Customer Features

* **User Authentication:** Register and sign in to a customer account.
* **Book Catalog:** Browse available books and discover different categories.
* **Book Details:** View book information, descriptions, prices, and stock availability.
* **Search and Filtering:** Find books using the available search and category filters.
* **Shopping Cart:** Add books, remove items, and manage the cart.
* **Wishlist:** Save favorite books for later.
* **Checkout:** Enter customer and delivery information when placing an order.
* **Order History:** View previously placed orders.
* **Contact Form:** Send messages and inquiries to the bookstore.
* **Responsive Design:** Use the application on desktop, tablet, and mobile devices.

### 🔐 Administrator Features

* **Administrator Authentication:** Access the administration area through a dedicated sign-in page.
* **Administrator Profile:** View and update administrator account information.
* **Admin Dashboard:** Monitor important store statistics, including:

  * Total Books
  * Total Users
  * Total Orders
  * Total Wishlist Entries
  * Total Contact Messages
  * Revenue from confirmed orders
  * Low Stock Books
  * Out of Stock Books
* **Product Management:** Add, view, edit, and delete books, including their cover images, prices, descriptions, categories, and stock quantities.
* **Category Management:** Create, update, and delete book categories.
* **User Management:** View and manage customer accounts.
* **Order Management:** View, confirm, and delete customer orders, with stock validation before order confirmation.
* **Wishlist Management:** View and manage customer wishlist entries.
* **Contact Message Management:** View and manage messages submitted through the contact form.
* **Responsive Admin Interface:** Manage the store using a layout adapted to desktop and mobile screens.

### 🛡️ Validation and Error Handling

* Validate user input in forms.
* Validate product prices and stock quantities.
* Verify stock availability before confirming orders.
* Handle API errors and database operation failures.
* Display feedback messages for successful and unsuccessful actions.

## 🚀 Future Features

The following improvements could be implemented in future versions of BookStore. They are planned possibilities and are not necessarily available in the current application.

### 🛍️ 1. Enhanced Shopping Experience

* **Book Reviews and Ratings:** Allow customers to rate books and write reviews.
* **Personalized Recommendations:** Suggest books based on customer interests and purchase history.
* **Advanced Search:** Add sorting by price, popularity, publication date, and rating.
* **Related Books:** Recommend similar titles and books from the same author.
* **Recently Viewed Books:** Help customers find books they viewed previously.
* **Promotional Offers:** Add discounts, coupon codes, and seasonal sales.
* **Restock Notifications:** Notify customers when unavailable books become available again.

### 💳 2. Payment and Order Management

* **Online Payments:** Integrate a payment provider such as Stripe or another suitable payment gateway.
* **Order Tracking:** Let customers follow order progress.
* **Delivery Status:** Introduce processing, shipped, delivered, and cancelled statuses.
* **Email Notifications:** Send order confirmation and delivery updates.
* **Invoice Generation:** Generate downloadable invoices and order receipts.
* **Order Cancellation:** Allow eligible customers to cancel orders according to defined rules.
* **Multiple Delivery Addresses:** Allow customers to save and manage delivery addresses.

### 👥 3. Customer Account Improvements

* **Password Recovery:** Allow users to reset forgotten passwords.
* **Email Verification:** Verify customer email addresses during registration.
* **Profile Management:** Allow customers to update their personal information and passwords.
* **Account Security:** Add stronger authentication and suspicious-login notifications.
* **Customer Dashboard:** Provide a central page for orders, wishlist items, and account details.

### 📊 4. Advanced Administration

* **Advanced Analytics:** Display interactive charts for sales, orders, and customer activity.
* **Sales Reports:** Export business reports to CSV, Excel, or PDF.
* **Inventory Alerts:** Notify administrators when stock reaches a configurable threshold.
* **Sales Analysis:** Analyze sales by book, category, and time period.
* **Role-Based Access Control:** Support different permissions for administrators and staff members.
* **Activity Logs:** Record important administrative actions for auditing.
* **Bulk Product Management:** Import and export multiple books at once.
* **Review Moderation:** Allow administrators to review and moderate customer reviews.
* **Promotion Management:** Manage discounts, coupons, and marketing campaigns.

### 🌐 5. Technical Improvements

* **Automated Testing:** Add unit, integration, and end-to-end tests.
* **Security Improvements:** Implement rate limiting, stronger session management, and additional protections for sensitive operations.
* **Performance Optimization:** Improve loading times, caching, and database access.
* **Database Backup:** Implement backup and recovery procedures.
* **Accessibility:** Improve keyboard navigation, screen-reader support, and accessibility compliance.
* **Multilingual Support:** Provide the interface in multiple languages.
* **Progressive Web App (PWA):** Make the application installable on supported devices.
* **Cloud Deployment:** Deploy the application to a production hosting environment.
* **Monitoring and Logging:** Add production error monitoring and application performance tracking.
* **Mobile Application:** Develop a dedicated mobile application or mobile client.

## 🧰 Tech Stack

### Frontend

* **Next.js** — React framework with the App Router.
* **React** — Component-based user interface.
* **TypeScript** — Static typing for more maintainable code.
* **Tailwind CSS** — Utility-first styling.
* **Lucide React** — Interface icons.

### Backend

* **Next.js Route Handlers** — API endpoints and server-side operations.
* **Amazon DynamoDB** — NoSQL database technology.
* **DynamoDB Local** — Local database environment for development.
* **AWS SDK for JavaScript v3** — Communication with DynamoDB.
* **bcryptjs** — Password hashing where used by the authentication implementation.

### Development Tools

* **Node.js**
* **npm**
* **Git**
* **GitHub**
* **Docker** — Running DynamoDB Local.

## 🏗️ Application Structure

The project uses the Next.js App Router.

```text
bookstore/
├── app/
│   ├── admin/
│   │   ├── signin/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── users/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   └── contact/
│   ├── api/
│   │   ├── admin/
│   │   ├── books/
│   │   ├── categories/
│   │   ├── contact/
│   │   ├── messages/
│   │   ├── orders/
│   │   ├── users/
│   │   └── ...
│   ├── books/
│   ├── cart/
│   ├── categories/
│   ├── checkout/
│   ├── orders/
│   ├── signin/
│   ├── signup/
│   ├── wishlist/
│   ├── contus/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Navbar.tsx
├── contexts/
├── lib/
│   └── dynamodb.ts
├── public/
│   └── books/
├── scripts/
├── .env.local
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

*Note: This structure is illustrative. Some files and folders may differ depending on the current implementation.*

## 🗄️ Database

BookStore uses DynamoDB tables to store application data.

| Table        | Purpose                                                         |
| ------------ | --------------------------------------------------------------- |
| `Books`      | Book information, prices, categories, images, and stock         |
| `Categories` | Book category information                                       |
| `Users`      | Customer and administrator account data                         |
| `Orders`     | Customer orders and order details                               |
| `Wishlists`  | Saved books                                                     |
| `Messages`   | Messages, if used by the current implementation                 |
| `Contacts`   | Contact form submissions, if used by the current implementation |

The exact table configuration and required attributes depend on the database setup scripts and API implementation.

## ⚙️ Prerequisites

Before running BookStore locally, make sure you have installed:

* Node.js and npm.
* Docker Desktop or another compatible Docker environment.
* Git.

You also need the project dependencies and a running DynamoDB Local instance.

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/djebradjamila/bookstore.git
cd bookstore
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root.

Example configuration for DynamoDB Local:

```env
DYNAMODB_REGION=local
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_ACCESS_KEY_ID=local
DYNAMODB_SECRET_ACCESS_KEY=local
```

Use the exact environment variable names expected by your project. These values are intended for local development, not production.

**Important:** Never commit `.env.local` or real AWS credentials to GitHub.

### 4. Start DynamoDB Local

If the project uses the `amazon/dynamodb-local` Docker image, you can start a local instance with:

```bash
docker run -d --name dynamodb-local -p 8000:8000 amazon/dynamodb-local
```

If the container already exists, start it with:

```bash
docker start dynamodb-local
```

Create the required database tables using the project's setup scripts.

### 5. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The administrator sign-in page is available at:

```text
http://localhost:3000/admin/signin
```

## 🔑 Main Application Pages

### Customer Pages

| Page          | Route         |
| ------------- | ------------- |
| Home          | `/`           |
| Books         | `/books`      |
| Categories    | `/categories` |
| Shopping Cart | `/cart`       |
| Wishlist      | `/wishlist`   |
| Checkout      | `/checkout`   |
| My Orders     | `/orders`     |
| Sign In       | `/signin`     |
| Sign Up       | `/signup`     |
| Contact       | `/contus`     |

### Administrator Pages

| Page                  | Route               |
| --------------------- | ------------------- |
| Administrator Sign In | `/admin/signin`     |
| Dashboard             | `/admin/dashboard`  |
| Administrator Profile | `/admin/profile`    |
| Products              | `/admin/products`   |
| Categories            | `/admin/categories` |
| Users                 | `/admin/users`      |
| Orders                | `/admin/orders`     |
| Wishlist              | `/admin/wishlist`   |
| Contact Messages      | `/admin/contact`    |

## 🔌 API

The application uses Next.js Route Handlers to manage data and server-side operations.

Depending on the current implementation, API endpoints cover:

* Book management.
* Category management.
* User authentication and account management.
* Administrator statistics and user management.
* Order creation and administration.
* Wishlist operations.
* Contact form submissions and message management.
* Administrator profile updates.

Refer to the `app/api/` directory for the implemented endpoints and their supported HTTP methods.

## 🔒 Security Considerations

* Keep environment variables and credentials private.
* Never expose secret keys in client-side code.
* Validate user input on the server.
* Hash passwords before storing them.
* Protect administrator routes and sensitive API operations with appropriate authorization checks.
* Verify stock availability before confirming orders.
* Use HTTPS and secure authentication practices in production.
* Configure production database permissions with least-privilege access.

## 🧪 Available Scripts

Run the following commands according to the scripts defined in `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Some commands may not be configured in every version of the project. Check `package.json` for the available scripts.

## 🤝 Contributing

Contributions and suggestions for improving BookStore are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your changes with a descriptive message.
5. Open a pull request.

## 📌 Project Status

BookStore is an evolving project. Its current functionality includes a customer-facing bookstore and an administration interface. Additional features may be introduced in future versions.

## 👩‍💻 Author

**Djamila Djebra**

Full-stack web development project.

GitHub: [djebradjamila](https://github.com/djebradjamila)

Repository: [BookStore](https://github.com/djebradjamila/bookstore)

## 📄 License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under a particular open-source license.
