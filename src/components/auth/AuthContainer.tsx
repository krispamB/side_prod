'use client';

import React, { useState } from 'react';
import { WelcomePage, SignUpForm, SignInForm } from './index';

type AuthView = 'welcome' | 'signup' | 'signin';

export default function AuthContainer() {
    const [currentView, setCurrentView] = useState<AuthView>('welcome');

    const handleShowSignUp = () => setCurrentView('signup');
    const handleShowSignIn = () => setCurrentView('signin');
    const handleBackToWelcome = () => setCurrentView('welcome');

    // Smooth transitions between auth states
    const renderCurrentView = () => {
        switch (currentView) {
            case 'welcome':
                return (
                    <WelcomePage
                        onShowSignUp={handleShowSignUp}
                        onShowSignIn={handleShowSignIn}
                    />
                );
            case 'signup':
                return (
                    <SignUpForm
                        onBackToWelcome={handleBackToWelcome}
                        onShowSignIn={handleShowSignIn}
                    />
                );
            case 'signin':
                return (
                    <SignInForm
                        onBackToWelcome={handleBackToWelcome}
                        onShowSignUp={handleShowSignUp}
                    />
                );
            default:
                return (
                    <WelcomePage
                        onShowSignUp={handleShowSignUp}
                        onShowSignIn={handleShowSignIn}
                    />
                );
        }
    };

    return (
        <div className="transition-all duration-300 ease-in-out">
            {renderCurrentView()}
        </div>
    );
}