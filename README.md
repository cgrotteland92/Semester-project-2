# Semester-project-2

Auction house website


ADD META NAME DESCRIPTION TO EVERY PAGE
=======

# Remember to edit README and add screenshot.

**A Tailwind CSS, Vanilla JavaScript social media application that allows users to register, log in, create/edit/delete posts. This project interacts with Noroff's Social API to handle data operations such as posts, profiles and reactions.**

## Features

- **User Authentication:**

  - Register a new user
  - Log in as an existing user

- **Posts:**

  - Create, edit, and delete posts
  - View a main feed of posts
  - Search posts by title or body

- **Profiles:**
  - View your own and other users’ profiles
  - Edit your own profile (update name, bio, avatar, banner)
  - View posts created by a specific user on their profile

## API Endpoints Used

### Posts Endpoints

- **Fetch Posts:**  
  `GET /social/posts?_author=true` – Retrieves all posts with author details.

- **Create Post:**  
  `POST /social/posts` – Creates a new post.

- **Edit Post:**  
  `PUT /social/posts/<id>` – Updates a post based on its ID.

- **Delete Post:**  
  `DELETE /social/posts/<id>` – Deletes a post based on its ID.

- **React to Post:**  
  `PUT /social/posts/<id>/react/<symbol>` – Toggles a reaction on a post.

- **Search Posts:**  
  `GET /social/posts/search?q=<query>&_author=true` – Searches posts by title or body.

### Profile Endpoints

- **All Profiles:**  
  `GET /social/profiles` – Retrieves a list of all profile
- **Single Profile:**  
  `GET /social/profiles/<name>` – Retrieves a single profile by name, including additional properties if needed.

- **Update Profile:**  
  `PUT /social/profiles/<name>` – Updates a profile’s details.

- **User Posts:**  
  `GET /social/profiles/<name>/posts` – Retrieves posts created by a specific user.

### Authentication Endpoints

- **Register User:**  
  `POST /auth/register` – Registers a new user.

- **Login User:**  
  `POST /auth/login` – Logs in a user.

### Installation

- Node.js is required for installing dependencies and building Tailwind CSS.

1. **Clone the Repository**

```bash
  git clone https://github.com/NoroffFEU/js2-course-assignment-cgrotteland92.git
  cd js2-course-assignment-cgrotteland92
```

2. **Install Dependencies**

```bash
  npm install
```

```bash
  npm run dev
```

