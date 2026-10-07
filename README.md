# ✨ Caption & Chapter Studio

> **A Full-Stack Content-Creation and Narrative Management Platform**  
> Built with **HTML5, CSS3, Vanilla JavaScript** (Frontend) and **Java 17+ Spring Boot 3.x** (Backend) with **MySQL / In-Memory H2 Fallback**.

---

## 🌟 Executive Summary

**Caption & Chapter Studio** is an enterprise-grade productivity web application designed for modern digital creators, copywriters, and authors. It enables users to formulate high-engagement social media captions tailored to specific platforms and psychological tones, compose structured long-form chapters using an inline WYSIWYG editor, and organize their creative catalog with persistent search, filtering, and favoriting capabilities.

Designed to mirror high-end AI/SaaS products, the interface features a **glassmorphic dark aesthetic**, smooth animated gradients, responsive navigation drawers, live metric analytics, and comprehensive error resilience.

---

## 🏗️ System Architecture & Tech Stack

```
Caption & Chapter Studio
├── Frontend: HTML5 • CSS3 (Glassmorphism & Variables) • Modern Vanilla JavaScript
├── Backend:  Java 17+ • Spring Boot 3.2.x • Spring Data JPA • RESTful APIs
├── Security: BCrypt Password Hashing • HMAC-SHA256 JWT Stateless Tokens
└── Database: MySQL 8.0+ (Production) • In-Memory H2 (Instant Zero-Config Fallback)
```

### Frontend Architecture
- **Vanilla JavaScript Modules**: Clean separation of concerns (`main.js`, `auth.js`, `dashboard.js`, `captions.js`, `chapters.js`).
- **RESTful Client & Fallback Engine**: Transparent `fetch()` communication with Spring Boot backend, featuring an automatic client storage fallback if the backend service is offline.
- **WYSIWYG Rich Editor**: Support for bold, italics, underlines, headings (H2, H3), lists, blockquotes, live word/character counters, and estimated reading time.
- **Design System**: Dark theme (`#07090e`), electric-blue & purple accents (`#6366f1`, `#8b5cf6`, `#3b82f6`), glass cards with backdrop blur, custom modal overlays, and toast notifications.

### Backend Architecture
- **Spring Boot 3.x REST Services**: Clean tiered architecture separating Controllers, Services, Repositories, Entities, and DTOs.
- **Modular Rule & Template Caption Engine**: Deterministic generation logic parameterized across 5 platforms, 6 tonal voices, and 3 length scales, structured for seamless future Google Gemini / OpenAI API integration.
- **Cross-Origin Resource Sharing (CORS)**: Configured to support local development across multiple ports and origins.
- **Embedded Static Serving**: Spring Boot also serves the frontend directly from `src/main/resources/static/` at `http://localhost:8080/`.

---

## 📂 Project Directory Structure

```
caption-chapter-studio/
├── pom.xml                                    # Maven configuration & dependencies
├── schema.sql                                 # Complete MySQL database schema & seed script
├── README.md                                  # Full project documentation & guide
│
├── src/
│   ├── main/
│   │   ├── java/com/captionchapterstudio/
│   │   │   ├── CaptionChapterStudioApplication.java  # Main application entry point
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java            # Global CORS configuration
│   │   │   │   ├── DataInitializer.java       # Pre-seeds demo account & sample content
│   │   │   │   ├── SecurityConfig.java        # BCrypt password encoder bean
│   │   │   │   └── WebConfig.java             # Interceptor & static resource routing
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java        # Login, registration, profile endpoints
│   │   │   │   ├── CaptionController.java     # Caption synthesis & CRUD endpoints
│   │   │   │   ├── ChapterController.java     # Chapter authoring & CRUD endpoints
│   │   │   │   └── DashboardController.java   # Analytics & metric aggregation
│   │   │   ├── dto/
│   │   │   │   ├── ApiResponse.java           # Standardized JSON response envelope
│   │   │   │   ├── AuthResponse.java          # JWT token and user profile payload
│   │   │   │   ├── CaptionGenerateRequest.java# Caption generator input parameters
│   │   │   │   ├── CaptionGenerateResponse.java# Generated variations & hashtags
│   │   │   │   ├── CaptionRequest.java        # Save caption payload
│   │   │   │   ├── ChapterRequest.java        # Save chapter payload
│   │   │   │   ├── DashboardStatsResponse.java# Metrics payload
│   │   │   │   ├── LoginRequest.java          # Login credentials
│   │   │   │   ├── RegisterRequest.java       # User registration payload
│   │   │   │   └── UserProfileUpdateRequest.java # Profile update payload
│   │   │   ├── exception/
│   │   │   │   └── GlobalExceptionHandler.java# Centralized 400/401/404/500 error handler
│   │   │   ├── model/
│   │   │   │   ├── Caption.java               # JPA Entity for saved captions
│   │   │   │   ├── Chapter.java               # JPA Entity for written chapters
│   │   │   │   └── User.java                  # JPA Entity for user accounts
│   │   │   ├── repository/
│   │   │   │   ├── CaptionRepository.java     # Custom JPQL search & count queries
│   │   │   │   ├── ChapterRepository.java     # Custom JPQL search & count queries
│   │   │   │   └── UserRepository.java        # User lookup & uniqueness checks
│   │   │   ├── security/
│   │   │   │   ├── AuthInterceptor.java       # Intercepts requests & validates Bearer token
│   │   │   │   └── JwtUtil.java               # Token generation, claims & verification
│   │   │   └── service/
│   │   │       ├── AuthService.java           # BCrypt verification & registration logic
│   │   │       ├── CaptionService.java        # Caption generation algorithm & CRUD
│   │   │       └── ChapterService.java        # Chapter management & metric calculators
│   │   └── resources/
│   │       ├── application.properties         # Master configuration (H2 / MySQL profile toggle)
│   │       ├── application-h2.properties      # Zero-setup in-memory database profile
│   │       ├── application-mysql.properties   # Production MySQL database profile
│   │       ├── schema.sql                     # Embedded database schema
│   │       └── static/                        # Bundled frontend served by Spring Boot
│   │           ├── index.html
│   │           ├── login.html
│   │           ├── signup.html
│   │           ├── dashboard.html
│   │           ├── captions.html
│   │           ├── chapters.html
│   │           ├── favorites.html
│   │           ├── profile.html
│   │           ├── css/
│   │           └── js/
│
└── frontend/                                  # Standalone frontend directory
    ├── index.html                             # Landing page
    ├── login.html                             # User authentication
    ├── signup.html                            # New user registration
    ├── dashboard.html                         # SaaS analytics hub
    ├── captions.html                          # Rule generator + library
    ├── chapters.html                          # Long-form editor + library
    ├── favorites.html                         # Starred collection hub
    ├── profile.html                           # Profile management
    ├── css/
    │   ├── style.css                          # Theme tokens, typography, glass cards
    │   ├── dashboard.css                      # Layout, editor toolbar, metrics, cards
    │   └── responsive.css                     # Mobile drawer & adaptive breakpoints
    └── js/
        ├── main.js                            # API client, fallback engine, toast system
        ├── auth.js                            # Form validation, autofill, login/signup
        ├── dashboard.js                       # Live greeting, statistics loader
        ├── captions.js                        # Generation engine, clipboard copy, CRUD
        └── chapters.js                        # Rich formatting, word counter, reader modal
```

---

## 🗄️ Database Design (MySQL)

### Database Name
`caption_chapter_studio`

### Tables & Relationships

#### 1. `users` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | VARCHAR(100) | NOT NULL | Full name of the user |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | User login email address |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account registration timestamp |

#### 2. `captions` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique caption identifier |
| `user_id` | BIGINT | NOT NULL, FOREIGN KEY | References `users(id)` ON DELETE CASCADE |
| `topic` | VARCHAR(255) | NOT NULL | Subject / concept of the caption |
| `platform` | VARCHAR(50) | NOT NULL | Platform (Instagram, LinkedIn, etc.) |
| `tone` | VARCHAR(50) | NOT NULL | Voice style (Professional, Casual, etc.) |
| `content` | TEXT | NOT NULL | Generated / saved caption text |
| `favorite` | BOOLEAN | DEFAULT FALSE | Stood out as a favorite |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

#### 3. `chapters` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique chapter identifier |
| `user_id` | BIGINT | NOT NULL, FOREIGN KEY | References `users(id)` ON DELETE CASCADE |
| `title` | VARCHAR(255) | NOT NULL | Title of the chapter |
| `category` | VARCHAR(100) | NOT NULL | Subject category (Technology, Essay, etc.) |
| `description`| TEXT | NULLABLE | Short synopsis or thesis |
| `content` | LONGTEXT | NOT NULL | Formatted HTML content from editor |
| `favorite` | BOOLEAN | DEFAULT FALSE | Stood out as a favorite |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

---

## 🚀 Setup & Execution Guide

### Prerequisites
1. **Java Development Kit (JDK 17 or higher)**
2. **Apache Maven (3.8+)** (or use IntelliJ / Eclipse / VS Code built-in runner)
3. **MySQL Server 8.0+** *(Optional: Spring Boot is pre-configured with an in-memory H2 database fallback for instant zero-configuration execution)*.

---

### Step 1: Database Setup (MySQL)

If using MySQL:
1. Open MySQL Workbench, MySQL CLI, or phpMyAdmin:
   ```bash
   mysql -u root -p
   ```
2. Execute the provided `schema.sql` script:
   ```sql
   SOURCE schema.sql;
   ```
   *(Or copy-paste the contents of `schema.sql` into your SQL query window).*
3. Open `src/main/resources/application.properties` and change the active profile:
   ```properties
   spring.profiles.active=mysql
   ```
4. Verify your MySQL credentials in `src/main/resources/application-mysql.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

> **Note on Zero-Config Fallback:**  
> If you leave `spring.profiles.active=h2` in `application.properties`, the application runs immediately without requiring MySQL to be installed or running! H2 Console is accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:caption_chapter_studio`, User: `sa`, Password: blank).

---

### Step 2: Running the Spring Boot Backend

#### Option A: Running from Terminal / Command Prompt
```bash
# Navigate to the project directory
cd caption-chapter-studio

# Build and start using Maven
mvn clean spring-boot:run
```

#### Option B: Running in an IDE (IntelliJ IDEA / Eclipse / VS Code / NetBeans)
1. Open your IDE and select **Open Project** -> select the `caption-chapter-studio` folder containing `pom.xml`.
2. Wait for Maven to index dependencies.
3. Locate `src/main/java/com/captionchapterstudio/CaptionChapterStudioApplication.java`.
4. Right-click and choose **Run 'CaptionChapterStudioApplication'** (or click the green Run arrow).

The server will initialize on port **8080**:
- **Application URL**: `http://localhost:8080`
- **REST API Base**: `http://localhost:8080/api`

---

### Step 3: Accessing the Web Application

The frontend is dual-accessible:
1. **Via Spring Boot Server (Recommended)**:  
   Open your browser to:  
   👉 `http://localhost:8080/index.html` (or `http://localhost:8080/`)
2. **Standalone Frontend**:  
   You can also double-click `frontend/index.html` or open it with the VS Code **Live Server** extension (`http://127.0.0.1:5500/frontend/index.html`). The JavaScript client automatically talks to `http://localhost:8080/api` via CORS.

---

## 🔑 Pre-Seeded Demo Account

For rapid viva, grading, or demonstration purposes, a pre-seeded account is initialized automatically:

- **Email**: `demo@captionstudio.com`
- **Password**: `Demo@1234`

On the login page, you can also click the **"Autofill Demo"** button to load these credentials with one click!

---

## 📡 Complete REST API Documentation

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| `POST` | `/api/auth/logout` | Invalidate user session | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer Token) |
| `PUT` | `/api/auth/profile` | Update user name, email, or password | Yes (Bearer Token) |

#### Register Payload Example
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```

---

### 2. Caption Studio Endpoints (`/api/captions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/captions/generate` | Generate rule-based caption & hashtags | No / Optional |
| `POST` | `/api/captions` | Save generated caption to user library | Yes (Bearer Token) |
| `GET` | `/api/captions` | Retrieve user captions (with filter/search) | Yes (Bearer Token) |
| `GET` | `/api/captions/{id}` | Retrieve caption by ID | Yes (Bearer Token) |
| `PUT` | `/api/captions/{id}` | Update existing caption | Yes (Bearer Token) |
| `DELETE` | `/api/captions/{id}` | Delete caption by ID | Yes (Bearer Token) |
| `PUT` | `/api/captions/{id}/favorite` | Toggle favorite status | Yes (Bearer Token) |

#### Caption Generate Payload Example
```json
{
  "topic": "New SaaS Product Launch",
  "platform": "Instagram",
  "tone": "Professional",
  "length": "Medium",
  "includeHashtags": true
}
```

---

### 3. Chapter Studio Endpoints (`/api/chapters`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/chapters` | Publish / create a new chapter | Yes (Bearer Token) |
| `GET` | `/api/chapters` | Retrieve user chapters (with filter/search) | Yes (Bearer Token) |
| `GET` | `/api/chapters/{id}` | Retrieve chapter by ID | Yes (Bearer Token) |
| `PUT` | `/api/chapters/{id}` | Update existing chapter | Yes (Bearer Token) |
| `DELETE` | `/api/chapters/{id}` | Delete chapter by ID | Yes (Bearer Token) |
| `PUT` | `/api/chapters/{id}/favorite` | Toggle favorite status | Yes (Bearer Token) |

#### Chapter Create Payload Example
```json
{
  "title": "Chapter 1: The Foundations of Digital Narrative",
  "category": "Content Strategy",
  "description": "An introduction to narrative velocity and reader hooks.",
  "content": "<h2>The First Hook</h2><p>In modern digital storytelling...</p>",
  "favorite": true
}
```

---

### 4. Dashboard Endpoints (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Aggregated metrics (totals, words, recents) | Yes (Bearer Token) |

---

## 💡 Future Enhancements Roadmap

1. **External AI Model Integration**: Plug in Google Gemini 1.5 Pro / Flash API or OpenAI GPT-4o API into `CaptionService` via an API key toggle in `application.properties`.
2. **Export to PDF & EPUB**: Allow users to compile and download multi-chapter books in formatted PDF or eBook standard.
3. **Social Media Direct Scheduling**: Integrate LinkedIn API and Meta Graph API for scheduled one-click publishing directly from the dashboard.
4. **Team Collaboration**: Shared workspace folders where multiple editors can co-author chapters in real-time via WebSockets.

---

## 📜 Academic / BCA Final-Year Project Summary

- **Project Title**: Caption & Chapter Studio
- **Domain**: Web Application Development / Enterprise Content Management
- **Platform**: Full-Stack Web
- **Language Stack**: Java 17, HTML5, CSS3, JavaScript (ES6+)
- **Frameworks**: Spring Boot 3.2.x, Spring Data JPA, Hibernate, JJWT, jBCrypt
- **Architectural Pattern**: MVC / Tiered RESTful API Architecture
- **Database**: MySQL 8.0 / H2 In-Memory Database
