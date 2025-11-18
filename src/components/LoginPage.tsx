import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Lock, ShieldCheck, Mail, Eye, EyeOff, User, Sparkles, Copy, Check } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  // Generate a strong password
  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Ensure at least one of each required character type
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill the rest randomly (total length: 12-16 characters)
    const allChars = lowercase + uppercase + numbers + specialChars;
    const remainingLength = 8 + Math.floor(Math.random() * 5); // 8-12 more chars
    
    for (let i = 0; i < remainingLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleSuggestPassword = () => {
    const suggestedPassword = generateStrongPassword();
    setSignupPassword(suggestedPassword);
    setSignupConfirmPassword(suggestedPassword);
    setShowPassword(true);
    setSuccess('Strong password generated! You can copy it or modify it as needed.');
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleCopyPassword = async () => {
    if (signupPassword) {
      await navigator.clipboard.writeText(signupPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!loginEmail || !loginPassword) {
        throw new Error('Please fill in all fields');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // Handle email not confirmed error
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address. Check your inbox for the confirmation link.');
        }
        throw error;
      }

      if (data.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!signupEmail || !signupPassword || !signupConfirmPassword || !signupName) {
        throw new Error('Please fill in all fields');
      }

      if (signupPassword !== signupConfirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (signupPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Validate password strength
      const hasLowerCase = /[a-z]/.test(signupPassword);
      const hasUpperCase = /[A-Z]/.test(signupPassword);
      const hasNumber = /[0-9]/.test(signupPassword);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':",.<>?/`~|\\]/.test(signupPassword);

      if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
        throw new Error(
          'Password must contain at least: one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*()_+-=[]{};\':"|<>?,./`~)'
        );
      }

      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
            name: signupName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          setSuccess('Account already exists. Please sign in instead.');
        } else if (data.session) {
          // User is automatically signed in (email confirmation disabled)
          setSuccess('Account created successfully! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          // Email confirmation required
          setSuccess('Account created! Please check your email to verify your account before signing in.');
        }
        // Clear signup form
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setSignupName('');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-gray-900 mb-2">Lab Record Generator</h1>
          <p className="text-gray-600">
            Sign in to access your lab records
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-300 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-300 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min. 6 characters)"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must include: lowercase, uppercase, number, and special character
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    onClick={handleSuggestPassword}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Suggest Password
                  </Button>
                  {signupPassword && (
                    <Button
                      type="button"
                      onClick={handleCopyPassword}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {passwordCopied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or sign up with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800 mb-1">Secure Authentication</p>
              <p className="text-xs leading-relaxed">
                Your credentials are secured by Supabase Auth with industry-standard encryption. You must be signed in to generate or download lab records.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Developed by SHANMUGAKARTHIK G<br />
            Saveetha Engineering College
          </p>
        </div>
      </div>
    </div>
  );
}