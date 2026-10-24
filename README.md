# QueueLess — Smart Queue Prediction System
### B.Tech CSE Full Stack Development Mini Project

QueueLess is an enterprise-grade digital queue management and explainable wait-time prediction web application engineered with **Java 26**, **Jakarta Servlet API 6.0**, **Apache Tomcat 10.1**, **MongoDB Java Driver 5.5.1**, and a **React + TypeScript + Tailwind CSS** frontend packaged together as a single deployable Maven **WAR** file (`queueless.war`).

---

## 1. Project Overview & Features

### For Students / Visitors / Customers:
- **Digital Token Generation**: Instant token issuance with atomic concurrency controls (e.g., `ADM-101`, `FEE-101`).
- **Live Queue Tracking**: Real-time position tracking (`#1`, `#2`, `#3`) and customers ahead count.
- **Explainable Wait-Time Prediction**: Transparent deterministic prediction algorithm recalculating wait times based on rolling service duration velocity and current in-service progress.
- **Token Cancellation**: Self-service cancellation before being summoned.
- **Token History**: Persistent log of past visits and service durations.

### For Counter Staff:
- **Service Station Console**: Live view of assigned service counters with waiting tickets.
- **Calling Next In Line**: Summon the next student with automated notification triggers.
- **Service Timer & Stopwatch**: Live elapsed seconds counter tracking service velocity.
- **Completion & History Logging**: Automatic recording into MongoDB `serviceHistory` collection for predictive feedback loops.
- **Skip / No-Show & Recall**: Handle non-responsive patrons cleanly.

### For System Administrators:
- **Interactive KPI Dashboard**: Real-time metrics for total tokens, waiting backlog, average wait duration, and counter utilization.
- **Visual Analytics**: Hourly throughput and backlog charts powered by Recharts.
- **Service Counter Management**: Full CRUD operations on service counters (name, code, average duration, status).
- **Staff Accounts Management**: Provision and assign staff operators.
- **Server & MongoDB Health Monitor**: Diagnostic inspection of database connectivity and ping latency via `/api/health`.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Java Development Kit (JDK) | **Java 26** | Enterprise backend execution |
| **Application Server**| Apache Tomcat | **10.1.x** | Servlet container / WAR host |
| **Servlet Specification** | Jakarta Servlet API | **6.0.0** | WebServlet, WebFilter, WebListener |
| **Database** | MongoDB (Atlas or Local) | **7.0+** / Atlas | NoSQL document persistence |
| **Database Driver** | MongoDB Java Driver (Sync) | **5.5.1** | Connection pooling & aggregations |
| **Build Tool** | Apache Maven | **3.9+** | WAR compilation & dependencies |
| **JSON Parser** | Google Gson | **2.12.1** | REST API JSON serialization |
| **Security / Hash** | jBCrypt | **0.4** | Salted password encryption |
| **Frontend** | React + TypeScript + Vite | **19.0.1** | Single Page Application (SPA) |
| **Styling** | Tailwind CSS | **4.x** | Modern UI design system |

---

## 3. Project Directory Structure

```
QueueLess/
├── pom.xml                               # Root Maven Project configuration (WAR packaging)
├── README.md                             # Exhaustive setup, architecture, and deployment guide
├── .gitignore                            # Standard Java, Maven, Node ignore rules
├── .env.example                          # Environment variable template
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── queueless/
│   │   │           ├── config/
│   │   │           │   └── MongoConfig.java         # Singleton connection pool & health ping
│   │   │           ├── listeners/
│   │   │           │   └── AppContextListener.java  # Tomcat startup/shutdown & MongoDB indexing
│   │   │           ├── models/
│   │   │           │   ├── User.java                # Student, Staff, Admin entity
│   │   │           │   ├── Counter.java             # Service counter model
│   │   │           │   ├── Token.java               # Queue token entity
│   │   │           │   ├── ServiceHistory.java      # Servicing duration logs
│   │   │           │   └── QueuePrediction.java     # Wait time prediction result
│   │   │           ├── dao/
│   │   │           │   ├── UserDAO.java             # MongoDB operations on users collection
│   │   │           │   ├── CounterDAO.java          # MongoDB operations on counters collection
│   │   │           │   ├── TokenDAO.java            # Atomic token sequence & queries
│   │   │           │   └── ServiceHistoryDAO.java   # Aggregation pipeline for rolling averages
│   │   │           ├── services/
│   │   │           │   ├── QueuePredictionService.java # Explainable wait-time calculations
│   │   │           │   ├── TokenService.java        # Concurrency & state machine transitions
│   │   │           │   └── AuthService.java         # BCrypt authentication & session handling
│   │   │           ├── filters/
│   │   │           │   ├── CorsFilter.java          # CORS & security headers
│   │   │           │   └── AuthFilter.java          # RBAC session filter for /api/staff/*, /api/admin/*
│   │   │           ├── servlets/
│   │   │           │   ├── HealthServlet.java       # GET /api/health
│   │   │           │   ├── AuthServlet.java         # /api/auth/*
│   │   │           │   ├── CounterServlet.java      # /api/counters/*
│   │   │           │   ├── TokenServlet.java        # /api/tokens/*
│   │   │           │   ├── StaffQueueServlet.java   # /api/staff/queue/*
│   │   │           │   └── AdminServlet.java        # /api/admin/*
│   │   │           └── utils/
│   │   │               ├── JsonUtil.java            # Gson serializer
│   │   │               └── ResponseUtil.java        # Unified JSON response envelope
│   │   │
│   │   ├── resources/
│   │   │   └── logback.xml                          # SLF4J logging configuration
│   │   │
│   │   └── webapp/
│   │       ├── index.html                           # Compiled frontend entry point
│   │       ├── assets/                              # Compiled JS and CSS bundles
│   │       └── WEB-INF/
│   │           └── web.xml                          # Jakarta EE 10 / Servlet 6.0 deployment descriptor
│   │
│   └── (Frontend React Source in src/components/, src/services/, src/types/, src/utils/)
```

---

## 4. Requirements & Prerequisites

1. **JDK 26** (or JDK 21+ with Java 26 compiler support).
2. **Apache Tomcat 10.1.x** (Important: Tomcat 10+ uses `jakarta.*` packages required by Servlet API 6.0).
3. **MongoDB** (either MongoDB Community Server running locally on port `27017` or a free MongoDB Atlas cluster).
4. **Apache Maven 3.9+** (installed and added to `PATH`).
5. **IntelliJ IDEA Ultimate** (or Community with Smart Tomcat plugin).
6. **Node.js v22+** (only required during frontend development and building).

---

## 5. MongoDB Configuration

QueueLess accesses MongoDB exclusively through the Java backend using the official `mongodb-driver-sync:5.5.1`. Connection strings and credentials are never exposed to the frontend.

### Option A: Local MongoDB
Ensure MongoDB is running locally:
```powershell
# Verify MongoDB service status in Windows PowerShell
Get-Service -Name MongoDB
```
Connection URI:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=queueless_db
```

### Option B: MongoDB Atlas (Cloud)
Create a free M0 cluster on [cloud.mongodb.com](https://cloud.mongodb.com).
Add your IP to Network Access and create a database user.
Connection URI format:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/queueless_db?retryWrites=true&w=majority
MONGODB_DATABASE=queueless_db
```

---

## 6. IntelliJ IDEA Setup & External Tomcat 10.1 Configuration

Follow these exact steps to run QueueLess in IntelliJ IDEA:

### Step 1: Open the Project
1. Open **IntelliJ IDEA**.
2. Click **File &rarr; Open...** and select the root directory containing `pom.xml`.
3. Choose **Open as Project &rarr; Maven Project**.

### Step 2: Configure Project SDK
1. Go to **File &rarr; Project Structure &rarr; Project**.
2. Set **SDK** to **JDK 26**.
3. Set **Language Level** to **26**.
4. Click **Apply &rarr; OK**.

### Step 3: Configure External Apache Tomcat 10.1 Server
1. Go to **Run &rarr; Edit Configurations...**.
2. Click **+ (Add New Configuration)** and select **Tomcat Server &rarr; Local**.
3. Under **Application server**, click **Configure...** and select your Apache Tomcat 10.1 installation directory (e.g. `C:\apache-tomcat-10.1.34`).
4. In the **Server** tab:
   - **HTTP port**: `8080`
   - In **Environment Variables**, click `...` and add:
     - `MONGODB_URI` = `mongodb://localhost:27017` (or your Atlas URI)
     - `MONGODB_DATABASE` = `queueless_db`
5. Switch to the **Deployment** tab:
   - Click **+ &rarr; Artifact &rarr; queueless:war exploded** (or `queueless:war`).
   - Set **Application context** to: `/queueless` (or `/` if you want it at root).
6. Click **Apply &rarr; OK**.

### Step 4: Run the Application
1. Click the green **Run** button in IntelliJ.
2. Tomcat will start, the `AppContextListener` will initialize the MongoDB connection pool and build required collection indexes.
3. Open your browser and navigate to:
   ```
   http://localhost:8080/queueless
   ```

---

## 7. Windows PowerShell Commands

### Step 1: Build the Frontend Production Assets
```powershell
npm run build
```
This compiles React into `src/main/webapp/index.html` and `src/main/webapp/assets/`.

### Step 2: Package the Complete WAR with Maven
```powershell
# Set environment variables for local testing
$env:MONGODB_URI="mongodb://localhost:27017"
$env:MONGODB_DATABASE="queueless_db"

# Compile and package WAR
mvn clean package
```
This generates the standalone deployable artifact:
```
target/queueless.war
```

### Step 3: Manual Tomcat Deployment (Optional)
You can copy `target/queueless.war` directly to your Tomcat `webapps/` folder:
```powershell
Copy-Item target\queueless.war -Destination "C:\apache-tomcat-10.1.34\webapps\"
```
Start Tomcat:
```powershell
& "C:\apache-tomcat-10.1.34\bin\startup.bat"
```

---

## 8. REST API Reference

All endpoints return uniform JSON envelopes with `{ success, data, message, timestamp }`.

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Application & MongoDB health diagnosis | Public |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & create HTTP session | Public |
| `POST` | `/api/auth/logout` | Invalidate current session | Authenticated |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |
| `GET` | `/api/counters` | List counters with live waiting & serving status | Public |
| `POST` | `/api/counters` | Provision new service counter | `ADMIN` |
| `PUT` | `/api/counters/{id}` | Update service counter details | `ADMIN` |
| `DELETE` | `/api/counters/{id}` | Delete service counter | `ADMIN` |
| `POST` | `/api/tokens` | Generate new digital queue token | `STUDENT` |
| `GET` | `/api/tokens` | Fetch active token for current user | `STUDENT` |
| `GET` | `/api/tokens/my` | Retrieve token history for current user | `STUDENT` |
| `GET` | `/api/tokens/{id}/position` | Recalculate dynamic queue position & wait time | Authenticated |
| `DELETE` | `/api/tokens/{id}` | Cancel active token | Token Owner / Staff |
| `GET` | `/api/staff/queue` | Retrieve staff counter queue & active customer | `STAFF` / `ADMIN` |
| `POST` | `/api/staff/queue/{id}/call` | Summon next token to desk | `STAFF` / `ADMIN` |
| `POST` | `/api/staff/queue/{id}/start` | Start servicing token | `STAFF` / `ADMIN` |
| `POST` | `/api/staff/queue/{id}/complete` | Complete service & log duration | `STAFF` / `ADMIN` |
| `POST` | `/api/staff/queue/{id}/skip` | Mark token skipped (no-show) | `STAFF` / `ADMIN` |
| `GET` | `/api/admin/analytics` | Aggregated analytics & throughput charts | `ADMIN` |
| `GET` | `/api/admin/staff` | List staff operators | `ADMIN` |
| `POST` | `/api/admin/staff` | Provision new staff operator account | `ADMIN` |

---

## 9. Smart Queue Prediction Algorithm

The prediction calculation in `QueuePredictionService.java` is deterministic and explainable:

$$\text{Estimated Wait Time} = \frac{(\text{Customers Ahead}) \times S_{\text{avg}} + \max(0, S_{\text{avg}} - T_{\text{elapsed}})}{\text{Active Counters}}$$

Where:
- $S_{\text{avg}}$: Weighted blend of the historical empirical service duration (from MongoDB `serviceHistory`) and counter baseline.
- $T_{\text{elapsed}}$: Elapsed minutes for the ticket currently being served at the booth.
- $\text{Customers Ahead}$: Position in the chronological queue ahead of the user's token.

---

## 10. Troubleshooting

1. **Tomcat ClassNotFoundException for Jakarta Servlets**:
   - Ensure you are using **Apache Tomcat 10.1**, not Tomcat 9. Tomcat 9 uses legacy `javax.servlet`, whereas Tomcat 10+ uses `jakarta.servlet`.
2. **MongoDB Connection Failure**:
   - Verify `MONGODB_URI` environment variable is defined in the Tomcat Run Configuration in IntelliJ.
   - For MongoDB Atlas, ensure your current IP address is whitelisted in Atlas Network Access.
3. **Session Loss on Refresh**:
   - Check that `JSESSIONID` cookie is allowed by your browser and not blocked by cross-origin security extensions.
4. **404 on Client Route Refresh**:
   - Ensure `src/main/webapp/WEB-INF/web.xml` contains the `<error-page><error-code>404</error-code><location>/index.html</location></error-page>` mapping for SPA fallback.
