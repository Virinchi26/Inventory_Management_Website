## Inventory Management System Website
This is a simple inventory management system application allows users to manage products, suppliers, and customers, providing functionalities to add, update, delete, and view records.

## Backend
The backend is built using Node.js and Express.js, providing RESTful APIs for the frontend to interact with the database.

## Frontend
The frontend is built using React.js, providing a user-friendly interface to interact with the backend APIs and manage inventory records.

## Database
The application uses MySQL as the database to store products, suppliers, and customers data.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Virinchi26/Inventory_Management_Website.git
    cd Inventory_Management_Website
    ```
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install backend dependencies:
   ```bash
    npm install
    ```
4. Create a `.env` file in the backend directory and configure your database connection:
   ```plaintext
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=inventory_management
    PORT=5000
   ```
5. Start the backend server:
   ```bash
    npm start
    ```
6. Navigate to the frontend directory:
   ```bash
    cd ../frontend
    ``` 
7. Install frontend dependencies:
   ```bash
    npm install
    ```
8. Start the frontend server:
    ```bash
     npm start
     ```
9. Open your browser and navigate to `http://localhost:3000` to access the application.

