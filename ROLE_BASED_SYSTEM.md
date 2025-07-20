# 🎓 Role-Based Authentication System

## 🔐 **Two User Types:**

### 👨‍🏫 **ADMIN (Administrator)**
- **Role**: `admin`
- **Purpose**: Manage college operations, assignments, events, and students
- **Dashboard**: Admin-specific dashboard with management tools

### 👨‍🎓 **STUDENT**
- **Role**: `student` 
- **Purpose**: View assignments, events, deadlines, and manage personal schedule
- **Dashboard**: Student-focused dashboard with personal tools

---

## 🚀 **How to Login:**

### **Demo Credentials:**

#### 👨‍🏫 **Admin Login:**
- **Email**: `admin@college.edu`
- **Password**: `admin123`
- **Role**: Admin

#### 👨‍🎓 **Student Login:**
- **Email**: `student@college.edu`
- **Password**: `student123`
- **Role**: Student

---

## 📱 **Admin Features:**

### 🏠 **Admin Dashboard:**
- **Total Students**: View count of enrolled students
- **Active Events**: Manage college events
- **Assignments**: Create and manage assignments
- **Pending Submissions**: Review student submissions

### ⚡ **Quick Actions:**
- ✅ **Add Assignment** - Create new assignments for students
- ✅ **Add Event** - Schedule college events and activities
- ✅ **Manage Students** - View and manage student information
- ✅ **Send Notification** - Send announcements to students

### 📊 **Recent Activities:**
- Track all admin actions and activities
- View assignment postings and event creations
- Monitor student engagement

### 📝 **Pending Submissions:**
- Review student assignment submissions
- Grade and provide feedback
- Track submission deadlines

---

## 📚 **Student Features:**

### 🏠 **Student Dashboard:**
- **Upcoming Events**: View college events and activities
- **Deadlines**: Track assignment due dates
- **Quick Actions**: Personal productivity tools
- **Notifications**: Receive updates from admins

### ⚡ **Quick Actions:**
- ✅ **Add Event** - Add personal events to calendar
- ✅ **Add Deadline** - Set personal reminders
- ✅ **Join Club** - Join student organizations
- ✅ **Settings** - Manage personal preferences

### 📅 **Calendar Integration:**
- View all events and deadlines
- Sync with device calendar
- Set personal reminders

---

## 🔄 **Role Switching:**

### **To Switch Roles:**
1. **Go to Profile** → Tap logout button
2. **Return to Login Screen**
3. **Select Different Role** (Admin/Student)
4. **Use Demo Credentials** for quick testing
5. **Login** to access different dashboard

---

## 🎯 **Admin vs Student Comparison:**

| Feature | Admin | Student |
|---------|-------|---------|
| **Dashboard** | Management overview | Personal overview |
| **Create Assignments** | ✅ Yes | ❌ No |
| **Create Events** | ✅ Yes | ❌ No |
| **View All Students** | ✅ Yes | ❌ No |
| **Review Submissions** | ✅ Yes | ❌ No |
| **Send Notifications** | ✅ Yes | ❌ No |
| **Personal Calendar** | ❌ No | ✅ Yes |
| **Join Clubs** | ❌ No | ✅ Yes |
| **Personal Deadlines** | ❌ No | ✅ Yes |

---

## 🛠️ **Technical Implementation:**

### **Authentication Flow:**
1. **Login Screen** → Role selection + credentials
2. **Auth Service** → Validates credentials and role
3. **App Navigation** → Routes to appropriate dashboard
4. **Role-Based UI** → Different features based on role

### **Data Structure:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  department?: string;
  studentId?: string;
}
```

### **Storage:**
- User data stored locally with AsyncStorage
- Role-based access control
- Session management

---

## 🎉 **Ready for Hackathon Demo!**

### **Demo Scenarios:**

#### **Admin Demo:**
1. Login as admin
2. Show dashboard with student stats
3. Demonstrate adding assignments
4. Show pending submissions
5. Send notifications

#### **Student Demo:**
1. Login as student  
2. Show personal dashboard
3. View upcoming events/deadlines
4. Demonstrate calendar features
5. Show profile management

### **Key Features:**
- ✅ **Role-based authentication**
- ✅ **Different dashboards per role**
- ✅ **Admin management tools**
- ✅ **Student personal tools**
- ✅ **Interactive UI elements**
- ✅ **Demo credentials for testing**

**🎯 Perfect for showcasing role-based access control in your hackathon!** 