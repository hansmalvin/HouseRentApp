# How to Use

Follow these steps to set up and run the backend server on your local machine:

### 1. Clone the GitHub Repository
```bash
git clone <your-github-repo-link-here>
cd <your-project-folder>

npm init -y

npm install bcrypt bcryptjs cookie-parser cors dotenv express jsonwebtoken moment mongodb mongoose multer 

npm install nodemon --save-dev

make .env file and inside the use the mongodb atlas connection string (srv+ or the regular one)

You can either add port 8001 into the .env or not

And make JWT_KEY in the .env file for unique key JWT Token

migrate database for dummy db

npm run migrate
