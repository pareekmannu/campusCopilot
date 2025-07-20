# Campus Copilot - Your Personal College Assistant

A smart mobile app that helps students keep track of classes, club events, notices, and deadlines – all in one place with calendar sync and reminders.

## 🚀 Features

### Core Features
- **Smart Dashboard** - Overview of upcoming events, deadlines, and notifications
- **Calendar Integration** - Sync with device calendar and manage events
- **Deadline Tracking** - Never miss important assignments or exams
- **Club Management** - Track club events and memberships
- **Push Notifications** - Smart reminders for events and deadlines
- **Offline Support** - Works without internet connection

### Advanced Features
- **Smart Suggestions** - AI-powered deadline predictions
- **Event Sharing** - Share events with friends
- **Analytics** - Study patterns and attendance tracking
- **Dark Mode** - Comfortable viewing in any lighting
- **Multi-language Support** - Available in multiple languages

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Hooks + Context API
- **Storage**: AsyncStorage for local data
- **Calendar**: Expo Calendar API
- **Notifications**: Expo Notifications
- **UI Components**: Custom components with Tailwind-inspired styling
- **Icons**: Expo Vector Icons (Ionicons)

## 📱 Screenshots

The app includes the following main screens:
- **Dashboard** - Overview with quick stats and upcoming items
- **Calendar** - Monthly/weekly calendar view
- **Events** - Event management and creation
- **Clubs** - Club discovery and management
- **Notifications** - All notifications and reminders
- **Profile** - User settings and preferences

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusCopilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (Mac only)
   - Scan QR code with Expo Go app on your phone

### Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production
npm run build

# Eject from Expo (if needed)
npm run eject
```

## 📁 Project Structure

```
CampusCopilot/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Main app screens
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API and external services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── config/             # App configuration
├── assets/                 # Images, fonts, and static files
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PROJECT_ID=your-expo-project-id
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### Firebase Setup (Optional)
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Add your Firebase config to `src/config/firebase.ts`
4. Update the project ID in notification service

## 📱 App Permissions

The app requires the following permissions:
- **Calendar** - To sync events and create reminders
- **Notifications** - To send push notifications
- **Camera Roll** - To save event images (optional)

## 🎨 Customization

### Colors and Themes
Edit `src/utils/constants.ts` to customize:
- Color palette
- Spacing and sizing
- Font families
- API endpoints

### Styling
The app uses a custom styling system inspired by Tailwind CSS. All styles are defined in the component files using StyleSheet.

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### Manual Build
```bash
# Eject from Expo
npm run eject

# Build for Android
cd android && ./gradlew assembleRelease

# Build for iOS
cd ios && xcodebuild -workspace CampusCopilot.xcworkspace -scheme CampusCopilot -configuration Release
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the amazing development platform
- React Native community for the excellent ecosystem
- All contributors and testers

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@campuscopilot.com
- Documentation: [docs.campuscopilot.com](https://docs.campuscopilot.com)

---

**Campus Copilot** - Making college life easier, one reminder at a time! 🎓✨ 