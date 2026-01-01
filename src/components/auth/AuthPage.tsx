
import React, { useState } from 'react';
import { WebsiteSettings } from '../../App';

interface AuthPageProps {
    settings: WebsiteSettings;
    onLogin: (email: string, password: string) => boolean;
    onSignup: (email: string, password: string) => { success: boolean, message: string };
    onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ settings, onLogin, onSignup, onBack }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLoginView) {
            if (!onLogin(email, password)) setError('Invalid email or password.');
        } else {
            if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
            if (password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
            const result = onSignup(email, password);
            if (!result.success) setError(result.message);
        }
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError(''); setEmail(''); setPassword(''); setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const EyeIcon = ({ visible, onClick }: { visible: boolean, onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
            {visible ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.742L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
             <div className="absolute top-4 left-4">
                <button onClick={onBack} className="text-primary font-semibold hover:underline">
                    &larr; Back
                </button>
            </div>
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border">
                <h1 className="text-3xl font-bold text-center text-primary">{isLoginView ? 'Login' : 'Create Account'}</h1>
                <p className="text-center text-text-muted mt-2">
                    {isLoginView ? 'Welcome back! Please enter your details.' : 'Join us to start your journey.'}
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Email address" />
                    
                    <div className="relative">
                        <input 
                            id="password" 
                            name="password" 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10" 
                            placeholder="Password" 
                        />
                        <EyeIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />
                    </div>

                    {!isLoginView && (
                        <div className="relative">
                            <input 
                                id="confirm-password" 
                                name="confirm-password" 
                                type={showConfirmPassword ? "text" : "password"} 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10" 
                                placeholder="Confirm Password" 
                            />
                            <EyeIcon visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-primary text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-300 transform active:scale-95">
                        {isLoginView ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                 <div className="mt-6 text-center">
                    <button onClick={toggleView} className="text-sm text-primary hover:underline">
                        {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
